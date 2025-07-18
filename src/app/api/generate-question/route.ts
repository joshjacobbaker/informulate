import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { openAIService } from '@/lib/openai'
import { ApiErrorHandler, withErrorHandling } from '@/lib/utils/error-handling'
import type { Database } from '@/lib/supabase/types'

// Initialize Supabase client with service role for server-side operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json()
    const { 
      sessionId, 
      category, 
      difficulty = 'medium',
      useAI = true 
    } = body

    // Validate required fields
    ApiErrorHandler.validateRequired(body, ['sessionId'])
    ApiErrorHandler.validateSessionId(sessionId)
    ApiErrorHandler.validateDifficulty(difficulty)

    console.log(`🎯 Generating question for session: ${sessionId}`)
    console.log(`📊 Category: ${category || 'any'}, Difficulty: ${difficulty}`)

    let question = null
    let questionSource = 'fallback'

    // First, try to get an unused question from the database
    const { data: existingQuestions, error: dbError } = await supabase
      .rpc('get_random_question', {
        p_session_id: sessionId,
        p_category: category || null,
        p_difficulty: difficulty || null
      })

    if (existingQuestions && existingQuestions.length > 0 && !dbError) {
      console.log('📚 Using existing question from database')
      const existingQuestion = existingQuestions[0]
      question = {
        id: existingQuestion.id,
        question: existingQuestion.question_text,
        options: existingQuestion.options,
        correctAnswer: existingQuestion.correct_answer,
        category: existingQuestion.category,
        difficulty: existingQuestion.difficulty
      }
      questionSource = 'database'
    } else if (useAI) {
      // If no database question available, generate with AI
      console.log('🤖 Generating new question with AI')
      
      // Get previously asked questions to avoid duplicates
      const { data: questionHistory } = await supabase
        .from('question_history')
        .select('questions(question_text)')
        .eq('session_id', sessionId)
        .limit(20)

      const previousQuestions = questionHistory
        ?.map(h => {
          const questions = h.questions as unknown as { question_text: string } | null
          return questions?.question_text
        })
        .filter((q): q is string => Boolean(q)) || []

      const aiResult = await ApiErrorHandler.retry(
        async () => await openAIService.generateQuestion({
          category,
          difficulty,
          previousQuestions
        }),
        {
          maxRetries: 3,
          retryOn: (error) => error.message.includes('rate limit') || error.message.includes('timeout')
        }
      )

      if (aiResult.success) {
        console.log('✅ AI question generated successfully')
        
        // Save the AI-generated question to the database
        const { data: savedQuestion, error: saveError } = await supabase
          .from('questions')
          .insert({
            question_text: aiResult.question.question,
            options: aiResult.question.options,
            correct_answer: aiResult.question.correctAnswer,
            category: aiResult.question.category || category || 'General Knowledge',
            difficulty: aiResult.question.difficulty || difficulty,
            explanation: 'AI-generated question'
          })
          .select()
          .single()

        if (savedQuestion && !saveError) {
          question = {
            id: savedQuestion.id,
            question: savedQuestion.question_text,
            options: savedQuestion.options,
            correctAnswer: savedQuestion.correct_answer,
            category: savedQuestion.category,
            difficulty: savedQuestion.difficulty
          }
          questionSource = 'ai-generated'
        } else {
          console.warn('⚠️  Could not save AI question to database:', saveError)
          // Use the AI question anyway, even if we couldn't save it
          question = {
            id: `temp-${Date.now()}`,
            question: aiResult.question.question,
            options: aiResult.question.options,
            correctAnswer: aiResult.question.correctAnswer,
            category: aiResult.question.category || category || 'General Knowledge',
            difficulty: aiResult.question.difficulty || difficulty
          }
          questionSource = 'ai-temporary'
        }
      } else {
        console.error('❌ AI question generation failed:', aiResult.error)
      }
    }

    // If no question available, use fallback
    if (!question) {
      console.log('🔄 Using fallback question')
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
        }
      ]
      
      question = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]
      questionSource = 'fallback'
    }

    // Record the question in history (if it has a valid ID)
    if (question.id && !question.id.startsWith('temp-') && !question.id.startsWith('fallback-')) {
      const { error: historyError } = await supabase
        .from('question_history')
        .insert({
          session_id: sessionId,
          question_id: question.id
        })

      if (historyError) {
        console.warn('⚠️  Could not record question history:', historyError)
      }
    }

    // Trigger realtime update
    try {
      await supabase
        .channel('question-updates')
        .send({
          type: 'broadcast',
          event: 'question-generated',
          payload: {
            sessionId,
            question,
            questionSource,
            timestamp: new Date().toISOString()
          }
        })
    } catch (realtimeError) {
      console.warn('⚠️  Could not send realtime update:', realtimeError)
    }

    console.log(`✅ Question generated successfully (source: ${questionSource})`)

    return NextResponse.json({
      success: true,
      question,
      questionSource,
      timestamp: new Date().toISOString()
    })
  }, 'generate-question')().catch(error => {
    console.error('❌ Error in generate-question API:', error)
    
    if (error.status) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  })
}

// Handle GET requests for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId query parameter is required' },
      { status: 400 }
    )
  }

  // Use the POST handler with default parameters
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({
      sessionId,
      category: searchParams.get('category'),
      difficulty: searchParams.get('difficulty') || 'medium',
      useAI: searchParams.get('useAI') !== 'false'
    })
  }))
}
