"use client";

import React, { useState, useEffect } from "react";
import { Play, RefreshCw, Trophy, Target, Zap } from "lucide-react";
import LiveScoreboard from "@/components/LiveScoreboard/LiveScoreboard";
import { SupabaseService } from "@/lib/supabase/service";
import { useScoreNotifications } from "@/lib/query";

export default function LiveScoresDemo() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string>('');
  const { latestUpdate, hasUpdate } = useScoreNotifications();

  // Create a new game session for the demo
  const createDemoSession = async () => {
    setIsCreating(true);
    try {
      const supabaseService = new SupabaseService();
      const session = await supabaseService.createGameSession('demo-player');
      if (session) {
        setSessionId(session.id);
        console.log("Created demo session:", session.id);
      }
    } catch (error) {
      console.error("Error creating demo session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Simulate answering questions to test real-time score updates
  const simulateAnswers = async () => {
    if (!sessionId) return;
    
    setIsSimulating(true);
    
    const scenarios = [
      { correct: true, timeTaken: 3, difficulty: 'easy' },
      { correct: true, timeTaken: 2, difficulty: 'medium' },
      { correct: false, timeTaken: 8, difficulty: 'hard' },
      { correct: true, timeTaken: 1, difficulty: 'easy' },
      { correct: true, timeTaken: 4, difficulty: 'medium' },
      { correct: true, timeTaken: 3, difficulty: 'hard' },
    ];

    try {
      // First, generate real questions
      const questions = [];
      console.log('Generating questions for simulation...');
      setSimulationStatus('Generating questions...');
      
      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        setSimulationStatus(`Generating question ${i + 1}/${scenarios.length}...`);
        
        try {
          const generateResponse = await fetch('/api/generate-question', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              difficulty: scenario.difficulty,
              category: 'general',
            }),
          });

          if (generateResponse.ok) {
            const questionData = await generateResponse.json();
            questions.push({
              id: questionData.question.id,
              correctAnswer: questionData.question.correctAnswer,
              difficulty: scenario.difficulty,
            });
            console.log(`Generated question ${i + 1}: ${scenario.difficulty}`);
          } else {
            console.error(`Failed to generate question ${i + 1}`);
            continue;
          }
        } catch (error) {
          console.error(`Error generating question ${i + 1}:`, error);
          continue;
        }
      }

      console.log(`Generated ${questions.length} questions successfully`);

      // Now simulate answers with real questions
      for (let i = 0; i < questions.length && i < scenarios.length; i++) {
        const scenario = scenarios[i];
        const question = questions[i];
        
        setSimulationStatus(`Answering question ${i + 1}/${questions.length}...`);
        console.log(`Simulating answer ${i + 1}:`, scenario);
        
        // Determine the selected answer (correct or a different option)
        const selectedAnswer = scenario.correct 
          ? question.correctAnswer 
          : (question.correctAnswer === 'A' ? 'B' : 'A');
        
        // Call the submit-answer API
        const response = await fetch('/api/submit-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            questionId: question.id,
            selectedAnswer: selectedAnswer,
            timeTaken: scenario.timeTaken,
            includeExplanation: false,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to submit answer ${i + 1}:`, errorText);
          continue;
        }

        const result = await response.json();
        console.log(`Answer ${i + 1} result:`, result);
        
        // Wait between submissions to see the real-time updates
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Error simulating answers:", error);
    } finally {
      setIsSimulating(false);
      setSimulationStatus('');
    }
  };

  // Auto-create session on mount for convenience
  useEffect(() => {
    createDemoSession();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            🏆 Live Score Updates Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Experience real-time score updates, animations, and achievements
          </p>
          
          {/* Control Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={createDemoSession}
              disabled={isCreating}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
              <span>{isCreating ? 'Creating...' : 'New Session'}</span>
            </button>
            
            <button
              onClick={simulateAnswers}
              disabled={!sessionId || isSimulating}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Play className={`w-4 h-4 ${isSimulating ? 'animate-pulse' : ''}`} />
              <span>{isSimulating ? 'Simulating...' : 'Simulate Answers'}</span>
            </button>
          </div>

          {/* Simulation Status */}
          {simulationStatus && (
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {simulationStatus}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Global Score Update Notification */}
        {hasUpdate && latestUpdate && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border border-green-200 dark:border-green-800 rounded-lg animate-bounce">
            <div className="flex items-center justify-center space-x-3">
              <div className="text-2xl">
                {latestUpdate.isCorrect ? '🎉' : '💪'}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-green-800 dark:text-green-200">
                  {latestUpdate.isCorrect ? 'Correct Answer!' : 'Keep Trying!'}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {latestUpdate.pointsEarned > 0 
                    ? `+${latestUpdate.pointsEarned} points earned`
                    : 'No points this time'
                  } • {latestUpdate.currentStreak > 0 
                    ? `${latestUpdate.currentStreak} streak`
                    : 'Streak reset'
                  }
                </p>
                {latestUpdate.achievement && (
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-1">
                    🏆 {latestUpdate.achievement.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Demo Instructions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                Real-time Updates
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Watch scores update instantly via Supabase Realtime. No page refreshes needed!
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                Live Animations
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Score increases, streaks, and achievements animate in real-time.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                Achievements
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Unlock achievements for streaks, milestones, and perfect scores.
            </p>
          </div>
        </div>

        {/* Live Scoreboard */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Full Scoreboard */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Full Scoreboard
            </h2>
            {sessionId ? (
              <LiveScoreboard key={`full-${sessionId}`} sessionId={sessionId} />
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Creating demo session...
                </p>
              </div>
            )}
          </div>

          {/* Compact Scoreboard */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Compact Scoreboard
            </h2>
            {sessionId ? (
              <LiveScoreboard key={`compact-${sessionId}`} sessionId={sessionId} compact={true} />
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Creating demo session...
                </p>
              </div>
            )}
            
            {/* Demo Info */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                How it works:
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Click &quot;Simulate Answers&quot; to trigger real-time updates</li>
                <li>• Watch scores animate and achievements unlock</li>
                <li>• Notice the instant feedback and live connection status</li>
                <li>• Try opening multiple tabs to see multi-client sync</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
            Technical Implementation
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Real-time Features:
              </h4>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Supabase Realtime database subscriptions</li>
                <li>• Custom broadcast channels for instant updates</li>
                <li>• React Query integration for cache management</li>
                <li>• Custom hooks for score and notification management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Experience:
              </h4>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Instant visual feedback (&lt; 100ms response)</li>
                <li>• Progressive score animations and achievements</li>
                <li>• Connection status indicators</li>
                <li>• Multi-client synchronization</li>
              </ul>
            </div>
          </div>
          
          {sessionId && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Session ID:</strong> {sessionId}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
