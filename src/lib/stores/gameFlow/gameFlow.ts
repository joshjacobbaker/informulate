'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore, GameConfig, AnswerResult } from '../gameStore/gameStore';
import { 
  useGenerateQuestion, 
  useSubmitAnswer, 
  GenerateQuestionRequest 
} from '@/lib/query';

// Custom hook for managing the complete game flow
export const useGameFlow = () => {
  const gameStore = useGameStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // React Query hooks
  const generateQuestionMutation = useGenerateQuestion();
  const submitAnswerMutation = useSubmitAnswer();
  
  // Timer management
  const stopQuestionTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Achievement detection
  const checkForAchievements = useCallback((isCorrect: boolean, pointsEarned: number) => {
    if (!isCorrect) return undefined;
    
    const state = useGameStore.getState();
    const stats = state.stats;
    const newStreak = stats.currentStreak + 1;
    
    // Streak achievements
    if (newStreak === 5) {
      return {
        type: 'streak' as const,
        value: 5,
        message: '🔥 5 Question Streak!',
      };
    }
    if (newStreak === 10) {
      return {
        type: 'streak' as const,
        value: 10,
        message: '🚀 10 Question Streak!',
      };
    }
    if (newStreak === 20) {
      return {
        type: 'streak' as const,
        value: 20,
        message: '🏆 INCREDIBLE! 20 Question Streak!',
      };
    }
    
    // Score milestones
    const newScore = stats.totalScore + pointsEarned;
    if (newScore >= 1000 && stats.totalScore < 1000) {
      return {
        type: 'milestone' as const,
        value: 1000,
        message: '🎯 1000 Points Milestone!',
      };
    }
    if (newScore >= 5000 && stats.totalScore < 5000) {
      return {
        type: 'milestone' as const,
        value: 5000,
        message: '💎 5000 Points Milestone!',
      };
    }
    
    // Speed bonus (answer within 10 seconds)
    const timeTaken = state.config.timePerQuestion - (state.currentQuestion?.timeRemaining || 0);
    if (timeTaken <= 10) {
      return {
        type: 'speed_bonus' as const,
        value: pointsEarned,
        message: '⚡ Speed Bonus!',
      };
    }
    
    return undefined;
  }, []);

  const startQuestionTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    gameStore.startQuestionTimer();
    
    timerRef.current = setInterval(() => {
      const currentState = useGameStore.getState();
      const currentQuestion = currentState.currentQuestion;
      if (!currentQuestion || currentQuestion.isSubmitted) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      
      const newTimeRemaining = Math.max(0, currentQuestion.timeRemaining - 1);
      gameStore.updateTimer(newTimeRemaining);
      
      // Auto-submit when time runs out - handled by the component
      if (newTimeRemaining === 0) {
        // Timer expired, let the component handle auto-submit
      }
    }, 1000);
  }, [gameStore]);

  // Generate the first question
  const generateFirstQuestion = useCallback(async () => {
    const state = useGameStore.getState();
    if (!state.sessionId || !state.config) return;
    
    try {
      gameStore.setError(null);
      
      const request: GenerateQuestionRequest = {
        sessionId: state.sessionId,
        category: state.config.category === 'any' ? undefined : state.config.category,
        difficulty: state.config.difficulty,
        useAI: true,
      };
      
      const result = await generateQuestionMutation.mutateAsync(request);
      
      if (result?.question) {
        gameStore.setCurrentQuestion({
          id: result.question.id,
          question: result.question.question,
          options: result.question.options,
          correctAnswer: result.question.correctAnswer,
          category: result.question.category,
          difficulty: result.question.difficulty,
          selectedAnswer: undefined,
        });
        
        startQuestionTimer();
      }
    } catch (error) {
      gameStore.setError('Failed to generate question');
      console.error('Error generating first question:', error);
    }
  }, [gameStore, generateQuestionMutation, startQuestionTimer]);

  // Generate next question in the endless loop
  const generateNextQuestion = useCallback(async () => {
    const state = useGameStore.getState();
    if (!state.sessionId || state.gameState !== 'playing') return;
    
    try {
      gameStore.nextQuestion(); // Reset question state
      gameStore.setError(null);
      
      const request: GenerateQuestionRequest = {
        sessionId: state.sessionId,
        category: state.config.category === 'any' ? undefined : state.config.category,
        difficulty: state.config.difficulty,
        useAI: true,
      };
      
      const result = await generateQuestionMutation.mutateAsync(request);
      
      if (result?.question) {
        gameStore.setCurrentQuestion({
          id: result.question.id,
          question: result.question.question,
          options: result.question.options,
          correctAnswer: result.question.correctAnswer,
          category: result.question.category,
          difficulty: result.question.difficulty,
          selectedAnswer: undefined,
        });
        
        startQuestionTimer();
      }
    } catch (error) {
      gameStore.setError('Failed to generate next question');
      console.error('Error generating next question:', error);
    }
  }, [gameStore, generateQuestionMutation, startQuestionTimer]);

  // Submit answer and handle validation
  const submitAnswer = useCallback(async (selectedAnswer?: string) => {
    const state = useGameStore.getState();
    if (!state.currentQuestion || !state.sessionId) return;
    
    const answer = selectedAnswer || state.currentQuestion.selectedAnswer;
    if (!answer) return;
    
    try {
      stopQuestionTimer();
      
      const timeTaken = Math.max(1, state.config.timePerQuestion - state.currentQuestion.timeRemaining);
      
      const result = await submitAnswerMutation.mutateAsync({
        sessionId: state.sessionId,
        questionId: state.currentQuestion.id,
        selectedAnswer: answer,
        timeTaken,
      });
      
      // Create answer result
      const answerResult: AnswerResult = {
        isCorrect: result.result.isCorrect,
        pointsEarned: result.result.pointsEarned || 0,
        correctAnswer: result.result.correctAnswer || state.currentQuestion.correctAnswer,
        selectedAnswer: answer,
        timeTaken,
        explanation: typeof result.result.explanation === 'string' 
          ? result.result.explanation 
          : result.result.explanation?.explanation || undefined,
        streakBroken: !result.result.isCorrect && state.stats.currentStreak > 0,
        achievement: checkForAchievements(result.result.isCorrect, result.result.pointsEarned || 0),
      };
      
      // Update game state
      gameStore.submitAnswer(answerResult);
      
      // Note: Auto-advance removed - users must manually click "Next Question"
      
      return answerResult;
    } catch (error) {
      gameStore.setError('Failed to submit answer');
      console.error('Error submitting answer:', error);
      return null;
    }
  }, [gameStore, submitAnswerMutation, stopQuestionTimer, checkForAchievements]);

  // Start a new game session
  const startNewGame = useCallback(async (
    playerId: string, 
    sessionId: string,
    config: Partial<GameConfig> = {}
  ) => {
    try {
      gameStore.initializeGame(sessionId, playerId, config);
      gameStore.startGame();
      
      // Generate first question
      await generateFirstQuestion();
      
      return { success: true };
    } catch (error) {
      gameStore.setError(error instanceof Error ? error.message : 'Failed to start game');
      return { success: false, error };
    }
  }, [gameStore, generateFirstQuestion]);

  // Handle answer selection
  const selectAnswer = useCallback((answer: string) => {
    const state = useGameStore.getState();
    if (state.currentQuestion && !state.currentQuestion.isSubmitted) {
      gameStore.selectAnswer(answer);
    }
  }, [gameStore]);

  // Manual next question (when auto-advance is disabled)
  const proceedToNextQuestion = useCallback(() => {
    generateNextQuestion();
  }, [generateNextQuestion]);

  const pauseQuestionTimer = useCallback(() => {
    stopQuestionTimer();
    gameStore.pauseGame();
  }, [gameStore, stopQuestionTimer]);

  const resumeQuestionTimer = useCallback(() => {
    const state = useGameStore.getState();
    if (state.gameState === 'paused') {
      gameStore.resumeGame();
      startQuestionTimer();
    }
  }, [gameStore, startQuestionTimer]);

  // Game control actions
  const pauseGame = useCallback(() => {
    pauseQuestionTimer();
  }, [pauseQuestionTimer]);

  const resumeGame = useCallback(() => {
    resumeQuestionTimer();
  }, [resumeQuestionTimer]);

  const endGame = useCallback(() => {
    stopQuestionTimer();
    gameStore.endGame();
  }, [gameStore, stopQuestionTimer]);

  const resetGame = useCallback(() => {
    stopQuestionTimer();
    gameStore.resetGame();
  }, [gameStore, stopQuestionTimer]);

  // Configuration updates
  const updateGameConfig = useCallback((config: Partial<GameConfig>) => {
    gameStore.updateConfig(config);
  }, [gameStore]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Return the game flow interface
  return {
    // Game state
    gameState: gameStore.gameState,
    questionState: gameStore.questionState,
    currentQuestion: gameStore.currentQuestion,
    stats: gameStore.stats,
    config: gameStore.config,
    lastResult: gameStore.lastResult,
    error: gameStore.error,
    sessionId: gameStore.sessionId,
    playerId: gameStore.playerId,
    
    // Game lifecycle
    startNewGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    
    // Question flow
    generateFirstQuestion,
    generateNextQuestion,
    selectAnswer,
    submitAnswer,
    proceedToNextQuestion,
    
    // Configuration
    updateGameConfig,
    
    // Utils
    isLoading: generateQuestionMutation.isPending || submitAnswerMutation.isPending,
    hasError: !!gameStore.error || generateQuestionMutation.isError || submitAnswerMutation.isError,
    
    // Computed values
    canSubmit: gameStore.currentQuestion?.selectedAnswer && !gameStore.currentQuestion?.isSubmitted,
    questionsRemaining: gameStore.config.maxQuestions 
      ? gameStore.config.maxQuestions - gameStore.stats.questionsAnswered 
      : null,
    gameProgress: gameStore.config.maxQuestions 
      ? (gameStore.stats.questionsAnswered / gameStore.config.maxQuestions) * 100 
      : null,
  };
};

