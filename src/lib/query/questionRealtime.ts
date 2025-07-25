'use client';

import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/lib/supabase/service';
import { Question } from '@/lib/supabase/types';
import { questionKeys } from './questionQuery';

// Hook for managing real-time question updates
export function useQuestionRealtime(sessionId: string | null) {
  const queryClient = useQueryClient();

  // Handle question generation updates (from database changes)
  const handleQuestionGenerated = useCallback((payload: { new: Question }) => {
    if (!sessionId) return;
    
    const newQuestion = payload.new;

    // Update current question in cache
    queryClient.setQueryData(
      questionKeys.currentQuestion(sessionId),
      {
        id: newQuestion.id,
        question: newQuestion.question_text,
        options: newQuestion.options,
        correctAnswer: newQuestion.correct_answer,
        category: newQuestion.category,
        difficulty: newQuestion.difficulty,
      }
    );

    // Also cache by question ID
    queryClient.setQueryData(
      questionKeys.question(sessionId, newQuestion.id),
      {
        id: newQuestion.id,
        question: newQuestion.question_text,
        options: newQuestion.options,
        correctAnswer: newQuestion.correct_answer,
        category: newQuestion.category,
        difficulty: newQuestion.difficulty,
      }
    );
  }, [queryClient, sessionId]);

  const handleQuestionBroadcast = useCallback((payload: {
    sessionId: string;
    question: {
      id: string;
      question: string;
      options: string[];
      correctAnswer: string;
      category: string;
      difficulty: string;
    };
    questionSource: string;
    timestamp: string;
  }) => {
    if (!sessionId || payload.sessionId !== sessionId) return;

    // Update current question in cache
    queryClient.setQueryData(
      questionKeys.currentQuestion(sessionId),
      payload.question
    );

    // Also cache by question ID
    queryClient.setQueryData(
      questionKeys.question(sessionId, payload.question.id),
      payload.question
    );
  }, [queryClient, sessionId]);

  // Handle answer submissions (which trigger next question generation)
  const handleAnswerSubmitted = useCallback(() => {
    if (!sessionId) return;

    // Invalidate game session queries to refresh scores
    queryClient.invalidateQueries({
      queryKey: ['gameSessions', 'session', sessionId],
    });

    
  }, [queryClient, sessionId]);

  // Handle answer submission broadcast events (from API) with enhanced feedback
  const handleAnswerBroadcast = useCallback((payload: {
    sessionId: string;
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
    explanation?: string | object;
    timestamp: string;
  }) => {
    if (!sessionId || payload.sessionId !== sessionId) return;
    

    // Immediately update the submit answer cache with the result
    queryClient.setQueryData(
      ['submitAnswer', sessionId, payload.questionId],
      {
        success: true,
        isCorrect: payload.isCorrect,
        correctAnswer: '', // Will be filled by the API response
        pointsEarned: payload.pointsEarned,
        explanation: payload.explanation,
        newScore: 0, // Will be updated when session refreshes
        streak: 0, // Will be updated when session refreshes
        timestamp: payload.timestamp,
      }
    );

    // Invalidate game session queries to refresh scores
    queryClient.invalidateQueries({
      queryKey: ['gameSessions', 'session', sessionId],
    });

    // Trigger a notification about the answer result
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('answerFeedback', {
        detail: {
          sessionId: payload.sessionId,
          questionId: payload.questionId,
          isCorrect: payload.isCorrect,
          pointsEarned: payload.pointsEarned,
          explanation: payload.explanation,
          timestamp: payload.timestamp,
        }
      }));
    }
  }, [queryClient, sessionId]);

  // Handle question history updates (tracks which questions were asked)
  const handleQuestionAsked = useCallback(() => {
    if (!sessionId) return;

    // This helps ensure we don't get duplicate questions
    // We can use this to invalidate random question queries
    queryClient.invalidateQueries({
      queryKey: ['questions', 'random', sessionId],
    });
  }, [queryClient, sessionId]);

  // Handle explanation ready broadcast events (when AI explanation is generated)
  const handleExplanationReadyBroadcast = useCallback((payload: {
    sessionId: string;
    questionId: string;
    explanation: string | object;
    timestamp: string;
  }) => {
    if (!sessionId || payload.sessionId !== sessionId) return;
    

    // Trigger a custom event for the UI to pick up
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('explanationReady', {
        detail: {
          sessionId: payload.sessionId,
          questionId: payload.questionId,
          explanation: payload.explanation,
          timestamp: payload.timestamp,
        }
      }));
    }
  }, [sessionId]);

  // Handle complete answer broadcast events (final update with all info)
  const handleAnswerCompleteBroadcast = useCallback((payload: {
    sessionId: string;
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
    explanation?: string | object;
    timestamp: string;
  }) => {
    if (!sessionId || payload.sessionId !== sessionId) return;
    

    // Update the submit answer cache with complete result
    queryClient.setQueryData(
      ['submitAnswer', sessionId, payload.questionId],
      {
        success: true,
        isCorrect: payload.isCorrect,
        correctAnswer: '', // Will be filled by the API response
        pointsEarned: payload.pointsEarned,
        explanation: payload.explanation,
        newScore: 0, // Will be updated when session refreshes
        streak: 0, // Will be updated when session refreshes
        timestamp: payload.timestamp,
      }
    );
  }, [queryClient, sessionId]);

  // Set up subscriptions
  useEffect(() => {
    if (!sessionId) return;

    const supabaseService = new SupabaseService();
    
    // Subscribe to new questions being generated (database changes)
    const questionsSubscription = supabaseService.subscribeToQuestions(handleQuestionGenerated);
    
    // Subscribe to answers being submitted (database changes for this session)
    const answersSubscription = supabaseService.subscribeToAnswers(sessionId, handleAnswerSubmitted);

    // Subscribe to question history updates (tracks asked questions)
    const historySubscription = supabaseService.subscribeToQuestionHistory(sessionId, handleQuestionAsked);

    // Subscribe to broadcast events for question generation
    const questionBroadcastSubscription = supabaseService.subscribeToQuestionBroadcasts(handleQuestionBroadcast);

    // Subscribe to broadcast events for answer submission  
    const answerBroadcastSubscription = supabaseService.subscribeToAnswerBroadcasts(handleAnswerBroadcast);

    // Subscribe to broadcast events for explanation ready
    const explanationReadySubscription = supabaseService.subscribeToExplanationReadyBroadcasts(handleExplanationReadyBroadcast);

    // Subscribe to broadcast events for answer complete
    const answerCompleteSubscription = supabaseService.subscribeToAnswerCompleteBroadcasts(handleAnswerCompleteBroadcast);

    // Cleanup subscriptions
    return () => {
      questionsSubscription.unsubscribe();
      answersSubscription.unsubscribe();
      historySubscription.unsubscribe();
      questionBroadcastSubscription.unsubscribe();
      answerBroadcastSubscription.unsubscribe();
      explanationReadySubscription.unsubscribe();
      answerCompleteSubscription.unsubscribe();
    };
  }, [sessionId, handleQuestionGenerated, handleQuestionBroadcast, handleAnswerSubmitted, handleAnswerBroadcast, handleQuestionAsked, handleExplanationReadyBroadcast, handleAnswerCompleteBroadcast]);

  return {
    // Could return connection status or other utilities here
    isConnected: true, // For now, assume connected
  };
}

