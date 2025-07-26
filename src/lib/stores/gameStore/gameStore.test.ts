import { act } from '@testing-library/react';
import { useGameStore } from './gameStore';

// src/lib/stores/gameStore.test.ts


describe('gameStore', () => {
    beforeEach(() => {
        // Reset store before each test
        act(() => {
            useGameStore.getState().resetGame();
        });
        // Clear localStorage (persisted state)
        localStorage.clear();
    });

    it('should initialize with default state', () => {
        const state = useGameStore.getState();
        expect(state.sessionId).toBeNull();
        expect(state.playerId).toBeNull();
        expect(state.gameState).toBe('idle');
        expect(state.config.difficulty).toBe('medium');
        expect(state.stats.questionsAnswered).toBe(0);
        expect(state.currentQuestion).toBeNull();
        expect(state.lastResult).toBeNull();
        expect(state.error).toBeNull();
    });

    it('should initialize game with provided config', () => {
        act(() => {
            useGameStore.getState().initializeGame('session-1', 'player-1', { difficulty: 'hard', category: 'Math' });
        });
        const state = useGameStore.getState();
        expect(state.sessionId).toBe('session-1');
        expect(state.playerId).toBe('player-1');
        expect(state.config.difficulty).toBe('hard');
        expect(state.config.category).toBe('Math');
        expect(state.gameState).toBe('starting');
        expect(state.stats.questionsAnswered).toBe(0);
    });

    it('should start, pause, resume, and end the game', () => {
        act(() => {
            useGameStore.getState().startGame();
        });
        expect(useGameStore.getState().gameState).toBe('playing');

        act(() => {
            useGameStore.getState().pauseGame();
        });
        expect(useGameStore.getState().gameState).toBe('paused');

        act(() => {
            useGameStore.getState().resumeGame();
        });
        expect(useGameStore.getState().gameState).toBe('playing');

        act(() => {
            useGameStore.getState().endGame();
        });
        expect(useGameStore.getState().gameState).toBe('ended');
        expect(useGameStore.getState().stats.totalTimePlayed).toBeGreaterThanOrEqual(0);
    });

    it('should reset the game', () => {
        act(() => {
            useGameStore.getState().initializeGame('session-2', 'player-2', {});
            useGameStore.getState().startGame();
            useGameStore.getState().resetGame();
        });
        const state = useGameStore.getState();
        expect(state.sessionId).toBeNull();
        expect(state.playerId).toBeNull();
        expect(state.gameState).toBe('idle');
        expect(state.currentQuestion).toBeNull();
        expect(state.stats.questionsAnswered).toBe(0);
    });

    it('should set current question and select answer', () => {
        const question = {
            id: 'q1',
            question: 'What is 1+1?',
            options: ['A. 1', 'B. 2'],
            correctAnswer: 'B',
            category: 'Math',
            difficulty: 'easy',
        };
        act(() => {
            useGameStore.getState().setCurrentQuestion(question);
        });
        let state = useGameStore.getState();
        expect(state.currentQuestion?.question).toBe('What is 1+1?');
        expect(state.questionState).toBe('ready');
        expect(state.currentQuestion?.isSubmitted).toBe(false);

        act(() => {
            useGameStore.getState().selectAnswer('B');
        });
        state = useGameStore.getState();
        expect(state.currentQuestion?.selectedAnswer).toBe('B');
        expect(state.questionState).toBe('answering');
    });

    it('should submit answer and update stats', () => {
        const question = {
            id: 'q2',
            question: 'What is 2+2?',
            options: ['A. 3', 'B. 4'],
            correctAnswer: 'B',
            category: 'Math',
            difficulty: 'easy',
        };
        act(() => {
            useGameStore.getState().setCurrentQuestion(question);
            useGameStore.getState().selectAnswer('B');
            useGameStore.getState().submitAnswer({
                isCorrect: true,
                pointsEarned: 10,
                correctAnswer: 'B',
                selectedAnswer: 'B',
                timeTaken: 5,
                explanation: '2+2=4',
            });
        });
        const state = useGameStore.getState();
        expect(state.currentQuestion?.isSubmitted).toBe(true);
        expect(state.lastResult?.isCorrect).toBe(true);
        expect(state.stats.questionsAnswered).toBe(1);
        expect(state.stats.correctAnswers).toBe(1);
        expect(state.stats.totalScore).toBe(10);
        expect(state.questionHistory).toContain('q2');
        expect(state.questionState).toBe('reviewing');
        expect(state.stats.accuracy).toBe(100);
    });

    it('should move to next question', () => {
        act(() => {
            useGameStore.getState().nextQuestion();
        });
        const state = useGameStore.getState();
        expect(state.currentQuestion).toBeNull();
        expect(state.questionState).toBe('loading');
        expect(state.lastResult).toBeNull();
    });

    it('should update timer for current question', () => {
        const question = {
            id: 'q3',
            question: 'What is 3+3?',
            options: ['A. 5', 'B. 6'],
            correctAnswer: 'B',
            category: 'Math',
            difficulty: 'easy',
        };
        act(() => {
            useGameStore.getState().setCurrentQuestion(question);
            useGameStore.getState().updateTimer(30);
        });
        const state = useGameStore.getState();
        expect(state.currentQuestion?.timeRemaining).toBe(30);
    });

    it('should update config', () => {
        act(() => {
            useGameStore.getState().updateConfig({ difficulty: 'hard', autoAdvance: true });
        });
        const config = useGameStore.getState().config;
        expect(config.difficulty).toBe('hard');
        expect(config.autoAdvance).toBe(true);
    });

    it('should set and clear error', () => {
        act(() => {
            useGameStore.getState().setError('Test error');
        });
        expect(useGameStore.getState().error).toBe('Test error');
        act(() => {
            useGameStore.getState().clearError();
        });
        expect(useGameStore.getState().error).toBeNull();
    });

    it('should update stats and calculate accuracy', () => {
        act(() => {
            useGameStore.getState().updateStats({ questionsAnswered: 5, correctAnswers: 3 });
        });
        const accuracy = useGameStore.getState().calculateAccuracy();
        expect(accuracy).toBe(60);
    });

    it('should get game duration', () => {
        const duration = useGameStore.getState().getGameDuration();
        expect(typeof duration).toBe('number');
        expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should persist and rehydrate state', async () => {
        act(() => {
            useGameStore.getState().initializeGame('persist-session', 'persist-player', { difficulty: 'easy' });
        });
        
        // Wait a bit for persistence to complete
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Simulate reload
        const persisted = JSON.parse(localStorage.getItem('game-store') || '{}');
        expect(persisted.state?.sessionId).toBe('persist-session');
        expect(persisted.state?.playerId).toBe('persist-player');
        expect(persisted.state?.config?.difficulty).toBe('easy');
    });
});