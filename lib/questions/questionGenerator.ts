import { randomUUID } from 'crypto';
import { Difficulty, Question, QuestionOption, QuestionSet } from '../../types/questions';
import { LlmClient } from './llmClient';

interface LlmQuestionSetResponse {
  categories: string[];
  difficulty: Difficulty;
  questions: Array<{
    prompt: string;
    options: string[];
    correct_option: string;
    category: string;
  }>;
}

const fallbackQuestionSet: LlmQuestionSetResponse = {
  categories: ['general'],
  difficulty: 'medium',
  questions: [
    {
      prompt: 'What is the capital of France?',
      options: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
      correct_option: 'Paris',
      category: 'geography',
    },
    {
      prompt: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      correct_option: 'Mars',
      category: 'science',
    },
  ],
};

export class QuestionGenerator {
  constructor(private readonly llmClient: LlmClient) {}

  async generateQuestionSet(categories: string[], difficulty: Difficulty): Promise<QuestionSet> {
    const prompt = `Create a set of 5 trivia questions for categories ${categories.join(
      ', '
    )} at ${difficulty} difficulty. Respond with JSON: {"categories": string[], "difficulty": "easy|medium|hard", "questions": [{"prompt": string, "options": string[4], "correct_option": string, "category": string}]}`;

    const { content } = await this.llmClient.generateStructuredJson<LlmQuestionSetResponse>(
      prompt,
      fallbackQuestionSet
    );

    const questions: Question[] = content.questions.map((question, index) => {
      const options: QuestionOption[] = question.options.map((option, optionIndex) => ({
        id: `${index}-${optionIndex}`,
        value: option,
      }));

      return {
        id: randomUUID(),
        prompt: question.prompt,
        category: question.category ?? categories[0] ?? 'general',
        difficulty: content.difficulty ?? difficulty,
        options,
        correctOption: question.correct_option,
        source: 'ai',
      };
    });

    return {
      id: randomUUID(),
      categories: content.categories ?? categories,
      difficulty: content.difficulty ?? difficulty,
      questions,
      createdAt: new Date().toISOString(),
      source: 'ai',
    };
  }
}
