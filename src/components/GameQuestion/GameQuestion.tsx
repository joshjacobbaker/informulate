import React, { useState, useEffect, useCallback } from "react";
import QuestionCard, { QuestionData } from "../QuestionCard";
import ExplanationPanel from "../ExplanationPanel";
import {
  useGenerateQuestion,
  useSubmitAnswer,
  useCurrentQuestion,
  useQuestionRealtime,
  useAnswerFeedbackRealtime,
  GenerateQuestionRequest,
} from "@/lib/query";

interface GameQuestionProps {
  sessionId: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  onScoreUpdate?: (newScore: number, isCorrect: boolean) => void;
  onQuestionComplete?: () => void;
}

const GameQuestion: React.FC<GameQuestionProps> = ({
  sessionId,
  category,
  difficulty = "medium",
  onScoreUpdate,
  onQuestionComplete,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(60); // 60 seconds per question
  const [showResult, setShowResult] = useState(false);

  // React Query hooks
  const generateQuestionMutation = useGenerateQuestion();
  const submitAnswerMutation = useSubmitAnswer();
  const { data: currentQuestion } = useCurrentQuestion(sessionId);

  // Set up real-time subscriptions for question updates
  useQuestionRealtime(sessionId);

  // Set up real-time answer feedback notifications
  const { latestFeedback, hasNewFeedback, clearFeedback } = useAnswerFeedbackRealtime(sessionId);

  const handleSubmitAnswer = useCallback(
    async (answer: string = selectedAnswer) => {
      if (!currentQuestion || isSubmitted) return;

      setIsSubmitted(true);
      const timeTaken = 60 - timeRemaining;

      try {
        const result = await submitAnswerMutation.mutateAsync({
          sessionId,
          questionId: currentQuestion.id,
          selectedAnswer: answer,
          timeTaken,
        });

        setShowResult(true);

        // Notify parent components
        onScoreUpdate?.(result.newScore, result.isCorrect);

        // Auto-continue after showing result for 3 seconds
        setTimeout(() => {
          // Reset state for next question
          setSelectedAnswer("");
          setIsSubmitted(false);
          setTimeRemaining(60);
          setShowResult(false);
          clearFeedback(); // Clear real-time feedback

          // Generate next question
          const request: GenerateQuestionRequest = {
            sessionId,
            category,
            difficulty,
            useAI: true,
          };
          generateQuestionMutation.mutate(request);

          onQuestionComplete?.();
        }, 3000);
      } catch (error) {
        console.error("Failed to submit answer:", error);
        setIsSubmitted(false); // Allow retry
      }
    },
    [
      selectedAnswer,
      currentQuestion,
      isSubmitted,
      timeRemaining,
      sessionId,
      submitAnswerMutation,
      onScoreUpdate,
      category,
      difficulty,
      generateQuestionMutation,
      onQuestionComplete,
      clearFeedback, // Add to dependencies
    ]
  );

  // Timer effect
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitAnswer(""); // Empty answer for timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining, handleSubmitAnswer]);

  // Generate question on mount or when session changes
  useEffect(() => {
    if (sessionId && !currentQuestion && !generateQuestionMutation.isPending) {
      const request: GenerateQuestionRequest = {
        sessionId,
        category,
        difficulty,
        useAI: true,
      };
      generateQuestionMutation.mutate(request);
    }
  }, [
    sessionId,
    currentQuestion,
    category,
    difficulty,
    generateQuestionMutation,
  ]);

  const handleAnswerSelect = (answer: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  // Convert API question format to QuestionCard format
  const questionData: QuestionData | null = currentQuestion
    ? {
        id: currentQuestion.id,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
      }
    : null;

  // Loading state
  if (generateQuestionMutation.isPending || !questionData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <QuestionCard
          question={{
            id: "loading",
            question: "",
            options: [],
            correctAnswer: "A",
            category: "",
            difficulty: "medium",
          }}
          onAnswerSelect={() => {}}
          isSubmitted={false}
          isLoading={true}
        />
      </div>
    );
  }

  // Error state
  if (generateQuestionMutation.isError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to Load Question
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {generateQuestionMutation.error?.message ||
              "An error occurred while loading the question."}
          </p>
          <button
            onClick={() =>
              generateQuestionMutation.mutate({
                sessionId,
                category,
                difficulty,
                useAI: true,
              })
            }
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <QuestionCard
        question={questionData}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        timeRemaining={timeRemaining}
        isSubmitted={isSubmitted}
        showCorrectAnswer={showResult}
      />

      {/* Submit Button */}
      {!isSubmitted && selectedAnswer && (
        <div className="mt-6 text-center">
          <button
            onClick={() => handleSubmitAnswer()}
            disabled={submitAnswerMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {submitAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
          </button>
        </div>
      )}

      {/* Real-time Answer Feedback - Shows immediately via real-time while API processes */}
      {hasNewFeedback && latestFeedback && submitAnswerMutation.isPending && (
        <div className="mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                latestFeedback.isCorrect 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {latestFeedback.isCorrect ? '✓' : '✗'}
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  latestFeedback.isCorrect 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {latestFeedback.isCorrect ? '🎉 Correct!' : '❌ Not Quite Right'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {latestFeedback.isCorrect 
                    ? `+${latestFeedback.pointsEarned} points earned!`
                    : 'Better luck next time!'
                  }
                </p>
              </div>
            </div>
            
            {/* Show real-time explanation if available */}
            {latestFeedback.explanation && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    💡 Quick Explanation:
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {typeof latestFeedback.explanation === 'string' 
                    ? latestFeedback.explanation 
                    : (() => {
                        try {
                          const parsed = JSON.parse(latestFeedback.explanation as unknown as string);
                          return parsed?.explanation || 'Explanation processing...';
                        } catch {
                          return 'Explanation processing...';
                        }
                      })()
                  }
                </p>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              📡 Real-time feedback • Full details loading...
            </div>
          </div>
        </div>
      )}

      {/* Full Result Display - Shows complete explanation after API completes */}
      {showResult && submitAnswerMutation.data && (
        <div className="mt-6">
          <ExplanationPanel
            isCorrect={submitAnswerMutation.data.isCorrect}
            correctAnswer={submitAnswerMutation.data.correctAnswer}
            userAnswer={selectedAnswer}
            explanation={submitAnswerMutation.data.explanation}
            pointsEarned={submitAnswerMutation.data.pointsEarned}
            variant="default"
            showScoreInfo={true}
            animateOnMount={true}
          />
        </div>
      )}
    </div>
  );
};

export default GameQuestion;
