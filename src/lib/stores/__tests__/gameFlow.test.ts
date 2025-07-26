'use client';

import { renderHook, act } from '@testing-library/react';
import { useGameFlow } from '@/lib/stores/gameFlow';
import { useGameStore } from '@/lib/stores/gameStore';

// Mock the query hooks with proper async handling
const mockGenerateQuestion = jest.fn();
const mockSubmitAnswer = jest.fn();

jest.mock('@/lib/query', () => ({
  useGenerateQuestion: () => ({
    mutateAsync: mockGenerateQuestion,
    isPending: false,
    isError: false,
  }),
  useSubmitAnswer: () => ({
    mutateAsync: mockSubmitAnswer,
    isPending: false,
    isError: false,
  }),
}));

describe('Game Flow Integration', () => {
  beforeEach(() => {
    // Reset the game store before each test
    const store = useGameStore.getState();
    store.resetGame();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockGenerateQuestion.mockResolvedValue({
      question: {
        id: 'test-question-1',
        question: 'What is 2 + 2?',
        options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
        correctAnswer: 'B',
        category: 'Math',
        difficulty: 'easy',
      },
    });
    
    mockSubmitAnswer.mockResolvedValue({
      isCorrect: true,
      correctAnswer: 'B',
      pointsEarned: 10,
      explanation: 'Basic addition: 2 + 2 = 4',
      newScore: 10,
      streak: 1,
      timestamp: new Date().toISOString(),
    });
  });

  it('should initialize game flow correctly', async () => {
    const { result } = renderHook(() => useGameFlow());

    expect(result.current.gameState).toBe('idle');
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.stats.questionsAnswered).toBe(0);
  });

  it('should start a new game and generate first question', async () => {
    const { result } = renderHook(() => useGameFlow());

    // Verify initial state
    expect(result.current.gameState).toBe('idle');
    expect(result.current.currentQuestion).toBeNull();

    // Execute startNewGame and wait for it to complete
    let gameResult;
    await act(async () => {
      gameResult = await result.current.startNewGame('test-player', 'test-session-123', {
        difficulty: 'medium',
        category: 'Math',
      });
    });

    // Verify the game started successfully
    expect(gameResult).toEqual({ success: true });
    expect(result.current.gameState).toBe('playing');
    expect(result.current.sessionId).toBe('test-session-123');
    expect(result.current.playerId).toBe('test-player');
    
    // Verify question was generated
    expect(result.current.currentQuestion).toBeTruthy();
    expect(result.current.currentQuestion?.question).toBe('What is 2 + 2?');
    expect(result.current.currentQuestion?.options).toEqual(['A. 3', 'B. 4', 'C. 5', 'D. 6']);
    expect(result.current.currentQuestion?.correctAnswer).toBe('B');
    
    // Verify the mock was called correctly
    expect(mockGenerateQuestion).toHaveBeenCalledWith({
      sessionId: 'test-session-123',
      category: 'Math',
      difficulty: 'medium',
      useAI: true,
    });
  });

  it('should handle answer selection and submission', async () => {
    const { result } = renderHook(() => useGameFlow());

    // Start game
    await act(async () => {
      await result.current.startNewGame('test-player', 'test-session-123');
    });

    // Select answer
    act(() => {
      result.current.selectAnswer('B');
    });

    expect(result.current.currentQuestion?.selectedAnswer).toBe('B');
    expect(result.current.canSubmit).toBe(true);

    // Submit answer
    await act(async () => {
      await result.current.submitAnswer();
    });

    expect(result.current.lastResult).toBeTruthy();
    expect(result.current.lastResult?.isCorrect).toBe(true);
    expect(result.current.stats.questionsAnswered).toBe(1);
    expect(result.current.stats.correctAnswers).toBe(1);
    expect(result.current.stats.totalScore).toBe(10);
  });

  it('should handle game pause and resume', async () => {
    const { result } = renderHook(() => useGameFlow());

    // Start game
    await act(async () => {
      await result.current.startNewGame('test-player', 'test-session-123');
    });

    expect(result.current.gameState).toBe('playing');

    // Pause game
    act(() => {
      result.current.pauseGame();
    });

    expect(result.current.gameState).toBe('paused');

    // Resume game
    act(() => {
      result.current.resumeGame();
    });

    expect(result.current.gameState).toBe('playing');
  });

  it('should handle game end correctly', async () => {
    const { result } = renderHook(() => useGameFlow());

    // Start game
    await act(async () => {
      await result.current.startNewGame('test-player', 'test-session-123');
    });

    expect(result.current.gameState).toBe('playing');

    // End game
    act(() => {
      result.current.endGame();
    });

    expect(result.current.gameState).toBe('ended');
  });

  it('should update game statistics correctly', async () => {
    const { result } = renderHook(() => useGameFlow());

    // Start game
    await act(async () => {
      await result.current.startNewGame('test-player', 'test-session-123');
    });

    // Submit correct answer
    act(() => {
      result.current.selectAnswer('B');
    });

    await act(async () => {
      await result.current.submitAnswer();
    });

    const stats = result.current.stats;
    expect(stats.questionsAnswered).toBe(1);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(1);
    expect(stats.accuracy).toBe(100);
    expect(stats.totalScore).toBe(10);
  });

  it('should handle configuration updates', async () => {
    const { result } = renderHook(() => useGameFlow());

    expect(result.current.config.difficulty).toBe('medium');

    act(() => {
      result.current.updateGameConfig({
        difficulty: 'hard',
        timePerQuestion: 45,
      });
    });

    expect(result.current.config.difficulty).toBe('hard');
    expect(result.current.config.timePerQuestion).toBe(45);
  });
});
