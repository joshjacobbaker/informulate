#!/usr/bin/env node

/**
 * Database seeding script for AI Trivia Arena
 * This script adds sample questions to the database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { existsSync } from 'fs'

// Load environment variables from .env.local if it exists (local development)
// In CI, environment variables are already set, so this is optional
if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
}

const sampleQuestions = [
  {
    question_text: "What is the capital of France?",
    options: ["A. London", "B. Berlin", "C. Paris", "D. Madrid"],
    correct_answer: "C",
    explanation: "Paris is the capital and most populous city of France. It has been the capital since 987 AD and is known for its rich history, culture, and landmarks like the Eiffel Tower.",
    category: "Geography",
    difficulty: "easy"
  },
  {
    question_text: "Which planet is known as the Red Planet?",
    options: ["A. Venus", "B. Mars", "C. Jupiter", "D. Saturn"],
    correct_answer: "B",
    explanation: "Mars is called the Red Planet because of its reddish appearance, which comes from iron oxide (rust) on its surface. It's the fourth planet from the Sun.",
    category: "Science & Nature",
    difficulty: "easy"
  },
  {
    question_text: "Who wrote the novel '1984'?",
    options: ["A. George Orwell", "B. Aldous Huxley", "C. Ray Bradbury", "D. H.G. Wells"],
    correct_answer: "A",
    explanation: "George Orwell wrote '1984', a dystopian novel published in 1949. It depicts a totalitarian society and introduced concepts like 'Big Brother' and 'doublethink'.",
    category: "Literature",
    difficulty: "medium"
  },
  {
    question_text: "What is the chemical symbol for gold?",
    options: ["A. Go", "B. Au", "C. Ag", "D. Gd"],
    correct_answer: "B",
    explanation: "The chemical symbol for gold is Au, which comes from the Latin word 'aurum' meaning gold. Gold is a precious metal with atomic number 79.",
    category: "Science & Nature",
    difficulty: "medium"
  },
  {
    question_text: "In which year did World War II end?",
    options: ["A. 1944", "B. 1945", "C. 1946", "D. 1947"],
    correct_answer: "B",
    explanation: "World War II ended in 1945. The war in Europe ended on May 8, 1945 (VE Day), and the war in the Pacific ended on August 15, 1945 after the atomic bombs were dropped on Japan.",
    category: "History",
    difficulty: "medium"
  },
  {
    question_text: "What is the largest mammal in the world?",
    options: ["A. African Elephant", "B. Blue Whale", "C. Giraffe", "D. Hippopotamus"],
    correct_answer: "B",
    explanation: "The blue whale is the largest mammal and the largest animal ever known to have lived on Earth. They can reach lengths of up to 100 feet and weigh up to 200 tons.",
    category: "Science & Nature",
    difficulty: "easy"
  },
  {
    question_text: "Which programming language was created by Brendan Eich?",
    options: ["A. Python", "B. Java", "C. JavaScript", "D. C++"],
    correct_answer: "C",
    explanation: "JavaScript was created by Brendan Eich in 1995 while he was working at Netscape. It was originally called LiveScript but was renamed to JavaScript for marketing reasons.",
    category: "Technology",
    difficulty: "hard"
  },
  {
    question_text: "What is the smallest prime number?",
    options: ["A. 0", "B. 1", "C. 2", "D. 3"],
    correct_answer: "C",
    explanation: "The smallest prime number is 2. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. 2 is the only even prime number.",
    category: "Mathematics",
    difficulty: "medium"
  }
]

async function seedDatabase() {
  console.log('🌱 Seeding AI Trivia Arena Database...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL')
    console.error('  SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nPlease check your .env.local file.')
    process.exit(1)
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Check if questions already exist
    console.log('📊 Checking existing questions...')
    
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      
    if (countError) {
      console.error('❌ Cannot check existing questions:', countError.message)
      process.exit(1)
    }

    console.log(`   Found ${count} existing questions`)

    if (count > 0) {
      console.log('⚠️  Questions already exist in the database.')
      console.log('   Do you want to add more sample questions? (This will not duplicate)')
    }

    // Insert sample questions
    console.log('📝 Adding sample questions...')
    
    let successCount = 0
    let errorCount = 0

    for (const question of sampleQuestions) {
      try {
        // Check if this question already exists
        const { data: existing, error: checkError } = await supabase
          .from('questions')
          .select('id')
          .eq('question_text', question.question_text)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.warn(`⚠️  Error checking question: ${checkError.message}`)
          errorCount++
          continue
        }

        if (existing) {
          console.log(`   ⏭️  Skipping duplicate: ${question.question_text.substring(0, 50)}...`)
          continue
        }

        // Insert the question
        const { error: insertError } = await supabase
          .from('questions')
          .insert(question)

        if (insertError) {
          console.error(`   ❌ Failed to insert: ${question.question_text.substring(0, 50)}...`)
          console.error(`      Error: ${insertError.message}`)
          errorCount++
        } else {
          console.log(`   ✅ Added: ${question.question_text.substring(0, 50)}...`)
          successCount++
        }
      } catch (insertError) {
        console.error(`   ❌ Failed to insert: ${question.question_text.substring(0, 50)}...`)
        console.error(`      Error: ${insertError.message || insertError}`)
        errorCount++
      }
    }

    console.log(`\n✅ Seeding completed!`)
    console.log(`   📊 ${successCount} questions added successfully`)
    if (errorCount > 0) {
      console.log(`   ⚠️  ${errorCount} questions failed to add`)
    }

    // Verify the final count
    const { count: finalCount, error: finalCountError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      
    if (finalCountError) {
      console.warn('⚠️  Cannot verify final count:', finalCountError.message)
    } else {
      console.log(`   📊 Total questions in database: ${finalCount}`)
    }

    console.log('\n🚀 Next steps:')
    console.log('   1. Test the configuration: npm run test:config')
    console.log('   2. Start building your frontend components')
    console.log('   3. Test question generation with OpenAI')

  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase().catch(console.error)
