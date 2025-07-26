"use client";

import React, { useEffect, useCallback } from "react";
import { QuestionCard } from "@/components";
import { ExplanationPanel } from "@/components";
import { useGameFlow, useGameTimer } from "@/lib/stores/gameFlow/gameFlow";
import { useGameStore } from "@/lib/stores/gameStore/gameStore";

interface EnhancedGameQuestionProps {
  sessionId: string;
  playerId: string;
  onScoreUpdate?: (newScore: number, isCorrect: boolean) => void;
  onQuestionComplete?: () => void;
  onGameEnd?: () => void;
  className?: string;
}

const EnhancedGameQuestion: React.FC<EnhancedGameQuestionProps> = ({
  sessionId,
  playerId,
  onScoreUpdate,
  onQuestionComplete,
  onGameEnd,
  className = "",
}) => {
  const gameFlow = useGameFlow();
  const timer = useGameTimer();
  const gameStore = useGameStore();

  // Initialize the game if not already initialized
  useEffect(() => {
    if (!gameStore.sessionId && sessionId) {
      gameFlow.startNewGame(playerId, sessionId, {
        difficulty: "medium",
        category: "any",
        timePerQuestion: 60,
        enableExplanations: true,
        autoAdvance: false,
        autoAdvanceDelay: 3,
      });
    }
  }, [sessionId, playerId, gameStore.sessionId, gameFlow]);

  // Handle auto-submit when timer expires
  useEffect(() => {
    if (
      timer.hasTimeExpired &&
      timer.isTimerActive &&
      gameFlow.currentQuestion &&
      !gameFlow.currentQuestion.isSubmitted
    ) {
      gameFlow.submitAnswer(""); // Submit empty answer on timeout
    }
  }, [timer.hasTimeExpired, timer.isTimerActive, gameFlow]);

  // Callback for score updates
  useEffect(() => {
    if (gameFlow.lastResult && onScoreUpdate) {
      onScoreUpdate(gameFlow.stats.totalScore, gameFlow.lastResult.isCorrect);
    }
  }, [gameFlow.lastResult, gameFlow.stats.totalScore, onScoreUpdate]);

  // Callback for question completion
  useEffect(() => {
    if (gameFlow.lastResult && onQuestionComplete) {
      onQuestionComplete();
    }
  }, [gameFlow.lastResult, onQuestionComplete]);

  // Callback for game end
  useEffect(() => {
    if (gameFlow.gameState === "ended" && onGameEnd) {
      onGameEnd();
    }
  }, [gameFlow.gameState, onGameEnd]);

  const handleAnswerSelect = useCallback(
    (answer: string) => {
      gameFlow.selectAnswer(answer);
    },
    [gameFlow]
  );

  const handleSubmitAnswer = useCallback(async () => {
    if (gameFlow.canSubmit) {
      await gameFlow.submitAnswer();
    }
  }, [gameFlow]);

  const handleNextQuestion = useCallback(() => {
    gameFlow.proceedToNextQuestion();
  }, [gameFlow]);

  // Convert game store question to QuestionCard format
  const questionData = gameFlow.currentQuestion
    ? {
        id: gameFlow.currentQuestion.id,
        question: gameFlow.currentQuestion.question,
        options: gameFlow.currentQuestion.options,
        correctAnswer: gameFlow.currentQuestion.correctAnswer,
        category: gameFlow.currentQuestion.category,
        difficulty: gameFlow.currentQuestion.difficulty as
          | "easy"
          | "medium"
          | "hard",
      }
    : null;

  // Loading state
  if (gameFlow.isLoading || !questionData) {
    return (
      <div className={`max-w-4xl mx-auto p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (gameFlow.hasError) {
    return (
      <div className={`max-w-4xl mx-auto p-4 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Game Error
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {gameFlow.error || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => gameFlow.generateNextQuestion()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Game Status Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Question:
              </span>
              <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold">
                #{gameFlow.stats.questionsAnswered + 1}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Score:
              </span>
              <span className="ml-1 text-green-600 dark:text-green-400 font-bold">
                {gameFlow.stats.totalScore}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Streak:
              </span>
              <span className="ml-1 text-orange-600 dark:text-orange-400 font-bold">
                {gameFlow.stats.currentStreak}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                timer.isTimeRunningOut
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              }`}
            >
              ⏱️ {timer.timeRemainingFormatted}
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                gameFlow.gameState === "playing"
                  ? "bg-green-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            ></div>
          </div>
        </div>

        {/* Timer Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                timer.isTimeRunningOut ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${timer.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard
        question={questionData}
        selectedAnswer={gameFlow.currentQuestion?.selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        timeRemaining={timer.timeRemaining}
        isSubmitted={gameFlow.currentQuestion?.isSubmitted || false}
        showCorrectAnswer={gameFlow.questionState === "reviewing"}
        isLoading={gameFlow.isLoading}
      />

      {/* Submit Button */}
      {!gameFlow.currentQuestion?.isSubmitted &&
        gameFlow.currentQuestion?.selectedAnswer && (
          <div className="text-center">
            <button
              onClick={handleSubmitAnswer}
              disabled={gameFlow.isLoading || !gameFlow.canSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {gameFlow.isLoading ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        )}

      {/* Achievement Notification */}
      {gameFlow.lastResult?.achievement && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-1">
              Achievement Unlocked!
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              {gameFlow.lastResult.achievement.message}
            </p>
          </div>
        </div>
      )}

      {/* Answer Result & Explanation */}
      {gameFlow.lastResult && gameFlow.questionState === "reviewing" && (
        <div className="space-y-4">
          <ExplanationPanel
            isCorrect={gameFlow.lastResult.isCorrect}
            correctAnswer={gameFlow.lastResult.correctAnswer}
            userAnswer={gameFlow.lastResult.selectedAnswer}
            explanation={gameFlow.lastResult.explanation}
            pointsEarned={gameFlow.lastResult.pointsEarned}
            variant="default"
            showScoreInfo={true}
            animateOnMount={true}
          />

          {/* Manual Next Button */}
          <div className="text-center">
            <button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Next Question →
            </button>
          </div>
        </div>
      )}

      {/* Game Statistics */}
      {gameFlow.stats.questionsAnswered > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📊 Session Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gameFlow.stats.questionsAnswered}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {gameFlow.stats.accuracy.toFixed(1)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {gameFlow.stats.maxStreak}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Best Streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {gameFlow.stats.totalScore}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total Score
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGameQuestion;
