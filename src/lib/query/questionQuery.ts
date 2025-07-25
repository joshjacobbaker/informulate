import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types for question API
export interface QuestionResponse {
  success: boolean;
  question: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  questionSource: 'database' | 'ai-generated' | 'ai-temporary' | 'fallback';
  timestamp: string;
}

export interface GenerateQuestionRequest {
  sessionId: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  useAI?: boolean;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  selectedAnswer: string;
  timeTaken?: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  pointsEarned: number;
  explanation?: string;
  newScore: number;
  streak: number;
  timestamp: string;
}

// Query keys
export const questionKeys = {
  all: ['questions'] as const,
  question: (sessionId: string, questionId: string) => 
    [...questionKeys.all, 'session', sessionId, 'question', questionId] as const,
  currentQuestion: (sessionId: string) => 
    [...questionKeys.all, 'session', sessionId, 'current'] as const,
}

// Hook to generate a new question
export function useGenerateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: GenerateQuestionRequest): Promise<QuestionResponse> => {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate question');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Cache the generated question
      queryClient.setQueryData(
        questionKeys.currentQuestion(variables.sessionId),
        data.question
      );
      
      // Also cache by question ID
      queryClient.setQueryData(
        questionKeys.question(variables.sessionId, data.question.id),
        data.question
      );
    },
    onError: (error) => {
      console.error('Error generating question:', error);
    },
  });
}

// Hook to submit an answer
export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
      const response = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the game session cache with new score
      queryClient.invalidateQueries({
        queryKey: ['gameSessions', 'session', variables.sessionId],
      });
      
      // Clear current question since it's been answered
      queryClient.removeQueries({
        queryKey: questionKeys.currentQuestion(variables.sessionId),
      });
    },
    onError: (error) => {
      console.error('Error submitting answer:', error);
    },
  });
}

// Hook to get the current question for a session
export function useCurrentQuestion(sessionId: string | null) {
  return useQuery<QuestionResponse['question'] | null>({
    queryKey: questionKeys.currentQuestion(sessionId || ''),
    queryFn: () => null, // We'll set this data from the generate question mutation
    enabled: false, // This query is managed by mutations, not automatically fetched
    staleTime: Infinity, // Keep the question data fresh during the session
  });
}

// Hook to prefetch the next question (for better UX)
export function usePrefetchNextQuestion() {
  const generateQuestionMutation = useGenerateQuestion();

  const prefetchNextQuestion = async (request: GenerateQuestionRequest) => {
    if (generateQuestionMutation.isPending) return;
    
    try {
      await generateQuestionMutation.mutateAsync(request);
    } catch (error) {
      // Silent fail for prefetch
      console.warn('Failed to prefetch next question:', error);
    }
  };

  return { prefetchNextQuestion, isPrefetching: generateQuestionMutation.isPending };
}

// Utility hook for question management
export function useQuestionUtils() {
  const queryClient = useQueryClient();

  const clearQuestionCache = (sessionId: string) => {
    queryClient.removeQueries({
      queryKey: [...questionKeys.all, 'session', sessionId],
    });
  };

  const invalidateQuestions = (sessionId: string) => {
    queryClient.invalidateQueries({
      queryKey: [...questionKeys.all, 'session', sessionId],
    });
  };

  return {
    clearQuestionCache,
    invalidateQuestions,
    queryClient,
  };
}
