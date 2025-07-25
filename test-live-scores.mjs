#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3001';

console.log('🏆 Testing Live Score Updates Feature...\n');

async function testLiveScoreUpdates() {
  try {
    // Step 1: Create a game session
    console.log('1️⃣ Creating game session...');
    const createResponse = await fetch(`${BASE_URL}/api/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId: 'test-player-live-scores'
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Create session failed: ${createResponse.status} ${createResponse.statusText}`);
    }

    const sessionData = await createResponse.json();
    console.log(`✅ Session created: ${sessionData.session.id}`);
    console.log(`   Initial score: ${sessionData.session.score}\n`);

    const sessionId = sessionData.session.id;

    // Step 2: Test multiple answer submissions to trigger score updates
    const testAnswers = [
      { correct: true, difficulty: 'easy', timeTaken: 3 },
      { correct: true, difficulty: 'medium', timeTaken: 2 },
      { correct: false, difficulty: 'hard', timeTaken: 8 },
      { correct: true, difficulty: 'easy', timeTaken: 1 },
      { correct: true, difficulty: 'medium', timeTaken: 4 },
      { correct: true, difficulty: 'hard', timeTaken: 3 },
      { correct: true, difficulty: 'easy', timeTaken: 2 },
      { correct: true, difficulty: 'medium', timeTaken: 3 },
    ];

    let totalScore = 0;
    let streak = 0;
    let correctAnswers = 0;

    for (let i = 0; i < testAnswers.length; i++) {
      const answer = testAnswers[i];
      console.log(`${i + 1}️⃣ Submitting answer ${i + 1}...`);
      console.log(`   Answer: ${answer.correct ? 'Correct' : 'Incorrect'}`);
      console.log(`   Difficulty: ${answer.difficulty}`);
      console.log(`   Time taken: ${answer.timeTaken}s`);

      const submitResponse = await fetch(`${BASE_URL}/api/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          questionId: `test-question-${i + 1}`,
          selectedAnswer: answer.correct ? 'correct' : 'wrong',
          timeTaken: answer.timeTaken,
          includeExplanation: false,
        }),
      });

      if (!submitResponse.ok) {
        console.log(`❌ Submit answer ${i + 1} failed: ${submitResponse.status}`);
        continue;
      }

      const result = await submitResponse.json();
      
      // Update tracking variables
      if (answer.correct) {
        correctAnswers++;
        streak++;
        totalScore += result.pointsEarned || 0;
      } else {
        streak = 0;
      }

      console.log(`   Points earned: ${result.pointsEarned || 0}`);
      console.log(`   New score: ${result.newScore || totalScore}`);
      console.log(`   Current streak: ${streak}`);
      console.log(`   Accuracy: ${((correctAnswers / (i + 1)) * 100).toFixed(1)}%`);
      
      // Check for achievements
      if (result.achievement) {
        console.log(`   🏆 ACHIEVEMENT: ${result.achievement.message}`);
      }
      
      // Check for streak milestones
      if (streak === 5) {
        console.log(`   🔥 STREAK MILESTONE: 5 in a row!`);
      } else if (streak === 10) {
        console.log(`   ⚡ STREAK MILESTONE: 10 in a row!`);
      }
      
      console.log('');
      
      // Wait a bit between submissions to simulate real gameplay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🎯 Final Results:');
    console.log(`   Total Questions: ${testAnswers.length}`);
    console.log(`   Correct Answers: ${correctAnswers}`);
    console.log(`   Final Accuracy: ${((correctAnswers / testAnswers.length) * 100).toFixed(1)}%`);
    console.log(`   Final Score: ${totalScore}`);
    console.log(`   Max Streak: ${Math.max(...testAnswers.map((_, i) => i < correctAnswers ? i + 1 : 0))}`);

    console.log('\n✅ Live Score Updates Test Completed!');
    console.log(`\n🔗 View the live demo at: ${BASE_URL}/demo/live-scores`);
    console.log(`   Session ID: ${sessionId}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Full error:', error);
  }
}

// Run the test
testLiveScoreUpdates();
