"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GameQuestion, LiveScoreboard } from "@/components";
import { useCreateGameSession } from "@/lib/query/gameSessionQuery";
import GameInstructions from "@/components/GameInstructions/GameInstructions";
import GameStatsCard from "@/components/GameStatsCard/GameStatsCard";
import GameControlsHeader from "@/components/GameControlsHeader/GameControlsHeader";
import GameStartNewGame from "@/components/GameStartNewGame/GameStartNewGame";

export default function GamePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const router = useRouter();
  const createGameSession = useCreateGameSession();

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
      const result = await createGameSession.mutateAsync({
        playerId: `player-${Date.now()}`,
        difficulty: "medium",
        category: "any",
      });

      setSessionId(result.session.id);
      setGameStarted(true);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Failed to start game. Please try again.");
    }
  }, [createGameSession]);

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
              category="any"
              difficulty="medium"
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
