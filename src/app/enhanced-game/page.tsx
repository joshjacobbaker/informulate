'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedGameQuestion from '@/components/EnhancedGameQuestion';
import { LiveScoreboard } from '@/components';
import { useCreateGameSession } from '@/lib/query/gameSessionQuery';
import { useGameState, useGameStats } from '@/lib/stores/gameStore';
import { useGameFlow } from '@/lib/stores/gameFlow';

export default function EnhancedGamePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const router = useRouter();
  const createGameSession = useCreateGameSession();
  const gameState = useGameState();
  const gameStats = useGameStats();
  const gameFlow = useGameFlow();

  // Check for existing session in localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('gameSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setSessionId(session.id);
        setPlayerId(session.playerId || `player-${Date.now()}`);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('gameSession');
      }
    }
  }, []);

  const startNewGame = async () => {
    try {
      const newPlayerId = `player-${Date.now()}`;
      const result = await createGameSession.mutateAsync({
        playerId: newPlayerId,
        difficulty: 'medium',
        category: 'any',
      });

      setSessionId(result.session.id);
      setPlayerId(newPlayerId);
      setIsInitialized(true);

      // Store session data
      localStorage.setItem('gameSession', JSON.stringify({
        id: result.session.id,
        playerId: newPlayerId,
      }));
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleScoreUpdate = (newScore: number, isCorrect: boolean) => {
    console.log(`Score updated: ${newScore}, correct: ${isCorrect}`);
  };

  const handleQuestionComplete = () => {
    console.log('Question completed!');
  };

  const handleGameEnd = () => {
    console.log('Game ended!');
    localStorage.removeItem('gameSession');
    setSessionId(null);
    setPlayerId(null);
    setIsInitialized(false);
  };

  const endGame = () => {
    gameFlow.endGame();
    handleGameEnd();
  };

  const pauseGame = () => {
    gameFlow.pauseGame();
  };

  const resumeGame = () => {
    gameFlow.resumeGame();
  };

  const resetGame = () => {
    gameFlow.resetGame();
    handleGameEnd();
  };

  // Show game start screen if not initialized
  if (!isInitialized || !sessionId || !playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                🎯 Enhanced AI Trivia Arena
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Experience the complete game flow with advanced state management, 
                endless question loops, and real-time scoring!
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>🧠</span>
                  <span>AI-powered questions</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>⚡</span>
                  <span>Real-time game state</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>🎮</span>
                  <span>Endless game loop</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>🏆</span>
                  <span>Achievement system</span>
                </div>
              </div>

              <button
                onClick={startNewGame}
                disabled={createGameSession.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {createGameSession.isPending
                  ? 'Starting Game...'
                  : 'Start Enhanced Game'}
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
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200">
              🎯 Enhanced AI Trivia Arena
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Player: {playerId} • Session: {sessionId?.slice(-8)}
            </p>
          </div>

          <div className="flex space-x-3">
            {gameState === 'paused' ? (
              <button
                onClick={resumeGame}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Resume Game
              </button>
            ) : (
              <button
                onClick={pauseGame}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Pause Game
              </button>
            )}
            <button
              onClick={resetGame}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reset Game
            </button>
            <button
              onClick={endGame}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              End Game
            </button>
          </div>
        </div>

        {/* Game State Indicator */}
        {gameState === 'paused' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">⏸️</span>
              <span className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Game Paused
              </span>
            </div>
            <p className="text-center text-yellow-700 dark:text-yellow-300 mt-2">
              Click &quot;Resume Game&quot; to continue playing
            </p>
          </div>
        )}

        {/* Main Game Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Question - Takes most of the space */}
          <div className="lg:col-span-3">
            <EnhancedGameQuestion
              sessionId={sessionId}
              playerId={playerId}
              onScoreUpdate={handleScoreUpdate}
              onQuestionComplete={handleQuestionComplete}
              onGameEnd={handleGameEnd}
            />
          </div>

          {/* Sidebar with Live Scoreboard and Game Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Scoreboard */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                📊 Live Score
              </h2>
              <LiveScoreboard sessionId={sessionId} compact />
            </div>

            {/* Game State Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                🎮 Game State
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    gameState === 'playing' 
                      ? 'text-green-600 dark:text-green-400' 
                      : gameState === 'paused'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {gameState === 'playing' ? '🟢 Playing' : 
                     gameState === 'paused' ? '🟡 Paused' : 
                     gameState === 'ended' ? '🔴 Ended' : '⚪ Idle'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {gameStats.questionsAnswered}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {gameStats.accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Best Streak:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {gameStats.maxStreak}
                  </span>
                </div>
              </div>
            </div>

            {/* Game Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                ✨ Enhanced Features
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Game state management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Endless question loop</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Auto-advance questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Achievement system</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Pause/resume game</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Timer with auto-submit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Real-time statistics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
