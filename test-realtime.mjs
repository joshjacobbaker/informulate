import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('Testing Supabase Realtime broadcast subscriptions...')

// Test question broadcast subscription
const questionChannel = supabase
  .channel('question-updates')
  .on('broadcast', { event: 'question-generated' }, (payload) => {
    console.log('✅ Received question broadcast:', payload)
  })
  .subscribe((status) => {
    console.log('Question channel status:', status)
  })

// Test answer broadcast subscription  
const answerChannel = supabase
  .channel('answer-updates')
  .on('broadcast', { event: 'answer-submitted' }, (payload) => {
    console.log('✅ Received answer broadcast:', payload)
  })
  .subscribe((status) => {
    console.log('Answer channel status:', status)
  })

// Send a test broadcast after 2 seconds
setTimeout(async () => {
  console.log('Sending test question broadcast...')
  
  await questionChannel.send({
    type: 'broadcast',
    event: 'question-generated',
    payload: {
      sessionId: 'test-session',
      question: {
        id: 'test-question-id',
        question: 'Test question?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        category: 'Test',
        difficulty: 'easy'
      },
      questionSource: 'test',
      timestamp: new Date().toISOString()
    }
  })
  
  console.log('Test broadcast sent!')
}, 2000)

// Keep the process alive for testing
setTimeout(() => {
  console.log('Cleaning up...')
  questionChannel.unsubscribe()
  answerChannel.unsubscribe()
  process.exit(0)
}, 10000)
