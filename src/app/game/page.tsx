'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameQuestion, LiveScoreboard } from '@/components';
import { useCreateGameSession } from '@/lib/query/gameSessionQuery';

export default function GamePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  const router = useRouter();
  const createGameSession = useCreateGameSession();

  // Check for existing session in localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('gameSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setSessionId(session.id);
        setGameStarted(true);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('gameSession');
      }
    }
  }, []);

  const startNewGame = async () => {
    try {
      const result = await createGameSession.mutateAsync({
        playerId: `player-${Date.now()}`,
        difficulty: 'medium',
        category: 'any'
      });
      
      setSessionId(result.session.id);
      setGameStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleScoreUpdate = (newScore: number, isCorrect: boolean) => {
    // Score updates are handled by the LiveScoreboard component automatically
    // This callback can be used for additional game logic if needed
    console.log(`Score updated: ${newScore}, correct: ${isCorrect}`);
  };

  const handleQuestionComplete = () => {
    // Auto-generate next question after a delay
    setTimeout(() => {
      // The GameQuestion component will automatically generate the next question
    }, 3000);
  };

  const endGame = () => {
    localStorage.removeItem('gameSession');
    setSessionId(null);
    setGameStarted(false);
    router.push('/');
  };

  if (!gameStarted || !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                AI Trivia Arena
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Test your knowledge with AI-generated questions and watch your score update in real-time!
              </p>
              
              <button
                onClick={startNewGame}
                disabled={createGameSession.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {createGameSession.isPending ? 'Starting Game...' : 'Start New Game'}
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full mt-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium py-2 px-4 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Game Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200">
            AI Trivia Arena
          </h1>
          
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/scoreboard-demo')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              View Demo
            </button>
            <button
              onClick={endGame}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              End Game
            </button>
          </div>
        </div>

        {/* Main Game Layout */}
        <div className="space-y-6">
          {/* Live Scoreboard */}
          <div className="w-full">
            <LiveScoreboard sessionId={sessionId} compact />
          </div>

          {/* Game Question */}
          <div className="w-full">
            <GameQuestion
              sessionId={sessionId}
              category="any"
              difficulty="medium"
              onScoreUpdate={handleScoreUpdate}
              onQuestionComplete={handleQuestionComplete}
            />
          </div>

          {/* Game Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Game Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  🔴
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                  Live Updates
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Real-time scoring
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  🤖
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                  AI Generated
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Dynamic questions  
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  🔥
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                  Streak Tracking
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Bonus rewards
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ⚡
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                  Smart Scoring
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Time + difficulty
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              How to Play
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <strong>1. Answer Questions:</strong> Select your answer from the multiple choice options.
              </div>
              <div>
                <strong>2. Watch Your Score:</strong> The scoreboard updates instantly with your progress.
              </div>
              <div>
                <strong>3. Build Streaks:</strong> Get consecutive correct answers for bonus points.
              </div>
              <div>
                <strong>4. Learn & Improve:</strong> Read AI explanations after each answer.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
