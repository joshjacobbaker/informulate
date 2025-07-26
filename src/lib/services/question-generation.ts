import { createClient } from '@supabase/supabase-js'
import { openAIService } from '@/lib/openai'
import type { Database } from '@/lib/supabase/types'

export interface QuestionGenerationRequest {
  sessionId: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  useAI?: boolean
}

export interface QuestionGenerationResponse {
  success: boolean
  question?: {
    id: string
    question: string
    options: string[]
    correctAnswer: string
    category: string
    difficulty: string
  }
  questionSource?: 'database' | 'ai-generated' | 'ai-temporary' | 'fallback'
  error?: string
  timestamp: string
}

export class QuestionGenerationService {
  
  /**
   * Create a Supabase client for server-side operations
   */
  private createSupabaseClient() {
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  
  /**
   * Generate a question for a game session
   */
  async generateQuestion(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    const { sessionId, category, difficulty = 'medium', useAI = true } = request
    
    try {
      // 1. Try to get an unused question from the database
      const databaseQuestion = await this.getRandomDatabaseQuestion(sessionId, category, difficulty)
      
      if (databaseQuestion) {
        await this.recordQuestionHistory(sessionId, databaseQuestion.id)
        return {
          success: true,
          question: databaseQuestion,
          questionSource: 'database',
          timestamp: new Date().toISOString()
        }
      }
      
      // 2. If no database question, try AI generation
      if (useAI) {
        const aiQuestion = await this.generateAIQuestion(sessionId, category, difficulty)
        
        if (aiQuestion) {
          return {
            success: true,
            question: aiQuestion.question,
            questionSource: aiQuestion.source,
            timestamp: new Date().toISOString()
          }
        }
      }
      
      // 3. Fall back to hardcoded questions
      const fallbackQuestion = this.getFallbackQuestion()
      
      return {
        success: true,
        question: fallbackQuestion,
        questionSource: 'fallback',
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('❌ Error generating question:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  /**
   * Get a random unused question from the database
   */
  private async getRandomDatabaseQuestion(
    sessionId: string, 
    category?: string, 
    difficulty?: 'easy' | 'medium' | 'hard'
  ) {
    const supabase = this.createSupabaseClient()
    
    const { data: questions, error } = await supabase
      .rpc('get_random_question', {
        p_session_id: sessionId,
        p_category: category || null,
        p_difficulty: difficulty || null
      })
      
    if (error) {
      console.warn('⚠️  Database question query failed:', error)
      return null
    }
    
    if (!questions || questions.length === 0) {
      return null
    }
    
    const question = questions[0]
    return {
      id: question.id,
      question: question.question_text,
      options: question.options,
      correctAnswer: question.correct_answer,
      category: question.category,
      difficulty: question.difficulty
    }
  }
  
  /**
   * Generate a question using AI
   */
  private async generateAIQuestion(sessionId: string, category?: string, difficulty?: 'easy' | 'medium' | 'hard') {
    try {
      // Get previously asked questions to avoid duplicates
      const previousQuestions = await this.getPreviousQuestions(sessionId)
      
      const aiResult = await openAIService.generateQuestion({
        category,
        difficulty,
        previousQuestions
      })
      
      if (!aiResult.success) {
        console.error('❌ AI question generation failed:', aiResult.error)
        return null
      }
      
      // Try to save the AI-generated question to the database
      const savedQuestion = await this.saveAIQuestion(aiResult.question, category, difficulty)
      
      if (savedQuestion) {
        await this.recordQuestionHistory(sessionId, savedQuestion.id)
        return {
          question: savedQuestion,
          source: 'ai-generated' as const
        }
      } else {
        // Use temporary question if we couldn't save it
        return {
          question: {
            id: `temp-${Date.now()}`,
            question: aiResult.question.question,
            options: aiResult.question.options,
            correctAnswer: aiResult.question.correctAnswer,
            category: aiResult.question.category || category || 'General Knowledge',
            difficulty: aiResult.question.difficulty || difficulty || 'medium'
          },
          source: 'ai-temporary' as const
        }
      }
      
    } catch (error) {
      console.error('❌ AI question generation error:', error)
      return null
    }
  }
  
  /**
   * Get previously asked questions for the session
   */
  private async getPreviousQuestions(sessionId: string): Promise<string[]> {
    const supabase = this.createSupabaseClient()
    
    const { data: questionHistory } = await supabase
      .from('question_history')
      .select('questions(question_text)')
      .eq('session_id', sessionId)
      .limit(20)
      
    return questionHistory
      ?.map(h => {
        const questions = h.questions as unknown as { question_text: string } | null
        return questions?.question_text
      })
      .filter((q): q is string => Boolean(q)) || []
  }
  
  /**
   * Save an AI-generated question to the database
   */
  private async saveAIQuestion(
    question: { question: string; options: string[]; correctAnswer: string; category?: string; difficulty?: string }, 
    category?: string, 
    difficulty?: 'easy' | 'medium' | 'hard'
  ) {
    try {
      const supabase = this.createSupabaseClient()
      
      const { data: savedQuestion, error } = await supabase
        .from('questions')
        .insert({
          question_text: question.question,
          options: question.options,
          correct_answer: question.correctAnswer,
          category: question.category || category || 'General Knowledge',
          difficulty: question.difficulty || difficulty || 'medium',
          explanation: 'AI-generated question'
        })
        .select()
        .single()
        
      if (error) {
        console.warn('⚠️  Could not save AI question to database:', error)
        return null
      }
      
      return {
        id: savedQuestion.id,
        question: savedQuestion.question_text,
        options: savedQuestion.options,
        correctAnswer: savedQuestion.correct_answer,
        category: savedQuestion.category,
        difficulty: savedQuestion.difficulty
      }
      
    } catch (error) {
      console.warn('⚠️  Error saving AI question:', error)
      return null
    }
  }
  
  /**
   * Record that a question was asked in a session
   */
  private async recordQuestionHistory(sessionId: string, questionId: string) {
    if (questionId.startsWith('temp-') || questionId.startsWith('fallback-')) {
      return // Don't record temporary or fallback questions
    }
    
    try {
      const supabase = this.createSupabaseClient()
      
      const { error } = await supabase
        .from('question_history')
        .insert({
          session_id: sessionId,
          question_id: questionId
        })
        
      if (error) {
        console.warn('⚠️  Could not record question history:', error)
      }
    } catch (error) {
      console.warn('⚠️  Error recording question history:', error)
    }
  }
  
  /**
   * Get a fallback question when all else fails
   */
  private getFallbackQuestion() {
    const fallbackQuestions = [
      {
        id: 'fallback-1',
        question: 'What is the capital of France?',
        options: ['A. London', 'B. Berlin', 'C. Paris', 'D. Madrid'],
        correctAnswer: 'C',
        category: 'Geography',
        difficulty: 'easy'
      },
      {
        id: 'fallback-2',
        question: 'Which planet is known as the Red Planet?',
        options: ['A. Venus', 'B. Mars', 'C. Jupiter', 'D. Saturn'],
        correctAnswer: 'B',
        category: 'Science & Nature',
        difficulty: 'easy'
      },
      {
        id: 'fallback-3',
        question: 'What is 2 + 2?',
        options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
        correctAnswer: 'B',
        category: 'Mathematics',
        difficulty: 'easy'
      }
    ]
    
    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]
  }
}

// Export singleton instance
export const questionGenerationService = new QuestionGenerationService()
