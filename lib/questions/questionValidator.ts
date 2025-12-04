import { Question, QuestionSet, ValidatedQuestion, ValidatedQuestionSet, ValidationResult } from '../../types/questions';
import { LlmClient } from './llmClient';

interface RuleCheckOutcome {
  valid: boolean;
  reasons: string[];
}

export class QuestionValidator {
  constructor(private readonly llmClient: LlmClient) {}

  async validateQuestionSet(questionSet: QuestionSet | ValidatedQuestionSet): Promise<ValidatedQuestionSet> {
    const validatedQuestions: ValidatedQuestion[] = [];

    for (const question of questionSet.questions) {
      const ruleResult = this.runRuleChecks(question);
      const aiCritique = await this.runAiCritique(question, ruleResult);
      const validation = this.mergeResults(ruleResult, aiCritique);

      validatedQuestions.push({
        ...question,
        validation,
        metadata: {
          confidence: validation.confidence,
          qualityScore: validation.qualityScore,
        },
      });
    }

    const validCount = validatedQuestions.filter((item) => item.validation.valid).length;
    const invalidCount = validatedQuestions.length - validCount;
    const qualityScore =
      validatedQuestions.reduce((total, question) => total + question.validation.qualityScore, 0) /
      Math.max(validatedQuestions.length, 1);
    const confidence = Math.min(
      1,
      validatedQuestions.reduce((total, question) => total + question.validation.confidence, 0) /
        Math.max(validatedQuestions.length, 1)
    );

    return {
      ...questionSet,
      questions: validatedQuestions,
      validCount,
      invalidCount,
      qualityScore,
      confidence,
    } as ValidatedQuestionSet;
  }

  filterByQuality(questionSet: ValidatedQuestionSet, { minScore, minConfidence }: { minScore?: number; minConfidence?: number }): ValidatedQuestionSet {
    const filteredQuestions = questionSet.questions.filter((question) => {
      const meetsScore = minScore === undefined || question.validation.qualityScore >= minScore;
      const meetsConfidence = minConfidence === undefined || question.validation.confidence >= minConfidence;
      return question.validation.valid && meetsScore && meetsConfidence;
    });

    const qualityScore =
      filteredQuestions.reduce((total, question) => total + question.validation.qualityScore, 0) /
      Math.max(filteredQuestions.length, 1);
    const confidence =
      filteredQuestions.reduce((total, question) => total + question.validation.confidence, 0) /
      Math.max(filteredQuestions.length, 1);

    return {
      ...questionSet,
      questions: filteredQuestions,
      validCount: filteredQuestions.length,
      invalidCount: questionSet.invalidCount + (questionSet.questions.length - filteredQuestions.length),
      qualityScore,
      confidence,
    };
  }

  private runRuleChecks(question: Question): RuleCheckOutcome {
    const reasons: string[] = [];

    if (!question.prompt.trim()) {
      reasons.push('Missing question prompt');
    }

    if (!question.correctOption) {
      reasons.push('Missing correct option');
    }

    const optionValues = question.options.map((option) => option.value.trim().toLowerCase());
    if (new Set(optionValues).size !== optionValues.length) {
      reasons.push('Duplicate options detected');
    }

    if (!optionValues.includes(question.correctOption.trim().toLowerCase())) {
      reasons.push('Correct option is not among the provided options');
    }

    if (question.options.length < 2) {
      reasons.push('At least two options are required');
    }

    return { valid: reasons.length === 0, reasons };
  }

  private async runAiCritique(question: Question, ruleResult: RuleCheckOutcome): Promise<ValidationResult> {
    const prompt = `Evaluate the quality of this multiple-choice question. Respond with JSON: {"valid": boolean, "reasons": string[], "qualityScore": number (0-1), "confidence": number (0-1)}. Question: ${question.prompt}. Options: ${question.options
      .map((option) => option.value)
      .join(', ')}. Correct: ${question.correctOption}. Prior rule evaluation found: ${
      ruleResult.reasons.length > 0 ? ruleResult.reasons.join('; ') : 'no issues'
    }.`;

    const fallback: ValidationResult = {
      valid: ruleResult.valid,
      reasons: ruleResult.reasons,
      qualityScore: ruleResult.valid ? 0.72 : 0.2,
      confidence: ruleResult.valid ? 0.65 : 0.35,
      reviewer: 'ai_critic',
      source: question.source,
    };

    const { content } = await this.llmClient.generateStructuredJson<ValidationResult>(prompt, fallback);

    return {
      valid: content.valid,
      reasons: content.reasons ?? fallback.reasons,
      qualityScore: Math.min(Math.max(content.qualityScore ?? fallback.qualityScore, 0), 1),
      confidence: Math.min(Math.max(content.confidence ?? fallback.confidence, 0), 1),
      reviewer: 'ai_critic',
      source: question.source,
    };
  }

  private mergeResults(ruleResult: RuleCheckOutcome, aiResult: ValidationResult): ValidationResult {
    const valid = ruleResult.valid && aiResult.valid;
    const reasons = [...new Set([...(aiResult.reasons ?? []), ...(ruleResult.reasons ?? [])])];
    const qualityScore = valid
      ? Math.min(1, (aiResult.qualityScore + (ruleResult.valid ? 0.25 : 0)) / 1.25)
      : Math.min(aiResult.qualityScore, 0.4);

    const confidence = valid
      ? Math.min(1, (aiResult.confidence + 0.2) / 1.2)
      : Math.min(aiResult.confidence, 0.5);

    return {
      valid,
      reasons,
      qualityScore,
      confidence,
      reviewer: aiResult.reviewer,
      source: aiResult.source,
    };
  }
}
