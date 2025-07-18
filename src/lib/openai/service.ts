import { openAIClient } from './client'
import { PromptTemplates } from './prompts'
import type {
  TriviaQuestion,
  TriviaExplanation,
  GenerateQuestionRequest,
  GenerateQuestionResponse,
  GenerateExplanationRequest,
  GenerateExplanationResponse,
  OpenAIError,
  TriviaCategory,
  DifficultyLevel
} from './types'

export class OpenAIService {
  private maxRetries = 3
  private retryDelay = 1000 // 1 second

  // Generate a trivia question
  async generateQuestion(request: GenerateQuestionRequest): Promise<GenerateQuestionResponse> {
    try {
      const prompt = PromptTemplates.generateQuestionPrompt({
        category: request.category,
        difficulty: request.difficulty,
        numOptions: 4,
        avoidTopics: request.previousQuestions || []
      })

      const response = await this.callOpenAIWithRetry(prompt)
      
      if (!response) {
        return {
          question: this.getFallbackQuestion(),
          success: false,
          error: 'Failed to generate question from OpenAI'
        }
      }

      const parsedQuestion = PromptTemplates.parseJSONResponse<TriviaQuestion>(response)
      
      if (!parsedQuestion || !this.validateTriviaQuestion(parsedQuestion)) {
        return {
          question: this.getFallbackQuestion(),
          success: false,
          error: 'Invalid question format received from OpenAI'
        }
      }

      return {
        question: parsedQuestion,
        success: true
      }
    } catch (error) {
      console.error('Error generating question:', error)
      return {
        question: this.getFallbackQuestion(),
        success: false,
        error: this.parseError(error).message
      }
    }
  }

  // Generate an explanation for an answer
  async generateExplanation(request: GenerateExplanationRequest): Promise<GenerateExplanationResponse> {
    try {
      const prompt = PromptTemplates.generateExplanationPrompt(
        request.question,
        request.correctAnswer,
        request.userAnswer,
        request.isCorrect,
        {
          includeAdditionalInfo: true,
          tone: 'encouraging'
        }
      )

      const response = await this.callOpenAIWithRetry(prompt)
      
      if (!response) {
        return {
          explanation: this.getFallbackExplanation(request.isCorrect),
          success: false,
          error: 'Failed to generate explanation from OpenAI'
        }
      }

      const parsedExplanation = PromptTemplates.parseJSONResponse<TriviaExplanation>(response)
      
      if (!parsedExplanation || !this.validateTriviaExplanation(parsedExplanation)) {
        return {
          explanation: this.getFallbackExplanation(request.isCorrect),
          success: false,
          error: 'Invalid explanation format received from OpenAI'
        }
      }

      return {
        explanation: parsedExplanation,
        success: true
      }
    } catch (error) {
      console.error('Error generating explanation:', error)
      return {
        explanation: this.getFallbackExplanation(request.isCorrect),
        success: false,
        error: this.parseError(error).message
      }
    }
  }

  // Generate a question for a specific category
  async generateCategoryQuestion(
    category: TriviaCategory,
    difficulty: DifficultyLevel = 'medium'
  ): Promise<GenerateQuestionResponse> {
    return this.generateQuestion({ category, difficulty })
  }

  // Call OpenAI with retry logic
  private async callOpenAIWithRetry(prompt: string, attempt = 1): Promise<string | null> {
    try {
      return await openAIClient.createCompletion(prompt)
    } catch (error) {
      const openAIError = this.parseError(error)
      
      if (attempt < this.maxRetries && openAIError.retryable) {
        console.warn(`OpenAI attempt ${attempt} failed, retrying...`, openAIError.message)
        await this.delay(this.retryDelay * attempt)
        return this.callOpenAIWithRetry(prompt, attempt + 1)
      }
      
      throw error
    }
  }

  // Validate trivia question structure
  private validateTriviaQuestion(question: unknown): question is TriviaQuestion {
    if (typeof question !== 'object' || question === null) {
      return false
    }
    
    const q = question as Record<string, unknown>
    
    return (
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.length >= 3 &&
      typeof q.correctAnswer === 'string' &&
      q.options.every(option => typeof option === 'string') &&
      q.options.some((option: string) => option.startsWith(q.correctAnswer as string))
    )
  }

  // Validate trivia explanation structure
  private validateTriviaExplanation(explanation: unknown): explanation is TriviaExplanation {
    if (typeof explanation !== 'object' || explanation === null) {
      return false
    }
    
    const e = explanation as Record<string, unknown>
    
    return (
      typeof e.explanation === 'string' &&
      typeof e.reasoning === 'string'
    )
  }

  // Get fallback question if OpenAI fails
  private getFallbackQuestion(): TriviaQuestion {
    const fallbacks = [
      {
        question: "What is the capital of France?",
        options: ["A. London", "B. Berlin", "C. Paris", "D. Madrid"],
        correctAnswer: "C",
        category: "Geography",
        difficulty: "easy" as const
      },
      {
        question: "What is 2 + 2?",
        options: ["A. 3", "B. 4", "C. 5", "D. 6"],
        correctAnswer: "B",
        category: "Mathematics",
        difficulty: "easy" as const
      },
      {
        question: "What color do you get when you mix red and blue?",
        options: ["A. Green", "B. Yellow", "C. Purple", "D. Orange"],
        correctAnswer: "C",
        category: "General Knowledge",
        difficulty: "easy" as const
      }
    ]
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  // Get fallback explanation if OpenAI fails
  private getFallbackExplanation(isCorrect: boolean): TriviaExplanation {
    if (isCorrect) {
      return {
        explanation: "Congratulations! You got it right.",
        reasoning: "Your answer was correct based on the given information.",
        additionalInfo: "Keep up the great work!"
      }
    } else {
      return {
        explanation: "That's not quite right, but don't worry!",
        reasoning: "The correct answer provides the most accurate information for this question.",
        additionalInfo: "Every mistake is a learning opportunity."
      }
    }
  }

  // Parse error into standardized format
  private parseError(error: unknown): OpenAIError {
    if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>
      
      if (e.code === 'rate_limit_exceeded') {
        return {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Please try again later.',
          code: e.code as string,
          retryable: true
        }
      }
      
      if (e.code === 'invalid_api_key') {
        return {
          type: 'api_error',
          message: 'Invalid API key configuration.',
          code: e.code as string,
          retryable: false
        }
      }
      
      if (e.name === 'TimeoutError') {
        return {
          type: 'timeout',
          message: 'Request timed out. Please try again.',
          retryable: true
        }
      }
      
      return {
        type: 'unknown',
        message: typeof e.message === 'string' ? e.message : 'An unknown error occurred.',
        retryable: true
      }
    }
    
    return {
      type: 'unknown',
      message: 'An unknown error occurred.',
      retryable: true
    }
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const openAIService = new OpenAIService()
