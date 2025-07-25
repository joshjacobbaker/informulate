'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Game states
export type GameState = 'idle' | 'starting' | 'playing' | 'paused' | 'ended';
export type QuestionState = 'loading' | 'ready' | 'answering' | 'submitted' | 'reviewing';

// Game flow configuration
export interface GameConfig {
  playerName: string; // Optional player name
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timePerQuestion: number; // seconds
  maxQuestions?: number; // optional limit, infinite if not set
  enableExplanations: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // seconds
}

// Current question state
export interface CurrentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: string;
  timeRemaining: number;
  selectedAnswer?: string;
  startTime: number;
  isSubmitted: boolean;
}

// Game statistics
export interface GameStats {
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  maxStreak: number;
  totalScore: number;
  totalTimePlayed: number; // seconds
  averageTimePerQuestion: number;
  accuracy: number;
  pointsThisSession: number;
  startTime: number;
}

// Answer result
export interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: string;
  selectedAnswer: string;
  timeTaken: number;
  explanation?: string;
  streakBroken?: boolean;
  achievement?: {
    type: 'streak' | 'milestone' | 'perfect_streak' | 'speed_bonus';
    value: number;
    message: string;
  };
}

// Game store state
export interface GameStore {
  // Session state
  sessionId: string | null;
  playerId: string | null;
  
  // Game flow state
  gameState: GameState;
  questionState: QuestionState;
  
  // Configuration
  config: GameConfig;
  
  // Current question
  currentQuestion: CurrentQuestion | null;
  questionHistory: string[]; // Track asked question IDs
  
  // Game statistics
  stats: GameStats;
  
  // Last answer result
  lastResult: AnswerResult | null;
  
  // Error handling
  error: string | null;
  
  // Actions
  initializeGame: (sessionId: string, playerId: string, config: Partial<GameConfig>) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Question flow
  setCurrentQuestion: (question: Omit<CurrentQuestion, 'timeRemaining' | 'startTime' | 'isSubmitted'>) => void;
  selectAnswer: (answer: string) => void;
  submitAnswer: (result: AnswerResult) => void;
  nextQuestion: () => void;
  
  // Timer management
  updateTimer: (timeRemaining: number) => void;
  startQuestionTimer: () => void;
  pauseQuestionTimer: () => void;
  
  // Configuration updates
  updateConfig: (config: Partial<GameConfig>) => void;
  setPlayerName: (config: { playerName: GameConfig['playerName'] }) => void;
  setDifficulty: (config: { difficulty: GameConfig['difficulty'] }) => void;
  setCategory: (config: { category: GameConfig['category'] }) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Statistics
  updateStats: (updates: Partial<GameStats>) => void;
  calculateAccuracy: () => number;
  getGameDuration: () => number;
}

// Default configuration
const defaultConfig: GameConfig = {
  playerName: '',
  difficulty: 'medium',
  category: 'any',
  timePerQuestion: 60,
  enableExplanations: true,
  autoAdvance: false,
  autoAdvanceDelay: 3,
};

// Default statistics
const defaultStats: GameStats = {
  questionsAnswered: 0,
  correctAnswers: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalScore: 0,
  totalTimePlayed: 0,
  averageTimePerQuestion: 0,
  accuracy: 0,
  pointsThisSession: 0,
  startTime: Date.now(),
};

