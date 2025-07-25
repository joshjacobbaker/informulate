"use client";

import React, { useState } from "react";
import { LiveScoreboard } from "@/components";
import { SupabaseService } from "@/lib/supabase/service";

export default function ScoreboardDemoPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [simulateStats, setSimulateStats] = useState({
    score: 150,
    correctAnswers: 8,
    totalAnswers: 10,
    currentStreak: 3,
    maxStreak: 5,
  });

  // Create a demo session
  const createDemoSession = async () => {
    setIsCreatingSession(true);

    try {
      const response = await fetch("/api/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: "demo-player",
          difficultyPreference: "medium",
          categoryPreference: "Technology",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.session.id);

        // Update the session with demo stats
        const supabaseService = new SupabaseService();
        await supabaseService.updateGameSession(data.session.id, {
          score: simulateStats.score,
          correct_answers: simulateStats.correctAnswers,
          total_answers: simulateStats.totalAnswers,
          current_streak: simulateStats.currentStreak,
          max_streak: simulateStats.maxStreak,
        });
      }
    } catch (error) {
      console.error("Error creating demo session:", error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Simulate score updates
  const simulateScoreUpdate = async () => {
    if (!sessionId) return;

    const supabaseService = new SupabaseService();
    const newStats = {
      score: simulateStats.score + 20,
      correct_answers: simulateStats.correctAnswers + 1,
      total_answers: simulateStats.totalAnswers + 1,
      current_streak: simulateStats.currentStreak + 1,
      max_streak: Math.max(
        simulateStats.maxStreak,
        simulateStats.currentStreak + 1
      ),
    };

    setSimulateStats({
      score: newStats.score,
      correctAnswers: newStats.correct_answers,
      totalAnswers: newStats.total_answers,
      currentStreak: newStats.current_streak,
      maxStreak: newStats.max_streak,
    });

    try {
      await supabaseService.updateGameSession(sessionId, newStats);
    } catch (error) {
      console.error("Error updating demo session:", error);
    }
  };

  const simulateWrongAnswer = async () => {
    if (!sessionId) return;

    const supabaseService = new SupabaseService();
    const newStats = {
      total_answers: simulateStats.totalAnswers + 1,
      current_streak: 0, // Reset streak on wrong answer
    };

    setSimulateStats({
      ...simulateStats,
      totalAnswers: newStats.total_answers,
      currentStreak: newStats.current_streak,
    });

    try {
      await supabaseService.updateGameSession(sessionId, newStats);
    } catch (error) {
      console.error("Error updating demo session:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Live Scoreboard Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the real-time scoreboard that updates instantly as
            players progress through the game. This demo showcases live
            statistics tracking with Supabase Realtime.
          </p>
        </div>

        {!sessionId ? (
          /* Create Session Section */
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Create Demo Session
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start a demo session to see the live scoreboard in action.
              </p>
              <button
                onClick={createDemoSession}
                disabled={isCreatingSession}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isCreatingSession ? "Creating Session..." : "Start Demo"}
              </button>
            </div>
          </div>
        ) : (
          /* Demo Section */
          <div className="space-y-8">
            {/* Scoreboard Display */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Full Scoreboard */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Full Scoreboard
                </h2>
                <LiveScoreboard sessionId={sessionId} />
              </div>

              {/* Compact Scoreboard */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Compact View
                </h2>
                <LiveScoreboard sessionId={sessionId} compact />

                {/* Demo Controls */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Simulate Game Actions
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={simulateScoreUpdate}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      ✅ Correct Answer (+20 points)
                    </button>
                    <button
                      onClick={simulateWrongAnswer}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      ❌ Wrong Answer (reset streak)
                    </button>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>💡 Tip:</strong> Watch how the scoreboard updates
                      in real-time when you click the buttons above. In a real
                      game, these updates happen automatically as players answer
                      questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Showcase */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Scoreboard Features
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    🔴 Real-time Updates
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Instant score updates using Supabase Realtime subscriptions
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    📊 Comprehensive Stats
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Score, accuracy, streaks, and progress tracking
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    🎨 Dynamic UI
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Color-coded performance indicators and animations
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    📱 Responsive Design
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Compact and full views for different screen sizes
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    🔥 Streak Celebrations
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Special animations and notifications for achievement streaks
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    📡 Connection Status
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Visual indicators for live connection status
                  </p>
                </div>
              </div>
            </div>

            {/* Integration Instructions */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Integration Instructions
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    1. Import the Component
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg font-mono text-sm">
                    import {`{ LiveScoreboard }`} from &apos;@/components&apos;;
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    2. Use in Your Game UI
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg font-mono text-sm">
                    {`<LiveScoreboard sessionId={sessionId} compact={true} />`}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    3. Real-time Updates
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    The component automatically subscribes to Supabase Realtime
                    updates for the game session. No additional setup required -
                    it will update instantly when scores change!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
