"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GameQuestion, LiveScoreboard } from "@/components";
import { useCreateGameSession } from "@/lib/query/gameSessionQuery";
import { useGameConfig, useGameStore } from "@/lib/stores/gameStore/gameStore";
import GameInstructions from "@/components/GameInstructions/GameInstructions";
import GameStatsCard from "@/components/GameStatsCard/GameStatsCard";
import GameControlsHeader from "@/components/GameControlsHeader/GameControlsHeader";
import GameStartNewGame from "@/components/GameStartNewGame/GameStartNewGame";

export default function GamePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const router = useRouter();
  const createGameSession = useCreateGameSession();
  const gameConfig = useGameConfig();
  const storePlayerId = useGameStore((state) => state.playerId);
  const updateConfig = useGameStore((state) => state.updateConfig);
  const initializeGame = useGameStore((state) => state.initializeGame);

  // Check for existing session in localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("gameSession");
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setSessionId(session.id);
        setGameStarted(true);
      } catch (error) {
        console.error("Error parsing stored session:", error);
        localStorage.removeItem("gameSession");
      }
    }
  }, []);

  const startNewGame = useCallback(async () => {
    try {
      const playerId = storePlayerId || `player-${Date.now()}`;
      const result = await createGameSession.mutateAsync({
        playerId: playerId,
        difficulty: gameConfig.difficulty,
        category: gameConfig.category,
      });

      // Initialize the Zustand store with the session and current config
      initializeGame(result.session.id, playerId, gameConfig);

      setSessionId(result.session.id);
      setGameStarted(true);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Failed to start game. Please try again.");
    }
  }, [createGameSession, storePlayerId, gameConfig, initializeGame]);

  const handleScoreUpdate = (newScore: number, isCorrect: boolean) => {
    // Score updates are handled by the LiveScoreboard component automatically
    // This callback can be used for additional game logic if needed
    console.log(`Score updated: ${newScore}, correct: ${isCorrect}`);
  };

  const handleQuestionComplete = () => {};

  const endGame = useCallback(() => {
    localStorage.removeItem("gameSession");
    setSessionId(null);
    setGameStarted(false);
    router.push("/");
  }, [router]);

  if (!gameStarted || !sessionId) {
    return (
      <GameStartNewGame
        startNewGame={startNewGame}
        createGameSession={createGameSession}
        gameConfig={gameConfig}
        onConfigChange={updateConfig}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Game Controls */}
        <GameControlsHeader endGame={endGame} />

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
              category={gameConfig.category}
              difficulty={gameConfig.difficulty}
              onScoreUpdate={handleScoreUpdate}
              onQuestionComplete={handleQuestionComplete}
            />
          </div>

          {/* Game Stats Card */}
          <GameStatsCard />

          {/* Instructions */}
          <GameInstructions />
        </div>
      </div>
    </div>
  );
}
