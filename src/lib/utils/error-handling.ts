/**
 * Error handling utilities and retry logic for API endpoints
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryOn?: (error: Error) => boolean
}

export interface ApiError extends Error {
  status?: number
  code?: string
  details?: Record<string, unknown>
}

export class ApiErrorHandler {
  /**
   * Create a standardized API error
   */
  static createError(
    message: string,
    status: number = 500,
    code?: string,
    details?: Record<string, unknown>
  ): ApiError {
    const error = new Error(message) as ApiError
    error.status = status
    error.code = code
    error.details = details
    return error
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      retryOn = (error) => !error.message.includes('400') // Don't retry client errors
    } = options

    let lastError: Error
    let delay = initialDelay

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Don't retry if this is the last attempt or error is not retryable
        if (attempt === maxRetries || !retryOn(lastError)) {
          throw lastError
        }

        console.warn(`⚠️  Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message)
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Increase delay for next attempt (exponential backoff)
        delay = Math.min(delay * backoffMultiplier, maxDelay)
      }
    }

    throw lastError!
  }

  /**
   * Handle database operation errors
   */
  static handleDatabaseError(error: unknown, operation: string): ApiError {
    console.error(`❌ Database error during ${operation}:`, error)

    const errorObj = error as Record<string, unknown>

    if (errorObj?.code === 'PGRST116') {
      return this.createError(
        'Resource not found',
        404,
        'NOT_FOUND',
        { operation, originalError: error }
      )
    }

    if (errorObj?.code === '23505') {
      return this.createError(
        'Resource already exists',
        409,
        'CONFLICT',
        { operation, originalError: error }
      )
    }

    if (errorObj?.code === '23503') {
      return this.createError(
        'Invalid reference',
        400,
        'INVALID_REFERENCE',
        { operation, originalError: error }
      )
    }

    return this.createError(
      `Database operation failed: ${operation}`,
      500,
      'DATABASE_ERROR',
      { operation, originalError: error }
    )
  }

  /**
   * Handle OpenAI API errors
   */
  static handleOpenAIError(error: unknown): ApiError {
    console.error('❌ OpenAI API error:', error)

    const errorObj = error as Record<string, unknown>

    if (errorObj?.status === 429) {
      return this.createError(
        'Rate limit exceeded',
        429,
        'RATE_LIMIT_EXCEEDED',
        { originalError: error }
      )
    }

    if (errorObj?.status === 401) {
      return this.createError(
        'Invalid API key',
        401,
        'INVALID_API_KEY',
        { originalError: error }
      )
    }

    if (errorObj?.status === 400) {
      return this.createError(
        'Invalid request to OpenAI API',
        400,
        'INVALID_REQUEST',
        { originalError: error }
      )
    }

    return this.createError(
      'OpenAI API error',
      500,
      'OPENAI_ERROR',
      { originalError: error }
    )
  }

  /**
   * Validate request parameters
   */
  static validateRequired(params: Record<string, unknown>, required: string[]): void {
    const missing = required.filter(key => !params[key])
    if (missing.length > 0) {
      throw this.createError(
        `Missing required parameters: ${missing.join(', ')}`,
        400,
        'MISSING_PARAMETERS',
        { missing, provided: Object.keys(params) }
      )
    }
  }

  /**
   * Validate session ID format
   */
  static validateSessionId(sessionId: string): void {
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 1) {
      throw this.createError(
        'Invalid session ID format',
        400,
        'INVALID_SESSION_ID'
      )
    }
  }

  /**
   * Validate question ID format
   */
  static validateQuestionId(questionId: string): void {
    if (!questionId || typeof questionId !== 'string' || questionId.length < 1) {
      throw this.createError(
        'Invalid question ID format',
        400,
        'INVALID_QUESTION_ID'
      )
    }
  }

  /**
   * Validate difficulty level
   */
  static validateDifficulty(difficulty?: string): void {
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      throw this.createError(
        'Invalid difficulty level. Must be easy, medium, or hard',
        400,
        'INVALID_DIFFICULTY'
      )
    }
  }

  /**
   * Validate answer format
   */
  static validateAnswer(answer: string): void {
    if (!answer || typeof answer !== 'string' || answer.length < 1) {
      throw this.createError(
        'Invalid answer format',
        400,
        'INVALID_ANSWER'
      )
    }
  }

  /**
   * Log API request details
   */
  static logRequest(endpoint: string, params: Record<string, unknown>): void {
    console.log(`🔍 API Request - ${endpoint}:`, {
      timestamp: new Date().toISOString(),
      params: this.sanitizeParams(params)
    })
  }

  /**
   * Log API response details
   */
  static logResponse(endpoint: string, success: boolean, duration?: number): void {
    const emoji = success ? '✅' : '❌'
    const durationText = duration ? ` (${duration}ms)` : ''
    console.log(`${emoji} API Response - ${endpoint}${durationText}`)
  }

  /**
   * Sanitize parameters for logging (remove sensitive data)
   */
  private static sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...params }
    
    // Remove sensitive fields
    if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]'
    if (sanitized.serviceRoleKey) sanitized.serviceRoleKey = '[REDACTED]'
    
    return sanitized
  }
}

/**
 * Wrapper for API endpoint functions with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    
    try {
      ApiErrorHandler.logRequest(endpoint, args[0] as Record<string, unknown>)
      const result = await fn(...args)
      ApiErrorHandler.logResponse(endpoint, true, Date.now() - startTime)
      return result
    } catch (error) {
      ApiErrorHandler.logResponse(endpoint, false, Date.now() - startTime)
      throw error
    }
  }
}
