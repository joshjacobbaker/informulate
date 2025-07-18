#!/usr/bin/env node

/**
 * Test script for the Edge Functions API endpoints
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const API_BASE = `${BASE_URL}/api`

async function testCreateSession() {
  console.log('🧪 Testing create-session API...')
  
  try {
    const response = await fetch(`${API_BASE}/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId: 'test-player-123',
        difficultyPreference: 'medium',
        categoryPreference: 'Science & Nature'
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Create session test passed')
      console.log('📊 Response:', JSON.stringify(data, null, 2))
      return data.session
    } else {
      console.error('❌ Create session test failed:', data)
      return null
    }
  } catch (error) {
    console.error('❌ Create session test error:', error)
    return null
  }
}

async function testGenerateQuestion(sessionId) {
  console.log('\n🧪 Testing generate-question API...')
  
  try {
    const response = await fetch(`${API_BASE}/generate-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        category: 'Science & Nature',
        difficulty: 'medium',
        useAI: false // Use database questions first
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Generate question test passed')
      console.log('📊 Response:', JSON.stringify(data, null, 2))
      return data.question
    } else {
      console.error('❌ Generate question test failed:', data)
      return null
    }
  } catch (error) {
    console.error('❌ Generate question test error:', error)
    return null
  }
}

async function testSubmitAnswer(sessionId, question) {
  if (!question) {
    console.log('⏭️  Skipping submit-answer test (no question available)')
    return
  }
  
  console.log('\n🧪 Testing submit-answer API...')
  
  try {
    const response = await fetch(`${API_BASE}/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        questionId: question.id,
        selectedAnswer: question.options[0], // Pick first option
        timeTaken: 5000, // 5 seconds
        generateExplanation: false // Skip AI explanation for now
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Submit answer test passed')
      console.log('📊 Response:', JSON.stringify(data, null, 2))
    } else {
      console.error('❌ Submit answer test failed:', data)
    }
  } catch (error) {
    console.error('❌ Submit answer test error:', error)
  }
}

async function testGetEndpoints() {
  console.log('\n🧪 Testing GET endpoints...')
  
  // Test GET version of create-session
  try {
    const response = await fetch(`${API_BASE}/create-session?playerId=test-player-get`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ GET create-session test passed')
      
      // Test GET version of generate-question
      const sessionId = data.session.id
      const questionResponse = await fetch(`${API_BASE}/generate-question?sessionId=${sessionId}&category=Geography&difficulty=easy`)
      const questionData = await questionResponse.json()
      
      if (questionResponse.ok) {
        console.log('✅ GET generate-question test passed')
        
        // Test GET version of submit-answer (if we have a question)
        if (questionData.question && questionData.question.id && !questionData.question.id.startsWith('fallback-')) {
          const answerResponse = await fetch(`${API_BASE}/submit-answer?sessionId=${sessionId}&questionId=${questionData.question.id}&selectedAnswer=${encodeURIComponent(questionData.question.options[0])}&generateExplanation=false`)
          const answerData = await answerResponse.json()
          
          if (answerResponse.ok) {
            console.log('✅ GET submit-answer test passed')
          } else {
            console.error('❌ GET submit-answer test failed:', answerData)
          }
        } else {
          console.log('⏭️  Skipping GET submit-answer test (fallback question)')
        }
      } else {
        console.error('❌ GET generate-question test failed:', questionData)
      }
    } else {
      console.error('❌ GET create-session test failed:', data)
    }
  } catch (error) {
    console.error('❌ GET endpoints test error:', error)
  }
}

async function runTests() {
  console.log('🚀 Starting API endpoint tests...')
  console.log(`🔗 Base URL: ${BASE_URL}`)
  console.log('='.repeat(50))
  
  // Test create-session
  const session = await testCreateSession()
  
  if (!session) {
    console.error('❌ Cannot continue without a valid session')
    return
  }
  
  // Test generate-question with the created session
  const question = await testGenerateQuestion(session.id)
  
  // Test submit-answer with the generated question
  await testSubmitAnswer(session.id, question)
  
  // Test GET endpoints
  await testGetEndpoints()
  
  console.log('\n🏁 Tests completed!')
}

// Run the tests
runTests().catch(console.error)
