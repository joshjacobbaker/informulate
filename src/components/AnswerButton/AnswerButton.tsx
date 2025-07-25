import React from 'react';
import { Check, X } from 'lucide-react';

export interface AnswerButtonProps {
  letter: string;
  text: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isSubmitted?: boolean;
  showFeedback?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'large';
  animateOnHover?: boolean;
}

const AnswerButton: React.FC<AnswerButtonProps> = ({
  letter,
  text,
  isSelected = false,
  isCorrect = false,
  isSubmitted = false,
  showFeedback = false,
  onClick,
  disabled = false,
  variant = 'default',
  animateOnHover = true,
}) => {
  const getButtonClass = () => {
    const baseClass = 'w-full text-left border-2 transition-all duration-200 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    // Variant classes
    const variantClasses = {
      default: 'p-4 rounded-lg min-h-[60px]',
      compact: 'p-3 rounded-lg min-h-[50px]',
      large: 'p-5 rounded-xl min-h-[70px]',
    };
    
    // Animation classes
    const animationClass = animateOnHover && !disabled ? 'transform hover:scale-[1.01] active:scale-[0.99]' : '';
    
    // State-based styling
    if (isSubmitted || showFeedback) {
      if (isCorrect) {
        return `${baseClass} ${variantClasses[variant]} ${animationClass} border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200`;
      } else if (isSelected && !isCorrect) {
        return `${baseClass} ${variantClasses[variant]} ${animationClass} border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200`;
      } else {
        return `${baseClass} ${variantClasses[variant]} ${animationClass} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400`;
      }
    }

    if (isSelected) {
      return `${baseClass} ${variantClasses[variant]} ${animationClass} border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 transform scale-[1.02]`;
    }

    if (disabled) {
      return `${baseClass} ${variantClasses[variant]} border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60`;
    }

    return `${baseClass} ${variantClasses[variant]} ${animationClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer`;
  };

  const getLetterBadgeClass = () => {
    const baseClass = 'flex-shrink-0 w-8 h-8 rounded-full font-bold flex items-center justify-center text-white';
    
    if (variant === 'compact') {
      return `${baseClass.replace('w-8 h-8', 'w-7 h-7')} text-sm`;
    } else if (variant === 'large') {
      return `${baseClass.replace('w-8 h-8', 'w-10 h-10')} text-lg`;
    }
    
    // Color based on state
    if (isSubmitted || showFeedback) {
      if (isCorrect) {
        return `${baseClass} bg-green-500`;
      } else if (isSelected && !isCorrect) {
        return `${baseClass} bg-red-500`;
      } else {
        return `${baseClass} bg-gray-400`;
      }
    }
    
    return `${baseClass} bg-blue-600 dark:bg-blue-500`;
  };

  const getTextClass = () => {
    const baseClass = 'flex-grow';
    
    if (variant === 'compact') {
      return `${baseClass} text-base`;
    } else if (variant === 'large') {
      return `${baseClass} text-xl`;
    }
    
    return `${baseClass} text-lg`;
  };

  const renderFeedbackIcon = () => {
    if (!showFeedback && !isSubmitted) return null;
    
    if (isCorrect) {
      return (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    }
    
    if (isSelected && !isCorrect) {
      return (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonClass()}
      aria-pressed={isSelected}
      aria-label={`Option ${letter}: ${text}`}
      data-testid={`answer-button-${letter}`}
    >
      <div className={getLetterBadgeClass()}>
        {letter}
      </div>
      <span className={getTextClass()}>{text}</span>
      {renderFeedbackIcon()}
    </button>
  );
};

export default AnswerButton;
