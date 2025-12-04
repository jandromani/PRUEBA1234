export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  value: string;
}

export interface ValidationResult {
  valid: boolean;
  reasons: string[];
  qualityScore: number;
  confidence: number;
  reviewer: 'ai_critic' | 'rules';
  source: 'ai' | 'human';
}

export interface Question {
  id: string;
  prompt: string;
  category: string;
  difficulty: Difficulty;
  options: QuestionOption[];
  correctOption: string;
  source: 'ai' | 'human';
  validation?: ValidationResult;
  metadata?: {
    confidence?: number;
    qualityScore?: number;
  };
}

export interface QuestionSet {
  id: string;
  categories: string[];
  difficulty: Difficulty;
  questions: Question[];
  createdAt: string;
  source: 'ai' | 'human';
  qualityScore?: number;
  confidence?: number;
}

export interface ValidatedQuestion extends Question {
  validation: ValidationResult;
  metadata: {
    confidence: number;
    qualityScore: number;
  };
}

export interface ValidatedQuestionSet extends QuestionSet {
  questions: ValidatedQuestion[];
  qualityScore: number;
  confidence: number;
  validCount: number;
  invalidCount: number;
}

export interface QualityFilters {
  minScore?: number;
  minConfidence?: number;
}
