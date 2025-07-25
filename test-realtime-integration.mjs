#!/usr/bin/env node
/**
 * Comprehensive test for Supabase Realtime integration
 * Tests the entire flow: question generation → real-time updates → answer submission
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('🧪 Testing complete Supabase Realtime integration...')

let testQuestionId = null

// Set up all subscriptions
const setupSubscriptions = (sessionId) => {
  console.log('📡 Setting up real-time subscriptions...')
  
  // 1. Subscribe to database changes for questions table
  const questionsSubscription = supabase
    .channel('questions-changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'questions' },
      (payload) => {
        console.log('✅ DB: New question inserted:', payload.new.id)
        testQuestionId = payload.new.id
      }
    )
    .subscribe()

  // 2. Subscribe to database changes for answers table
  const answersSubscription = supabase
    .channel('answers-changes')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'answers',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        console.log('✅ DB: New answer submitted:', payload.new)
      }
    )
    .subscribe()

  // 3. Subscribe to question broadcast events
  const questionBroadcastSubscription = supabase
    .channel('question-updates')
    .on('broadcast', { event: 'question-generated' }, (payload) => {
      console.log('✅ Broadcast: Question generated:', payload.payload.sessionId)
    })
    .subscribe()

  // 4. Subscribe to answer broadcast events
  const answerBroadcastSubscription = supabase
    .channel('answer-updates')
    .on('broadcast', { event: 'answer-submitted' }, (payload) => {
      console.log('✅ Broadcast: Answer submitted:', payload.payload.sessionId)
    })
    .subscribe()

  return {
    questionsSubscription,
    answersSubscription,
    questionBroadcastSubscription,
    answerBroadcastSubscription
  }
}

// Test the API endpoints
const testApiFlow = async (sessionId) => {
  console.log('🚀 Testing API flow...')
  
  try {
    // Generate a question via API
    console.log('Generating question via API...')
    const generateResponse = await fetch('http://localhost:3002/api/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        category: 'General Knowledge',
        difficulty: 'medium'
      })
    })

    const questionResult = await generateResponse.json()
    if (questionResult.success) {
      console.log('✅ Question generated via API')
      
      // Wait a bit for real-time updates to propagate
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Submit an answer via API
      console.log('Submitting answer via API...')
      const submitResponse = await fetch('http://localhost:3002/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          questionId: questionResult.question.id,
          selectedAnswer: questionResult.question.options[0] // Just pick first option
        })
      })

      const answerResult = await submitResponse.json()
      if (answerResult.success) {
        console.log('✅ Answer submitted via API')
      } else {
        console.error('❌ Error submitting answer:', answerResult)
      }
    } else {
      console.error('❌ Error generating question:', questionResult)
    }

  } catch (error) {
    console.error('❌ API test error:', error)
  }
}

// Main test execution
const runTest = async () => {
  // Create session first to get the actual ID
  console.log('Creating test game session...')
  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      player_id: 'test-player',
      difficulty_preference: 'medium', 
      category_preference: 'General Knowledge',
      is_active: true
    })
    .select()
    .single()

  if (sessionError) {
    console.error('❌ Error creating session:', sessionError)
    return
  }
  
  const actualSessionId = session.id
  console.log('✅ Test session created:', actualSessionId)

  const subscriptions = setupSubscriptions(actualSessionId)
  
  // Wait for subscriptions to be established
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Run API flow test
  await testApiFlow(actualSessionId)
  
  // Wait for all real-time updates to come through
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Cleanup
  console.log('🧹 Cleaning up...')
  Object.values(subscriptions).forEach(sub => sub.unsubscribe())
  
  // Clean up test data
  try {
    await supabase.from('game_sessions').delete().eq('id', actualSessionId)
    if (testQuestionId) {
      await supabase.from('questions').delete().eq('id', testQuestionId)
    }
    console.log('✅ Test data cleaned up')
  } catch (error) {
    console.warn('⚠️  Could not clean up test data:', error)
  }
  
  console.log('🎉 Real-time integration test complete!')
  process.exit(0)
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted')
  process.exit(0)
})

// Run the test
runTest().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
