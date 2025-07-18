import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConfiguration() {
  console.log('🧪 Testing AI Trivia Arena Configuration...\n');

  // Test 1: Environment Variables
  console.log('1️⃣ Checking Environment Variables:');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY'
  ];

  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${varName}: Missing`);
      allVarsPresent = false;
    }
  });

  if (!allVarsPresent) {
    console.log('\n❌ Some environment variables are missing. Please check your .env.local file.');
    process.exit(1);
  }

  console.log('\n2️⃣ Testing Supabase Connection:');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test basic connection by checking auth status
    const { error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.log(`   ❌ Supabase Auth Error: ${authError.message}`);
    } else {
      console.log('   ✅ Supabase connection successful!');
      
      // Test database tables
      const tables = ['questions', 'game_sessions', 'answers', 'question_history'];
      
      for (const table of tables) {
        try {
          const { error: tableError } = await supabase.from(table).select('*').limit(1);
          if (tableError) {
            console.log(`   ⚠️  Table '${table}': ${tableError.message}`);
          } else {
            console.log(`   ✅ Table '${table}': Accessible`);
          }
        } catch (tableError) {
          console.log(`   ❌ Table '${table}': Error checking - ${tableError.message || tableError}`);
        }
      }
      
      // Test count of sample questions
      try {
        const { data: questionCount, error: countError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.log(`   ⚠️  Questions count: ${countError.message}`);
        } else {
          console.log(`   📊 Questions in database: ${questionCount?.length || 0}`);
        }
      } catch (countError) {
        console.log(`   ⚠️  Could not count questions - ${countError.message || countError}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Supabase connection failed: ${error.message}`);
  }

  console.log('\n3️⃣ Testing OpenAI Connection:');
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('   ✅ OpenAI API connection successful!');
    } else {
      const errorData = await response.text();
      console.log(`   ❌ OpenAI API Error: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.log(`   ❌ OpenAI connection failed: ${error.message}`);
  }

  console.log('\n✨ Configuration test complete!');
}

testConfiguration().catch(console.error);
