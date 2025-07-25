import React from "react";
import { Clock, BookOpen, Zap } from "lucide-react";
import MultipleChoiceGroup, {
  MultipleChoiceOption,
} from "../MultipleChoiceGroup";

export interface QuestionData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuestionCardProps {
  question: QuestionData;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  timeRemaining?: number;
  isSubmitted: boolean;
  isLoading?: boolean;
  showCorrectAnswer?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  timeRemaining,
  isSubmitted,
  isLoading = false,
  showCorrectAnswer = false,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      case "hard":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Convert question options to MultipleChoiceOption format
  const convertToMultipleChoiceOptions = (): MultipleChoiceOption[] => {
    return question.options.map((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D
      const text = option.replace(/^[A-E]\.\s*/, ""); // Remove letter prefix if it exists

      return {
        letter,
        text,
        isCorrect: question.correctAnswer === letter,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-100 dark:border-gray-800">
      {/* Header with category, difficulty, and timer */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {question.category}
            </span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            <Zap className="w-3 h-3 inline mr-1" />
            {question.difficulty.charAt(0).toUpperCase() +
              question.difficulty.slice(1)}
          </div>
        </div>

        {timeRemaining !== undefined && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span
              className={`text-sm font-mono ${
                timeRemaining <= 10
                  ? "text-red-600 dark:text-red-400 font-bold"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Answer Options */}
      <MultipleChoiceGroup
        options={convertToMultipleChoiceOptions()}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={onAnswerSelect}
        isSubmitted={isSubmitted}
        showFeedback={isSubmitted || showCorrectAnswer}
        disabled={isSubmitted}
        variant="default"
        animateOnHover={true}
        layout="vertical"
        correctAnswer={question.correctAnswer}
      />

      {/* Instructions */}
      {!isSubmitted && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select your answer and click submit to continue
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