// Hook for real-time question notifications
export function useQuestionNotifications(sessionId: string | null) {
  const queryClient = useQueryClient();

  // Handle when a new question becomes available
  const handleNewQuestionAvailable = useCallback((notification: {
    sessionId: string;
    questionId: string;
    message: string;
  }) => {
    if (!sessionId || notification.sessionId !== sessionId) return;


    queryClient.invalidateQueries({
      queryKey: questionKeys.currentQuestion(sessionId),
    });
  }, [queryClient, sessionId]);

  return {
    handleNewQuestionAvailable,
  };
}

// Hook for real-time answer feedback notifications with explanation updates
export function useAnswerFeedbackRealtime(sessionId: string | null) {
  const [latestFeedback, setLatestFeedback] = useState<{
    questionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    explanation?: string | object;
    timestamp: string;
    hasExplanation?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!sessionId || typeof window === 'undefined') return;

    const handleAnswerFeedback = (event: CustomEvent) => {
      const { detail } = event;
      if (detail.sessionId === sessionId) {
        setLatestFeedback({
          questionId: detail.questionId,
          isCorrect: detail.isCorrect,
          pointsEarned: detail.pointsEarned,
          explanation: detail.explanation,
          timestamp: detail.timestamp,
          hasExplanation: !!detail.explanation,
        });
      }
    };

    const handleExplanationReady = (event: CustomEvent) => {
      const { detail } = event;
      if (detail.sessionId === sessionId && latestFeedback?.questionId === detail.questionId) {
        setLatestFeedback(prev => prev ? {
          ...prev,
          explanation: detail.explanation,
          hasExplanation: true,
        } : null);
      }
    };

    window.addEventListener('answerFeedback', handleAnswerFeedback as EventListener);
    window.addEventListener('explanationReady', handleExplanationReady as EventListener);

    return () => {
      window.removeEventListener('answerFeedback', handleAnswerFeedback as EventListener);
      window.removeEventListener('explanationReady', handleExplanationReady as EventListener);
    };
  }, [sessionId, latestFeedback?.questionId]);

  return {
    latestFeedback,
    hasNewFeedback: latestFeedback !== null,
    clearFeedback: () => setLatestFeedback(null),
  };
}
