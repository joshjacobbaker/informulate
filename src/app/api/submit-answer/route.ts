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
      questionId, 
      selectedAnswer, 
      timeTaken,
      generateExplanation = true
    } = body

    // Validate required fields
    ApiErrorHandler.validateRequired(body, ['sessionId', 'questionId', 'selectedAnswer'])
    ApiErrorHandler.validateSessionId(sessionId)
    ApiErrorHandler.validateQuestionId(questionId)
    ApiErrorHandler.validateAnswer(selectedAnswer)

    console.log(`📝 Processing answer for session: ${sessionId}, question: ${questionId}`)
    console.log(`💭 Selected answer: ${selectedAnswer}`)

    // Get the question details to check the correct answer
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      throw ApiErrorHandler.handleDatabaseError(questionError, 'fetch question')
    }

    // Check if the answer is correct
    const isCorrect = selectedAnswer === question.correct_answer
    console.log(`${isCorrect ? '✅' : '❌'} Answer is ${isCorrect ? 'correct' : 'incorrect'}`)

    // Calculate points based on difficulty and time taken
    let pointsEarned = 0
    if (isCorrect) {
      const { data: score, error: scoreError } = await supabase
        .rpc('calculate_score', {
          p_difficulty: question.difficulty,
          p_time_taken: timeTaken || null
        })
      
      if (scoreError) {
        console.warn('⚠️  Could not calculate score:', scoreError)
      } else {
        pointsEarned = score || 0
      }
    }

    // Save the answer to the database
    const { error: saveError } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        session_id: sessionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        time_taken: timeTaken || null,
        points_earned: pointsEarned,
        answered_at: new Date().toISOString()
      })

    if (saveError) {
      throw ApiErrorHandler.handleDatabaseError(saveError, 'save answer')
    }

    // Update the game session statistics
    const { data: currentSession, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (currentSession && !sessionError) {
      const newScore = currentSession.score + pointsEarned
      const newTotalAnswers = currentSession.total_answers + 1
      const newCorrectAnswers = currentSession.correct_answers + (isCorrect ? 1 : 0)
      const newCurrentStreak = isCorrect ? currentSession.current_streak + 1 : 0
      const newMaxStreak = Math.max(currentSession.max_streak, newCurrentStreak)

      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          score: newScore,
          total_answers: newTotalAnswers,
          correct_answers: newCorrectAnswers,
          current_streak: newCurrentStreak,
          max_streak: newMaxStreak,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (updateError) {
        console.warn('⚠️  Could not update session statistics:', updateError)
      }
    }

    // Generate explanation if requested
    let explanation = null
    if (generateExplanation) {
      console.log('🧠 Generating explanation...')
      try {
        const explanationResult = await ApiErrorHandler.retry(
          async () => await openAIService.generateExplanation({
            question: question.question_text,
            correctAnswer: question.correct_answer,
            userAnswer: selectedAnswer,
            isCorrect
          }),
          {
            maxRetries: 2,
            retryOn: (error) => error.message.includes('rate limit') || error.message.includes('timeout')
          }
        )

        if (explanationResult.success) {
          explanation = explanationResult.explanation
        }
      } catch (explanationError) {
        console.warn('⚠️  Could not generate explanation:', explanationError)
      }
    }

    // Trigger realtime update
    try {
      await supabase
        .channel('answer-updates')
        .send({
          type: 'broadcast',
          event: 'answer-submitted',
          payload: {
            sessionId,
            questionId,
            selectedAnswer,
            isCorrect,
            pointsEarned,
            explanation,
            timestamp: new Date().toISOString()
          }
        })
    } catch (realtimeError) {
      console.warn('⚠️  Could not send realtime update:', realtimeError)
    }

    console.log(`✅ Answer processed successfully (${pointsEarned} points earned)`)

    return NextResponse.json({
      success: true,
      result: {
        isCorrect,
        correctAnswer: question.correct_answer,
        pointsEarned,
        explanation,
        questionDetails: {
          id: question.id,
          question: question.question_text,
          options: question.options,
          category: question.category,
          difficulty: question.difficulty
        }
      },
      timestamp: new Date().toISOString()
    })
  }, 'submit-answer')().catch(error => {
    console.error('❌ Error in submit-answer API:', error)
    
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
  const questionId = searchParams.get('questionId')
  const selectedAnswer = searchParams.get('selectedAnswer')
  
  if (!sessionId || !questionId || !selectedAnswer) {
    return NextResponse.json(
      { error: 'sessionId, questionId, and selectedAnswer query parameters are required' },
      { status: 400 }
    )
  }

  // Use the POST handler with default parameters
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({
      sessionId,
      questionId,
      selectedAnswer,
      timeTaken: searchParams.get('timeTaken') ? parseInt(searchParams.get('timeTaken')!) : null,
      generateExplanation: searchParams.get('generateExplanation') !== 'false'
    })
  }))
}
