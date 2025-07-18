/**
 * Unit tests for Edge Functions
 * Note: These are basic tests to verify the API endpoints work correctly
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const API_BASE = `${BASE_URL}/api`

interface TestQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  category: string
  difficulty: string
}

class TestRunner {
  private tests: Array<{ name: string; fn: () => Promise<void> }> = []
  private results: Array<{ name: string; success: boolean; error?: string }> = []

  test(name: string, fn: () => Promise<void>) {
    this.tests.push({ name, fn })
  }

  async run() {
    console.log('🧪 Running Edge Function Tests...')
    console.log('='.repeat(50))

    for (const test of this.tests) {
      try {
        await test.fn()
        this.results.push({ name: test.name, success: true })
        console.log(`✅ ${test.name}`)
      } catch (error) {
        this.results.push({ 
          name: test.name, 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        })
        console.log(`❌ ${test.name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    this.printSummary()
  }

  private printSummary() {
    console.log('\n' + '='.repeat(50))
    console.log('📊 Test Results Summary')
    console.log('='.repeat(50))
    
    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📈 Total: ${this.results.length}`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`)
      })
    }
  }
}

const testRunner = new TestRunner()
let testSessionId: string
let generatedQuestion: TestQuestion | null = null

async function assertResponse(response: Response, expectedStatus: number, message: string) {
  if (response.status !== expectedStatus) {
    const body = await response.text()
    throw new Error(`${message}: Expected status ${expectedStatus}, got ${response.status}. Body: ${body}`)
  }
}

async function assertProperty(obj: Record<string, unknown>, property: string, message: string) {
  if (!(property in obj)) {
    throw new Error(`${message}: Missing property '${property}'`)
  }
}

testRunner.test('Generate Question - Success', async () => {
  testSessionId = `test-session-${Date.now()}`
  
  const response = await fetch(`${API_BASE}/generate-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: testSessionId,
      category: 'Science & Nature',
      difficulty: 'medium',
      useAI: false
    })
  })

  await assertResponse(response, 200, 'Generate question should succeed')
  
  const data = await response.json()
  await assertProperty(data, 'success', 'Response should have success property')
  await assertProperty(data, 'question', 'Response should have question property')
  await assertProperty(data, 'questionSource', 'Response should have questionSource property')
  await assertProperty(data.question, 'id', 'Question should have id property')
  await assertProperty(data.question, 'question', 'Question should have question property')
  await assertProperty(data.question, 'options', 'Question should have options property')
  await assertProperty(data.question, 'correctAnswer', 'Question should have correctAnswer property')
  
  if (data.success !== true) {
    throw new Error('Response success should be true')
  }
  
  generatedQuestion = data.question
})

testRunner.test('Generate Question - Missing Session ID', async () => {
  const response = await fetch(`${API_BASE}/generate-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category: 'Science & Nature',
      difficulty: 'medium'
    })
  })

  await assertResponse(response, 400, 'Missing sessionId should return 400')
})

testRunner.test('Generate Question - Invalid Difficulty', async () => {
  const response = await fetch(`${API_BASE}/generate-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: testSessionId,
      difficulty: 'invalid-difficulty'
    })
  })

  await assertResponse(response, 400, 'Invalid difficulty should return 400')
})

testRunner.test('Generate Question - GET Request', async () => {
  const response = await fetch(`${API_BASE}/generate-question?sessionId=${testSessionId}&category=Geography&difficulty=easy`)
  
  await assertResponse(response, 200, 'GET request should succeed')
  
  const data = await response.json()
  await assertProperty(data, 'success', 'GET response should have success property')
  
  if (data.success !== true) {
    throw new Error('GET response success should be true')
  }
})

testRunner.test('Submit Answer - Success', async () => {
  if (!generatedQuestion) {
    // Generate a question first
    const questionResponse = await fetch(`${API_BASE}/generate-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: testSessionId,
        useAI: false
      })
    })
    const questionData = await questionResponse.json()
    generatedQuestion = questionData.question
  }

  const response = await fetch(`${API_BASE}/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: testSessionId,
      questionId: generatedQuestion.id,
      selectedAnswer: generatedQuestion.options[0],
      timeTaken: 5000,
      generateExplanation: false
    })
  })

  await assertResponse(response, 200, 'Submit answer should succeed')
  
  const data = await response.json()
  await assertProperty(data, 'success', 'Response should have success property')
  await assertProperty(data, 'result', 'Response should have result property')
  await assertProperty(data.result, 'isCorrect', 'Result should have isCorrect property')
  await assertProperty(data.result, 'correctAnswer', 'Result should have correctAnswer property')
  await assertProperty(data.result, 'pointsEarned', 'Result should have pointsEarned property')
  await assertProperty(data.result, 'questionDetails', 'Result should have questionDetails property')
  
  if (data.success !== true) {
    throw new Error('Response success should be true')
  }
})

testRunner.test('Submit Answer - Missing Required Fields', async () => {
  const response = await fetch(`${API_BASE}/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: testSessionId,
      // Missing questionId and selectedAnswer
    })
  })

  await assertResponse(response, 400, 'Missing required fields should return 400')
})

testRunner.test('Submit Answer - Non-existent Question', async () => {
  const response = await fetch(`${API_BASE}/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: testSessionId,
      questionId: 'non-existent-question-id',
      selectedAnswer: 'A',
      generateExplanation: false
    })
  })

  await assertResponse(response, 404, 'Non-existent question should return 404')
})

testRunner.test('Submit Answer - GET Request', async () => {
  if (!generatedQuestion) {
    return // Skip if we don't have a question
  }

  const response = await fetch(`${API_BASE}/submit-answer?sessionId=${testSessionId}&questionId=${generatedQuestion.id}&selectedAnswer=${encodeURIComponent(generatedQuestion.options[0])}&generateExplanation=false`)
  
  await assertResponse(response, 200, 'GET request should succeed')
  
  const data = await response.json()
  await assertProperty(data, 'success', 'GET response should have success property')
  
  if (data.success !== true) {
    throw new Error('GET response success should be true')
  }
})

testRunner.test('Error Handling - Invalid JSON', async () => {
  const response = await fetch(`${API_BASE}/generate-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'invalid json'
  })

  await assertResponse(response, 500, 'Invalid JSON should return 500')
})

// Run all tests
export async function runEdgeFunctionTests() {
  await testRunner.run()
}

// If this file is run directly, run the tests
if (import.meta.url === new URL(import.meta.url).href) {
  runEdgeFunctionTests().catch(console.error)
}