// Create the store with persistence
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: null,
      playerId: null,
      gameState: 'idle',
      questionState: 'loading',
      config: defaultConfig,
      currentQuestion: null,
      questionHistory: [],
      stats: defaultStats,
      lastResult: null,
      error: null,
      
      // Game lifecycle actions
      initializeGame: (sessionId, playerId, config) => {
        const currentState = get();
        set({
          sessionId,
          playerId,
          config: { ...defaultConfig, ...currentState.config, ...config },
          gameState: 'starting',
          questionState: 'loading',
          stats: { ...defaultStats, startTime: Date.now() },
          questionHistory: [],
          lastResult: null,
          error: null,
        });
      },
      
      startGame: () => {
        set({
          gameState: 'playing',
          questionState: 'loading',
          stats: { ...get().stats, startTime: Date.now() },
        });
      },
      
      pauseGame: () => {
        set({ gameState: 'paused' });
      },
      
      resumeGame: () => {
        set({ gameState: 'playing' });
      },
      
      endGame: () => {
        const state = get();
        const duration = Date.now() - state.stats.startTime;
        set({
          gameState: 'ended',
          questionState: 'loading',
          stats: {
            ...state.stats,
            totalTimePlayed: duration,
            averageTimePerQuestion: state.stats.questionsAnswered > 0 
              ? duration / state.stats.questionsAnswered / 1000 
              : 0,
          },
        });
      },
      
      resetGame: () => {
        set({
          sessionId: null,
          playerId: null,
          gameState: 'idle',
          questionState: 'loading',
          config: defaultConfig,
          currentQuestion: null,
          questionHistory: [],
          stats: defaultStats,
          lastResult: null,
          error: null,
        });
      },
      
      // Question flow actions
      setCurrentQuestion: (question) => {
        const state = get();
        set({
          currentQuestion: {
            ...question,
            timeRemaining: state.config.timePerQuestion,
            startTime: Date.now(),
            isSubmitted: false,
          },
          questionState: 'ready',
          error: null,
        });
      },
      
      selectAnswer: (answer) => {
        const state = get();
        if (state.currentQuestion && !state.currentQuestion.isSubmitted) {
          set({
            currentQuestion: {
              ...state.currentQuestion,
              selectedAnswer: answer,
            },
            questionState: 'answering',
          });
        }
      },
      
      submitAnswer: (result) => {
        const state = get();
        if (!state.currentQuestion) return;
        
        // Update question state
        set({
          currentQuestion: {
            ...state.currentQuestion,
            isSubmitted: true,
          },
          questionState: 'reviewing', // Changed from 'submitted' to 'reviewing' to show explanation
          lastResult: result,
        });
        
        // Update statistics
        const newStats = {
          ...state.stats,
          questionsAnswered: state.stats.questionsAnswered + 1,
          correctAnswers: result.isCorrect 
            ? state.stats.correctAnswers + 1 
            : state.stats.correctAnswers,
          currentStreak: result.isCorrect 
            ? state.stats.currentStreak + 1 
            : 0,
          maxStreak: result.isCorrect 
            ? Math.max(state.stats.maxStreak, state.stats.currentStreak + 1)
            : state.stats.maxStreak,
          totalScore: state.stats.totalScore + result.pointsEarned,
          pointsThisSession: state.stats.pointsThisSession + result.pointsEarned,
        };
        
        // Calculate accuracy
        newStats.accuracy = newStats.questionsAnswered > 0 
          ? (newStats.correctAnswers / newStats.questionsAnswered) * 100 
          : 0;
        
        set({ stats: newStats });
        
        // Add question to history
        set({
          questionHistory: [...state.questionHistory, state.currentQuestion.id],
        });
        
        // Note: Auto-advance removed - users must manually click "Next Question"
      },
      
      nextQuestion: () => {
        set({
          currentQuestion: null,
          questionState: 'loading',
          lastResult: null,
        });
      },
      
      // Timer management
      updateTimer: (timeRemaining) => {
        const state = get();
        if (state.currentQuestion) {
          set({
            currentQuestion: {
              ...state.currentQuestion,
              timeRemaining,
            },
          });
          
          // Auto-submit when time runs out
          if (timeRemaining <= 0 && !state.currentQuestion.isSubmitted) {
            // This would trigger an auto-submit with empty answer
            // The actual submission logic should be handled by the component
          }
        }
      },

      setCategory: (config: { category: GameConfig['category'] }) => {
        const state = get();
        set({
          config: { ...state.config, category: config.category },
        });
      },
      setDifficulty: (config: { difficulty: GameConfig['difficulty'] }) => {
        const state = get();
        set({
          config: { ...state.config, difficulty: config.difficulty },
        });
      },
      setPlayerName: (config: { playerName: GameConfig['playerName'] }) => {
        const state = get();
        set({
          config: { ...state.config, playerName: config.playerName },
        });
      },
      
      startQuestionTimer: () => {
        const state = get();
        if (state.currentQuestion) {
          set({
            currentQuestion: {
              ...state.currentQuestion,
              startTime: Date.now(),
            },
          });
        }
      },
      
      pauseQuestionTimer: () => {
        // Timer pause logic can be implemented here if needed
      },
      
      // Configuration updates
      updateConfig: (configUpdates) => {
        const state = get();
        set({
          config: { ...state.config, ...configUpdates },
        });
      },
      
      // Error handling
      setError: (error) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Statistics helpers
      updateStats: (updates) => {
        const state = get();
        set({
          stats: { ...state.stats, ...updates },
        });
      },
      
      calculateAccuracy: () => {
        const stats = get().stats;
        return stats.questionsAnswered > 0 
          ? (stats.correctAnswers / stats.questionsAnswered) * 100 
          : 0;
      },
      
      getGameDuration: () => {
        const stats = get().stats;
        return Date.now() - stats.startTime;
      },
    }),
    {
      name: 'game-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        playerId: state.playerId,
        config: state.config,
        stats: state.stats,
        gameState: state.gameState,
        questionHistory: state.questionHistory,
      }),
    }
  )
);

// Selector hooks for better performance
export const useGameState = () => useGameStore((state) => state.gameState);
export const useQuestionState = () => useGameStore((state) => state.questionState);
export const useCurrentQuestion = () => useGameStore((state) => state.currentQuestion);
export const useGameStats = () => useGameStore((state) => state.stats);
export const useGameConfig = () => useGameStore((state) => state.config);
export const useLastResult = () => useGameStore((state) => state.lastResult);
export const useGameError = () => useGameStore((state) => state.error);
