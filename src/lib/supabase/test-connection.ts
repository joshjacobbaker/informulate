import { createClient } from '@/lib/supabase/client'

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    // Test basic connection
    const { error } = await supabase
      .from('questions')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }

    console.log('Supabase connection test successful!')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}
