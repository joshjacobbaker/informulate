// Core trivia types
export interface TriviaQuestion {
  question: string
  options: string[]
  correctAnswer: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface TriviaExplanation {
  explanation: string
  reasoning: string
  additionalInfo?: string
}

// OpenAI API request/response types
export interface GenerateQuestionRequest {
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  previousQuestions?: string[] // To avoid duplicates
}

export interface GenerateQuestionResponse {
  question: TriviaQuestion
  success: boolean
  error?: string
}

export interface GenerateExplanationRequest {
  question: string
  correctAnswer: string
  userAnswer: string
  isCorrect: boolean
}

export interface GenerateExplanationResponse {
  explanation: TriviaExplanation
  success: boolean
  error?: string
}

// OpenAI prompt templates
export interface QuestionPromptOptions {
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  numOptions?: number
  avoidTopics?: string[]
}

export interface ExplanationPromptOptions {
  includeAdditionalInfo?: boolean
  tone?: 'educational' | 'casual' | 'encouraging'
}

// Error types
export interface OpenAIError {
  type: 'api_error' | 'rate_limit' | 'invalid_request' | 'timeout' | 'unknown'
  message: string
  code?: string
  retryable: boolean
}

// Configuration types
export interface OpenAIConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
}

// Categories for trivia questions
export const TRIVIA_CATEGORIES = [
  'General Knowledge',
  'Science & Nature',
  'History',
  'Geography',
  'Sports',
  'Entertainment',
  'Technology',
  'Literature',
  'Art & Culture',
  'Politics',
  'Mathematics',
  'Food & Drink'
] as const

export type TriviaCategory = typeof TRIVIA_CATEGORIES[number]

// Difficulty levels
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]
