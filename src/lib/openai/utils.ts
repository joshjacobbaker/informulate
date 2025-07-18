import type { TriviaQuestion, TriviaCategory, DifficultyLevel } from './types'

// Utility functions for OpenAI integration

/**
 * Extract the letter (A, B, C, D) from an option string
 */
export function extractOptionLetter(option: string): string {
  const match = option.match(/^([A-E])\./);
  return match ? match[1] : option.charAt(0).toUpperCase();
}

/**
 * Format options with letters if they don't already have them
 */
export function formatOptions(options: string[]): string[] {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  
  return options.map((option, index) => {
    // If option already has a letter prefix, return as is
    if (/^[A-E]\./.test(option)) {
      return option;
    }
    
    // Otherwise, add letter prefix
    return `${letters[index]}. ${option}`;
  });
}

/**
 * Validate that a correct answer matches one of the options
 */
export function validateCorrectAnswer(question: TriviaQuestion): boolean {
  const correctLetter = question.correctAnswer.toUpperCase();
  return question.options.some(option => 
    extractOptionLetter(option) === correctLetter
  );
}

/**
 * Get the full text of the correct answer from the options
 */
export function getCorrectAnswerText(question: TriviaQuestion): string | null {
  const correctLetter = question.correctAnswer.toUpperCase();
  const correctOption = question.options.find(option => 
    extractOptionLetter(option) === correctLetter
  );
  
  if (!correctOption) return null;
  
  // Remove the letter prefix to get just the answer text
  return correctOption.replace(/^[A-E]\.\s*/, '');
}

/**
 * Shuffle array in place (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a random category
 */
export function getRandomCategory(): TriviaCategory {
  const categories: TriviaCategory[] = [
    'General Knowledge',
    'Science & Nature',
    'History',
    'Geography',
    'Sports',
    'Entertainment',
    'Technology',
    'Literature',
    'Art & Culture'
  ];
  
  return categories[Math.floor(Math.random() * categories.length)];
}

/**
 * Generate a random difficulty level
 */
export function getRandomDifficulty(): DifficultyLevel {
  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

/**
 * Sanitize text to remove potentially harmful content
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If we can break at a word boundary, do so
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Check if a question is suitable (basic content validation)
 */
export function isQuestionSuitable(question: TriviaQuestion): {
  suitable: boolean;
  reason?: string;
} {
  // Check question length
  if (question.question.length < 10) {
    return { suitable: false, reason: 'Question too short' };
  }
  
  if (question.question.length > 500) {
    return { suitable: false, reason: 'Question too long' };
  }
  
  // Check number of options
  if (question.options.length < 3 || question.options.length > 5) {
    return { suitable: false, reason: 'Invalid number of options' };
  }
  
  // Check if all options are unique
  const uniqueOptions = new Set(question.options.map(option => 
    option.replace(/^[A-E]\.\s*/, '').toLowerCase()
  ));
  
  if (uniqueOptions.size !== question.options.length) {
    return { suitable: false, reason: 'Duplicate options found' };
  }
  
  // Check if correct answer is valid
  if (!validateCorrectAnswer(question)) {
    return { suitable: false, reason: 'Invalid correct answer' };
  }
  
  return { suitable: true };
}

/**
 * Calculate difficulty score based on question characteristics
 */
export function calculateDifficultyScore(question: TriviaQuestion): number {
  let score = 0;
  
  // Base difficulty
  switch (question.difficulty) {
    case 'easy': score += 1; break;
    case 'medium': score += 2; break;
    case 'hard': score += 3; break;
  }
  
  // Question length (longer = potentially harder)
  if (question.question.length > 100) score += 0.5;
  
  // Number of options (more options = harder)
  score += (question.options.length - 3) * 0.3;
  
  // Category complexity
  const complexCategories = ['Science & Nature', 'Technology', 'Mathematics', 'Politics'];
  if (complexCategories.includes(question.category || '')) {
    score += 0.5;
  }
  
  return Math.min(score, 5); // Cap at 5
}

/**
 * Format question for display
 */
export function formatQuestionForDisplay(question: TriviaQuestion): {
  question: string;
  options: { letter: string; text: string; isCorrect: boolean }[];
  category: string;
  difficulty: string;
} {
  return {
    question: sanitizeText(question.question),
    options: question.options.map(option => {
      const letter = extractOptionLetter(option);
      const text = option.replace(/^[A-E]\.\s*/, '');
      return {
        letter,
        text: sanitizeText(text),
        isCorrect: letter === question.correctAnswer.toUpperCase()
      };
    }),
    category: question.category || 'General Knowledge',
    difficulty: question.difficulty || 'medium'
  };
}
