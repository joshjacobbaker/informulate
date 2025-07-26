"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { GameConfig } from "@/lib/stores/gameStore/gameStore";

type CreateGameSession = {
  isPending: boolean;
};

type GameStartNewGameProps = {
  startNewGame: () => void;
  createGameSession: CreateGameSession;
  gameConfig: GameConfig;
  onConfigChange: (config: Partial<GameConfig>) => void;
};

const GameStartNewGame: React.FC<GameStartNewGameProps> = ({
  startNewGame,
  createGameSession,
  gameConfig,
  onConfigChange,
}) => {
  const router = useRouter();

  const handleBackToHome = React.useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              AI Trivia Arena
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Test your knowledge with AI-generated questions and watch your
              score update in real-time!
            </p>

            {/* Game Configuration */}
            <div className="space-y-6 mb-8">
              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => onConfigChange({ difficulty: level })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        gameConfig.difficulty === level
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "any", label: "Any Category" },
                    { value: "science", label: "Science" },
                    { value: "history", label: "History" },
                    { value: "sports", label: "Sports" },
                    { value: "geography", label: "Geography" },
                    { value: "entertainment", label: "Entertainment" },
                  ].map((category) => (
                    <button
                      key={category.value}
                      onClick={() => onConfigChange({ category: category.value })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        gameConfig.category === category.value
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startNewGame}
              disabled={createGameSession.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {createGameSession.isPending
                ? "Starting Game..."
                : "Start New Game"}
            </button>

            <button
              onClick={handleBackToHome}
              className="w-full mt-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium py-2 px-4 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStartNewGame;