// Helper hook for game statistics
export const useGameStatistics = () => {
  const stats = useGameStore((state) => state.stats);
  const gameState = useGameStore((state) => state.gameState);
  
  return {
    ...stats,
    isGameActive: gameState === 'playing',
    formattedAccuracy: `${stats.accuracy.toFixed(1)}%`,
    questionsPerMinute: stats.totalTimePlayed > 0 
      ? (stats.questionsAnswered / (stats.totalTimePlayed / 60000)).toFixed(1)
      : '0',
    averageTimeFormatted: `${stats.averageTimePerQuestion.toFixed(1)}s`,
  };
};

// Helper hook for game timers
export const useGameTimer = () => {
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const gameState = useGameStore((state) => state.gameState);
  
  const timeRemaining = currentQuestion?.timeRemaining || 0;
  const progress = currentQuestion 
    ? ((useGameStore.getState().config.timePerQuestion - timeRemaining) / useGameStore.getState().config.timePerQuestion) * 100
    : 0;
  
  return {
    timeRemaining,
    timeRemainingFormatted: `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`,
    progress,
    isTimerActive: gameState === 'playing' && !currentQuestion?.isSubmitted,
    isTimeRunningOut: timeRemaining <= 10 && timeRemaining > 0,
    hasTimeExpired: timeRemaining === 0 && currentQuestion !== null && gameState === 'playing',
  };
};
