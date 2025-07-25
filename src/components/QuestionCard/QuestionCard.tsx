import React from "react";
import { Clock, BookOpen, Zap } from "lucide-react";

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

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const getOptionButtonClass = (option: string, index: number) => {
    const baseClass =
      "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 min-h-[60px]";
    const letter = getOptionLetter(index);
    const isSelected = selectedAnswer === letter;
    const isCorrect = question.correctAnswer === letter;

    if (isSubmitted || showCorrectAnswer) {
      if (isCorrect) {
        return `${baseClass} border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200`;
      } else if (isSelected && !isCorrect) {
        return `${baseClass} border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200`;
      } else {
        return `${baseClass} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400`;
      }
    }

    if (isSelected) {
      return `${baseClass} border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 transform scale-[1.02]`;
    }

    return `${baseClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transform hover:scale-[1.01]`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const letter = getOptionLetter(index);
          const optionText = option.replace(/^[A-E]\.\s*/, ""); // Remove letter prefix if it exists

          return (
            <button
              key={index}
              onClick={() => !isSubmitted && onAnswerSelect(letter)}
              disabled={isSubmitted}
              className={getOptionButtonClass(option, index)}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-bold flex items-center justify-center">
                {letter}
              </div>
              <span className="flex-grow text-lg">{optionText}</span>

              {(isSubmitted || showCorrectAnswer) &&
                question.correctAnswer === letter && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}

              {(isSubmitted || showCorrectAnswer) &&
                selectedAnswer === letter &&
                question.correctAnswer !== letter && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>
                )}
            </button>
          );
        })}
      </div>

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
