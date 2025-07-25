#!/usr/bin/env node

import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

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

    // Step 2: Generate some questions first
    console.log('2️⃣ Generating questions...');
    const questions = [];
    
    for (let i = 0; i < 5; i++) {
      const generateResponse = await fetch(`${BASE_URL}/api/generate-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          difficulty: ['easy', 'medium', 'hard'][i % 3],
          category: 'general',
        }),
      });

      if (generateResponse.ok) {
        const questionData = await generateResponse.json();
        questions.push({
          id: questionData.question.id,
          difficulty: questionData.question.difficulty,
          correctAnswer: questionData.question.correctAnswer,
        });
        console.log(`   Generated question ${i + 1}: ${questionData.question.difficulty}`);
      } else {
        // Fallback to a UUID if generation fails
        const fallbackId = randomUUID();
        questions.push({
          id: fallbackId,
          difficulty: 'easy',
          correctAnswer: 'A',
        });
        console.log(`   Using fallback question ${i + 1}`);
      }
    }

    console.log(`✅ Generated ${questions.length} questions\n`);

    // Step 3: Test answer submissions with real question IDs
    const testAnswers = [
      { correct: true, timeTaken: 3 },
      { correct: true, timeTaken: 2 },
      { correct: false, timeTaken: 8 },
      { correct: true, timeTaken: 1 },
      { correct: true, timeTaken: 4 },
    ];

    let totalScore = 0;
    let streak = 0;
    let correctAnswers = 0;

    for (let i = 0; i < Math.min(testAnswers.length, questions.length); i++) {
      const answer = testAnswers[i];
      const question = questions[i];
      
      console.log(`${i + 1}️⃣ Submitting answer ${i + 1}...`);
      console.log(`   Question ID: ${question.id}`);
      console.log(`   Answer: ${answer.correct ? 'Correct' : 'Incorrect'}`);
      console.log(`   Difficulty: ${question.difficulty}`);
      console.log(`   Time taken: ${answer.timeTaken}s`);

      const submitResponse = await fetch(`${BASE_URL}/api/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          questionId: question.id,
          selectedAnswer: answer.correct ? question.correctAnswer : (question.correctAnswer === 'A' ? 'B' : 'A'),
          timeTaken: answer.timeTaken,
          includeExplanation: false,
        }),
      });

      if (!submitResponse.ok) {
        console.log(`❌ Submit answer ${i + 1} failed: ${submitResponse.status}`);
        const errorText = await submitResponse.text();
        console.log(`   Error: ${errorText}`);
        continue;
      }

      const result = await submitResponse.json();
      
      // Update tracking variables
      if (answer.correct) {
        correctAnswers++;
        streak++;
      } else {
        streak = 0;
      }

      console.log(`   Points earned: ${result.pointsEarned || 0}`);
      console.log(`   New score: ${result.newScore}`);
      console.log(`   Current streak: ${result.currentStreak || streak}`);
      console.log(`   Accuracy: ${result.accuracy ? result.accuracy.toFixed(1) : 'N/A'}%`);
      
      // Check for achievements
      if (result.achievement) {
        console.log(`   🏆 ACHIEVEMENT: ${result.achievement.message}`);
      }
      
      // Check for streak milestones
      if ((result.currentStreak || streak) === 5) {
        console.log(`   🔥 STREAK MILESTONE: 5 in a row!`);
      }
      
      console.log('');
      
      // Wait between submissions to simulate real gameplay
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log('🎯 Test Results Summary:');
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Questions Answered: ${Math.min(testAnswers.length, questions.length)}`);
    console.log(`   Correct Answers: ${correctAnswers}`);

    console.log('\n✅ Live Score Updates Test Completed!');
    console.log(`\n🔗 View the live demo at: ${BASE_URL}/demo/live-scores`);
    console.log('   Click "New Session" and then "Simulate Answers" to see the real-time updates!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause.message);
    }
  }
}

// Run the test
testLiveScoreUpdates();
