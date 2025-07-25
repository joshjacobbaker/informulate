import React from 'react';
import { CheckCircle, XCircle, Lightbulb, BookOpen, Sparkles } from 'lucide-react';

export interface ExplanationData {
  explanation: string;
  reasoning: string;
  additionalInfo?: string;
}

export interface ExplanationPanelProps {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer?: string;
  explanation?: ExplanationData | string;
  pointsEarned?: number;
  variant?: 'default' | 'compact' | 'detailed';
  animateOnMount?: boolean;
  showScoreInfo?: boolean;
  className?: string;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  isCorrect,
  correctAnswer,
  userAnswer,
  explanation,
  pointsEarned = 0,
  variant = 'default',
  animateOnMount = true,
  showScoreInfo = true,
  className = '',
}) => {
  // Parse explanation data
  const getExplanationData = (): ExplanationData | null => {
    if (!explanation) return null;
    
    if (typeof explanation === 'string') {
      try {
        // Try to parse as JSON if it's a string
        const parsed = JSON.parse(explanation);
        if (parsed.explanation && parsed.reasoning) {
          return parsed as ExplanationData;
        }
      } catch {
        // If parsing fails, treat as simple explanation
        return {
          explanation,
          reasoning: '',
          additionalInfo: undefined,
        };
      }
    }
    
    return explanation as ExplanationData;
  };

  const explanationData = getExplanationData();

  // Styling based on correctness
  const getContainerClass = () => {
    const baseClass = `rounded-xl border-2 transition-all duration-300`;
    const animationClass = animateOnMount ? 'animate-in slide-in-from-bottom-4 fade-in duration-500' : '';
    const variantClass = variant === 'compact' ? 'p-4' : variant === 'detailed' ? 'p-8' : 'p-6';
    
    if (isCorrect) {
      return `${baseClass} ${variantClass} ${animationClass} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ${className}`;
    } else {
      return `${baseClass} ${variantClass} ${animationClass} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ${className}`;
    }
  };

  const getHeaderClass = () => {
    if (isCorrect) {
      return 'text-green-800 dark:text-green-200';
    } else {
      return 'text-red-800 dark:text-red-200';
    }
  };

  const getTextClass = () => {
    if (isCorrect) {
      return 'text-green-700 dark:text-green-300';
    } else {
      return 'text-red-700 dark:text-red-300';
    }
  };

  const getHeaderIcon = () => {
    if (isCorrect) {
      return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
    } else {
      return <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={getContainerClass()}>
        <div className="flex items-start gap-3">
          {getHeaderIcon()}
          <div className="flex-1">
            <div className={`font-semibold text-sm ${getHeaderClass()}`}>
              {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </div>
            {explanationData?.explanation && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {explanationData.explanation}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClass()}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {getHeaderIcon()}
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${getHeaderClass()}`}>
            {isCorrect ? '🎉 Excellent!' : '❌ Not Quite Right'}
          </h3>
          {showScoreInfo && (
            <p className={`text-sm ${getTextClass()} mt-1`}>
              {isCorrect 
                ? `+${pointsEarned} points earned!` 
                : `The correct answer was ${correctAnswer}`
              }
            </p>
          )}
        </div>
      </div>

      {/* Answer Summary (for incorrect answers) */}
      {!isCorrect && userAnswer && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Answer Summary:</div>
          <div className="flex flex-col gap-1 text-sm">
            <div className="text-red-600 dark:text-red-400">
              <span className="font-medium">Your answer:</span> {userAnswer}
            </div>
            <div className="text-green-600 dark:text-green-400">
              <span className="font-medium">Correct answer:</span> {correctAnswer}
            </div>
          </div>
        </div>
      )}

      {/* Main Explanation */}
      {explanationData?.explanation && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              Explanation
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {explanationData.explanation}
          </p>
        </div>
      )}

      {/* Detailed Reasoning */}
      {explanationData?.reasoning && variant === 'detailed' && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              Why This Answer
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {explanationData.reasoning}
          </p>
        </div>
      )}

      {/* Additional Information */}
      {explanationData?.additionalInfo && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              Did You Know?
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic">
            {explanationData.additionalInfo}
          </p>
        </div>
      )}

      {/* Encouragement Message */}
      {variant === 'detailed' && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-center text-sm font-medium ${getTextClass()}`}>
            {isCorrect 
              ? "Great job! Keep up the excellent work! 🌟" 
              : "Every mistake is a learning opportunity. You've got this! 💪"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;
