/**
 * Simple Supabase Realtime test using CommonJS syntax
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('🧪 Testing Supabase Realtime (CommonJS version)...');

// Test simple subscription
const testSubscription = () => {
  console.log('📡 Setting up test subscription...');
  
  const channel = supabase
    .channel('test-channel')
    .on('broadcast', { event: 'test-event' }, (payload) => {
      console.log('✅ Received broadcast:', payload);
    })
    .subscribe((status) => {
      console.log('Channel status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('🚀 Sending test broadcast...');
        
        // Send a test broadcast
        channel.send({
          type: 'broadcast',
          event: 'test-event',
          payload: { message: 'Hello from realtime test!' }
        });
      }
    });

  // Cleanup after 5 seconds
  setTimeout(() => {
    console.log('🧹 Cleaning up...');
    channel.unsubscribe();
    console.log('✅ Test complete!');
    process.exit(0);
  }, 5000);
};

testSubscription();
