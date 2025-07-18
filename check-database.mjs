#!/usr/bin/env node

/**
 * Database schema verification script for AI Trivia Arena
 * This script checks if the database schema exists and provides setup instructions
 */

import { createClient } from '@supabase/supabase-js'
import { join } from 'path'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkDatabaseSchema() {
  console.log('🔍 Checking AI Trivia Arena Database Schema...\n')

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
    // Test the schema by querying tables
    console.log('🔍 Verifying database schema...')
    
    const tables = ['questions', 'game_sessions', 'answers', 'question_history']
    const results = {}
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          results[table] = { exists: false, error: error.message }
          console.log(`   ❌ Table '${table}': ${error.message}`)
        } else {
          results[table] = { exists: true }
          console.log(`   ✅ Table '${table}': OK`)
        }
      } catch (queryError) {
        results[table] = { exists: false, error: queryError.message }
        console.log(`   ❌ Table '${table}': Failed to query - ${queryError.message || queryError}`)
      }
    }

    // Check if any tables are missing
    const missingTables = Object.entries(results)
      .filter(([, result]) => !result.exists)
      .map(([table]) => table)

    if (missingTables.length > 0) {
      console.log('\n❌ Database schema is not complete!')
      console.log('Missing tables:', missingTables.join(', '))
      console.log('\n📋 To set up the database schema:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to the SQL Editor')
      console.log('3. Run the migration SQL from: supabase/migrations/001_initial_schema.sql')
      console.log('\nOr copy and paste this SQL:')
      
      try {
        const migrationPath = join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql')
        const migrationSQL = readFileSync(migrationPath, 'utf8')
        console.log('\n' + '='.repeat(50))
        console.log(migrationSQL)
        console.log('='.repeat(50))
      } catch (readError) {
        console.log('❌ Could not read migration file:', readError.message)
      }
      
      return
    }

    // Test the functions
    console.log('\n🔧 Testing database functions...')
    
    try {
      const { data, error } = await supabase.rpc('calculate_score', {
        p_difficulty: 'medium',
        p_time_taken: 5000
      })
      
      if (error) {
        console.log(`   ❌ Function 'calculate_score': ${error.message}`)
      } else {
        console.log(`   ✅ Function 'calculate_score': Returns ${data}`)
      }
    } catch (funcError) {
      console.log(`   ❌ Function 'calculate_score': Failed - ${funcError.message || funcError}`)
    }

    // Check if sample questions exist
    console.log('\n📚 Checking sample questions...')
    
    try {
      const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        
      if (error) {
        console.log(`   ❌ Cannot count questions: ${error.message}`)
      } else {
        console.log(`   📊 Found ${count} questions in database`)
        
        if (count === 0) {
          console.log('   💡 Consider adding sample questions for testing')
          console.log('   💡 You can use the sample-questions.sql file to add test data')
        }
      }
    } catch (countError) {
      console.log(`   ❌ Cannot check questions: ${countError.message || countError}`)
    }

    console.log('\n✅ Database schema verification complete!')
    console.log('\n🚀 Next steps:')
    console.log('   1. Test the configuration: npm run test:config')
    console.log('   2. Add sample questions: npm run db:seed')
    console.log('   3. Start building your frontend components')

  } catch (error) {
    console.error('❌ Database verification failed:', error)
    process.exit(1)
  }
}

checkDatabaseSchema().catch(console.error)
