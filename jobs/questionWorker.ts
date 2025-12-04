import fs from 'fs';
import path from 'path';
import { QuestionGenerator } from '../lib/questions/questionGenerator';
import { QuestionValidator } from '../lib/questions/questionValidator';
import { LlmClient } from '../lib/questions/llmClient';
import { QuestionRepository } from '../lib/questions/d1Repository';
import { Difficulty, QuestionSet } from '../types/questions';

const OUTPUT_PATH = process.env.QUESTION_EXPORT_PATH ?? path.join(process.cwd(), 'question-set.json');

function getRequestedDifficulty(): Difficulty {
  const requested = (process.env.QUESTION_DIFFICULTY ?? 'medium').toLowerCase();
  if (requested === 'easy' || requested === 'medium' || requested === 'hard') {
    return requested;
  }
  return 'medium';
}

function getCategories(): string[] {
  const categories = process.env.QUESTION_CATEGORIES;
  if (!categories) {
    return ['general'];
  }
  return categories
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);
}

async function exportQuestionSet(questionSet: QuestionSet) {
  await fs.promises.writeFile(OUTPUT_PATH, JSON.stringify(questionSet, null, 2), 'utf-8');
  console.info(`Question set exported to ${OUTPUT_PATH}`);
}

async function run() {
  const categories = getCategories();
  const difficulty = getRequestedDifficulty();

  const llmClient = new LlmClient();
  const generator = new QuestionGenerator(llmClient);
  const validator = new QuestionValidator(llmClient);

  const rawQuestionSet = await generator.generateQuestionSet(categories, difficulty);
  const validated = await validator.validateQuestionSet(rawQuestionSet);
  const filtered = validator.filterByQuality(validated, {
    minScore: Number(process.env.MIN_QUALITY_SCORE ?? '0.6'),
    minConfidence: Number(process.env.MIN_CONFIDENCE ?? '0.5'),
  });

  const repository = new QuestionRepository((globalThis as { DB?: unknown }).DB as any);
  await repository.persistQuestionSet(filtered);
  await exportQuestionSet(filtered);
}

run().catch((error) => {
  console.error('Failed to generate and persist questions', error);
  process.exit(1);
});
