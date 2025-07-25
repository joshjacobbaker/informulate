'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/lib/supabase/service';
import { Question, Answer, QuestionHistory } from '@/lib/supabase/types';
import { questionKeys } from './questionQuery';

// Hook for managing real-time question updates
export function useQuestionRealtime(sessionId: string | null) {
  const queryClient = useQueryClient();

  // Handle question generation updates (from database changes)
  const handleQuestionGenerated = useCallback((payload: { new: Question }) => {
    if (!sessionId) return;
    
    const newQuestion = payload.new;
    console.log('Real-time: New question generated (DB)', newQuestion);

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

  // Handle question generation broadcast events (from API)
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
    
    console.log('Real-time: Question generated broadcast', payload);

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
  const handleAnswerSubmitted = useCallback((payload: { new: Answer }) => {
    if (!sessionId) return;
    
    const newAnswer = payload.new;
    console.log('Real-time: Answer submitted (DB)', newAnswer);

    // Invalidate game session queries to refresh scores
    queryClient.invalidateQueries({
      queryKey: ['gameSessions', 'session', sessionId],
    });

    // Clear current question cache to prepare for next question
    setTimeout(() => {
      queryClient.removeQueries({
        queryKey: questionKeys.currentQuestion(sessionId),
      });
    }, 2000); // Give time to show result before clearing
    
  }, [queryClient, sessionId]);

  // Handle answer submission broadcast events (from API)
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
    
    console.log('Real-time: Answer submitted broadcast', payload);

    // Invalidate game session queries to refresh scores
    queryClient.invalidateQueries({
      queryKey: ['gameSessions', 'session', sessionId],
    });
  }, [queryClient, sessionId]);

  // Handle question history updates (tracks which questions were asked)
  const handleQuestionAsked = useCallback((payload: { new: QuestionHistory }) => {
    if (!sessionId) return;
    
    const questionHistory = payload.new;
    console.log('Real-time: Question marked as asked', questionHistory);

    // This helps ensure we don't get duplicate questions
    // We can use this to invalidate random question queries
    queryClient.invalidateQueries({
      queryKey: ['questions', 'random', sessionId],
    });
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

    console.log('Real-time subscriptions established for session:', sessionId);

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up real-time subscriptions for session:', sessionId);
      questionsSubscription.unsubscribe();
      answersSubscription.unsubscribe();
      historySubscription.unsubscribe();
      questionBroadcastSubscription.unsubscribe();
      answerBroadcastSubscription.unsubscribe();
    };
  }, [sessionId, handleQuestionGenerated, handleQuestionBroadcast, handleAnswerSubmitted, handleAnswerBroadcast, handleQuestionAsked]);

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

    console.log('Notification: New question available', notification);

    // Show a notification to the user (this could be a toast, modal, etc.)
    // For now, we'll just log it and update the cache
    
    // Optionally trigger a refetch of the current question
    queryClient.invalidateQueries({
      queryKey: questionKeys.currentQuestion(sessionId),
    });
  }, [queryClient, sessionId]);

  return {
    handleNewQuestionAvailable,
  };
}
