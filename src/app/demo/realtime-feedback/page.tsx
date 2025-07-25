"use client";

import React, { useState, useEffect } from "react";
import GameQuestion from "@/components/GameQuestion";
import LiveScoreboard from "@/components/LiveScoreboard";
import { SupabaseService } from "@/lib/supabase/service";
import { useAnswerFeedbackRealtime } from "@/lib/query";

export default function RealtimeFeedbackDemo() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the real-time feedback hook
  const { latestFeedback, hasNewFeedback } = useAnswerFeedbackRealtime(sessionId);

  useEffect(() => {
    async function setupDemoSession() {
      try {
        setIsLoading(true);
        const supabaseService = new SupabaseService();
        
        // Create a demo session
        const session = await supabaseService.createGameSession('demo-realtime-player');
        if (session) {
          setSessionId(session.id);
        }
      } catch (error) {
        console.error('Failed to setup demo session:', error);
      } finally {
        setIsLoading(false);
      }
    }

    setupDemoSession();
  }, []);

  const handleScoreUpdate = (newScore: number, isCorrect: boolean) => {
    console.log(`Score updated: ${newScore} (${isCorrect ? 'correct' : 'incorrect'})`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Setting up real-time demo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Demo Setup Error</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Could not create demo session. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Real-time Answer Feedback Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Experience instant feedback and explanations powered by Supabase Realtime and AI. 
            Watch how answers are processed in real-time with immediate visual feedback.
          </p>
          
          {/* Real-time Status Indicator */}
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Real-time Connected • Session: {sessionId.slice(-8)}
          </div>
        </div>

        {/* Real-time Feedback Status */}
        {hasNewFeedback && latestFeedback && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                  📡 Live Real-time Feedback Detected
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Question ID:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{latestFeedback.questionId.slice(-8)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Result:</span>
                  <span className={`ml-2 font-medium ${
                    latestFeedback.isCorrect 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {latestFeedback.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Points:</span>
                  <span className="ml-2 text-blue-600 dark:text-blue-400">+{latestFeedback.pointsEarned}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Explanation:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {latestFeedback.hasExplanation ? '📚 Ready' : '⏳ Loading...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Question */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🎮 Interactive Question
              </h2>
              <GameQuestion
                sessionId={sessionId}
                category="Science & Nature"
                difficulty="medium"
                onScoreUpdate={handleScoreUpdate}
              />
            </div>
          </div>

          {/* Live Scoreboard */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Live Score
              </h2>
              <LiveScoreboard sessionId={sessionId} />
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  ⚡ Instant Feedback
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  See your answer result immediately via real-time broadcast while the AI explanation loads.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                  🧠 AI Explanations
                </h3>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Rich AI-generated explanations appear in real-time as they&apos;re generated by OpenAI.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                  📡 Real-time Updates
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Scores, streaks, and statistics update instantly across all connected clients.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🔧 How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Real-time Flow
              </h3>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">1</span>
                  User submits answer
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">2</span>
                  Immediate broadcast sent (correct/incorrect, points)
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">3</span>
                  AI explanation generated asynchronously
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">4</span>
                  Explanation broadcast when ready
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">5</span>
                  Final complete result sent
                </li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Technical Stack
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Supabase Realtime for instant updates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  React Query for caching and state management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  OpenAI API for explanation generation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Custom events for UI coordination
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  TypeScript for type safety
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
