import { Question, ValidatedQuestionSet } from '../../types/questions';

interface Statement {
  run<T = unknown>(): Promise<T>;
}

interface BoundStatement extends Statement {
  bind(...values: unknown[]): BoundStatement;
}

export interface D1Database {
  prepare(query: string): BoundStatement;
}

export class QuestionRepository {
  constructor(private readonly db: D1Database | null) {}

  async persistQuestionSet(questionSet: ValidatedQuestionSet): Promise<void> {
    if (!this.db) {
      console.warn('No D1 binding provided. Skipping persistence.');
      return;
    }

    await this.db
      .prepare(
        `INSERT INTO question_sets (id, categories, difficulty, source, created_at, quality_score, confidence, valid_questions, invalid_questions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        questionSet.id,
        questionSet.categories.join(','),
        questionSet.difficulty,
        questionSet.source,
        questionSet.createdAt,
        questionSet.qualityScore,
        questionSet.confidence,
        questionSet.validCount,
        questionSet.invalidCount
      )
      .run();

    for (const question of questionSet.questions) {
      await this.persistQuestion(questionSet.id, question);
    }
  }

  async persistQuestion(questionSetId: string, question: Question): Promise<void> {
    if (!this.db) {
      return;
    }

    await this.db
      .prepare(
        `INSERT INTO questions (id, question_set_id, prompt, options, correct_option, category, difficulty, source, quality_score, confidence, is_valid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        question.id,
        questionSetId,
        question.prompt,
        JSON.stringify(question.options),
        question.correctOption,
        question.category,
        question.difficulty,
        question.source,
        question.metadata?.qualityScore ?? question.validation?.qualityScore ?? 0,
        question.metadata?.confidence ?? question.validation?.confidence ?? 0,
        question.validation?.valid ?? false
      )
      .run();
  }

  async getQuestionsByQuality(minScore = 0, minConfidence = 0) {
    if (!this.db) {
      console.warn('No D1 binding provided. Unable to query.');
      return [];
    }

    const statement = this.db.prepare(
      `SELECT id, question_set_id, prompt, options, correct_option, category, difficulty, source, quality_score, confidence
       FROM questions WHERE quality_score >= ? AND confidence >= ? AND is_valid = 1`
    );

    const rows = (await statement.bind(minScore, minConfidence).run<{ results?: unknown[] }>()).results ?? [];
    return rows.map((row) => ({
      ...row,
      options: JSON.parse((row as { options: string }).options),
    }));
  }
}
