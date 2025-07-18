import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
      playerId = 'anonymous',
      difficultyPreference = 'medium',
      categoryPreference = null
    } = body

    // Validate required fields
    ApiErrorHandler.validateRequired(body, [])

    console.log(`🎮 Creating game session for player: ${playerId}`)

    // Create a new game session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        player_id: playerId,
        difficulty_preference: difficultyPreference,
        category_preference: categoryPreference,
        is_active: true,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      throw ApiErrorHandler.handleDatabaseError(sessionError, 'create game session')
    }

    console.log(`✅ Game session created successfully: ${session.id}`)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        playerId: session.player_id,
        score: session.score,
        correctAnswers: session.correct_answers,
        totalAnswers: session.total_answers,
        currentStreak: session.current_streak,
        maxStreak: session.max_streak,
        difficultyPreference: session.difficulty_preference,
        categoryPreference: session.category_preference,
        isActive: session.is_active,
        startedAt: session.started_at
      },
      timestamp: new Date().toISOString()
    })
  }, 'create-session')().catch(error => {
    console.error('❌ Error in create-session API:', error)
    
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
  const playerId = searchParams.get('playerId') || 'anonymous'
  
  // Use the POST handler with default parameters
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({
      playerId,
      difficultyPreference: searchParams.get('difficultyPreference') || 'medium',
      categoryPreference: searchParams.get('categoryPreference') || null
    })
  }))
}
