import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { openAIService } from '@/lib/openai'
import { ApiErrorHandler, withErrorHandling } from '@/lib/utils/error-handling'
import type { Database } from '@/lib/supabase/types'

// Helper function to check for score achievements
function checkForAchievements(oldSession: { score: number; current_streak: number; total_answers: number; correct_answers: number }, scoreUpdate: { newScore: number; currentStreak: number; totalAnswers: number; accuracy: number }) {
  // Streak achievements
  if (scoreUpdate.currentStreak > oldSession.current_streak) {
    if (scoreUpdate.currentStreak === 5) {
      return {
        type: 'streak' as const,
        value: 5,
        message: '🔥 5 in a Row! You\'re on fire!'
      }
    }
    if (scoreUpdate.currentStreak === 10) {
      return {
        type: 'streak' as const,
        value: 10,
        message: '⚡ 10 Streak! Unstoppable!'
      }
    }
    if (scoreUpdate.currentStreak === 20) {
      return {
        type: 'streak' as const,
        value: 20,
        message: '🌟 20 Streak! Legendary!'
      }
    }
  }

  // Score milestones
  if (scoreUpdate.newScore >= 1000 && oldSession.score < 1000) {
    return {
      type: 'milestone' as const,
      value: 1000,
      message: '🎯 1,000 Points! Excellent work!'
    }
  }
  if (scoreUpdate.newScore >= 5000 && oldSession.score < 5000) {
    return {
      type: 'milestone' as const,
      value: 5000,
      message: '🏆 5,000 Points! You\'re a champion!'
    }
  }

  // Perfect accuracy achievements
  if (scoreUpdate.totalAnswers >= 10 && scoreUpdate.accuracy === 100 && 
      (oldSession.total_answers === 0 || (oldSession.correct_answers / oldSession.total_answers) * 100 < 100)) {
    return {
      type: 'perfect_streak' as const,
      value: scoreUpdate.totalAnswers,
      message: '💯 Perfect Score! Flawless execution!'
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Initialize Supabase client with service role for server-side operations
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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

    let scoreUpdate = null
    if (currentSession && !sessionError) {
      const oldScore = currentSession.score
      const newScore = currentSession.score + pointsEarned
      const newTotalAnswers = currentSession.total_answers + 1
      const newCorrectAnswers = currentSession.correct_answers + (isCorrect ? 1 : 0)
      const newCurrentStreak = isCorrect ? currentSession.current_streak + 1 : 0
      const newMaxStreak = Math.max(currentSession.max_streak, newCurrentStreak)
      const newAccuracy = newTotalAnswers > 0 ? (newCorrectAnswers / newTotalAnswers) * 100 : 0

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
      } else {
        // Prepare enhanced score update for real-time broadcast
        scoreUpdate = {
          sessionId,
          oldScore,
          newScore,
          pointsEarned,
          isCorrect,
          currentStreak: newCurrentStreak,
          maxStreak: newMaxStreak,
          correctAnswers: newCorrectAnswers,
          totalAnswers: newTotalAnswers,
          accuracy: newAccuracy,
          timestamp: new Date().toISOString(),
          achievement: undefined as { type: 'streak' | 'milestone' | 'perfect_streak'; value: number; message: string } | undefined, // Will be set if achievement found
        }

        // Check for achievements
        const achievement = checkForAchievements(currentSession, {
          newScore,
          currentStreak: newCurrentStreak,
          totalAnswers: newTotalAnswers,
          accuracy: newAccuracy,
        })
        if (achievement) {
          scoreUpdate.achievement = achievement
        }

        // Send real-time score update broadcast
        try {
          await supabase
            .channel('score-updates')
            .send({
              type: 'broadcast',
              event: 'score-updated',
              payload: scoreUpdate
            })
          console.log('📊 Score update broadcasted:', scoreUpdate)
        } catch (scoreRealtimeError) {
          console.warn('⚠️  Could not send score realtime update:', scoreRealtimeError)
        }
      }
    }

    // Send immediate real-time feedback (without explanation first for faster response)
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
            explanation: null, // Will be sent in a follow-up broadcast
            timestamp: new Date().toISOString()
          }
        })
    } catch (realtimeError) {
      console.warn('⚠️  Could not send immediate realtime update:', realtimeError)
    }

    // Generate explanation if requested (run concurrently with database updates for faster response)
    let explanation = null
    
    if (generateExplanation) {
      console.log('🧠 Starting explanation generation...')
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

        if (explanationResult?.success) {
          explanation = explanationResult.explanation
          
          // Send a follow-up real-time update with the explanation
          try {
            await supabase
              .channel('answer-updates')
              .send({
                type: 'broadcast',
                event: 'explanation-ready',
                payload: {
                  sessionId,
                  questionId,
                  explanation,
                  timestamp: new Date().toISOString()
                }
              })
          } catch (explanationRealtimeError) {
            console.warn('⚠️  Could not send explanation realtime update:', explanationRealtimeError)
          }
        }
      } catch (explanationError) {
        console.warn('⚠️  Could not generate explanation:', explanationError)
      }
    }

    // Final real-time update with complete information
    try {
      await supabase
        .channel('answer-updates')
        .send({
          type: 'broadcast',
          event: 'answer-complete',
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
      console.warn('⚠️  Could not send final realtime update:', realtimeError)
    }

    console.log(`✅ Answer processed successfully (${pointsEarned} points earned)`)

    return NextResponse.json({
      success: true,
      result: {
        isCorrect,
        correctAnswer: question.correct_answer,
        pointsEarned,
        explanation,
        newScore: currentSession ? currentSession.score + pointsEarned : pointsEarned,
        streak: currentSession ? (isCorrect ? currentSession.current_streak + 1 : 0) : 0,
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
