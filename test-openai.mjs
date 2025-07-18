import { openAIService } from './src/lib/openai/service.js'

async function testOpenAIIntegration() {
  console.log('🤖 Testing OpenAI Integration...\n')

  try {
    // Test 1: Generate a simple question
    console.log('1️⃣ Testing Question Generation:')
    const questionResult = await openAIService.generateQuestion({
      category: 'General Knowledge',
      difficulty: 'easy'
    })

    if (questionResult.success) {
      console.log('   ✅ Question generated successfully!')
      console.log(`   📝 Question: ${questionResult.question.question}`)
      console.log(`   📊 Options: ${questionResult.question.options.length}`)
      console.log(`   ✅ Correct: ${questionResult.question.correctAnswer}`)
    } else {
      console.log(`   ❌ Question generation failed: ${questionResult.error}`)
    }

    // Test 2: Generate an explanation
    console.log('\n2️⃣ Testing Explanation Generation:')
    const explanationResult = await openAIService.generateExplanation({
      question: 'What is the capital of France?',
      correctAnswer: 'C. Paris',
      userAnswer: 'A. London',
      isCorrect: false
    })

    if (explanationResult.success) {
      console.log('   ✅ Explanation generated successfully!')
      console.log(`   💡 Explanation: ${explanationResult.explanation.explanation}`)
    } else {
      console.log(`   ❌ Explanation generation failed: ${explanationResult.error}`)
    }

  } catch (error) {
    console.error('❌ OpenAI integration test failed:', error)
  }

  console.log('\n✨ OpenAI integration test complete!')
}

export { testOpenAIIntegration }
