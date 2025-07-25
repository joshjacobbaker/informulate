import React from 'react';
import AnswerButton from '../AnswerButton';

export interface MultipleChoiceOption {
  letter: string;
  text: string;
  isCorrect?: boolean;
}

export interface MultipleChoiceGroupProps {
  options: MultipleChoiceOption[];
  selectedAnswer?: string;
  onAnswerSelect: (letter: string) => void;
  isSubmitted?: boolean;
  showFeedback?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'large';
  animateOnHover?: boolean;
  layout?: 'vertical' | 'grid' | 'horizontal';
  correctAnswer?: string;
}

const MultipleChoiceGroup: React.FC<MultipleChoiceGroupProps> = ({
  options,
  selectedAnswer,
  onAnswerSelect,
  isSubmitted = false,
  showFeedback = false,
  disabled = false,
  variant = 'default',
  animateOnHover = true,
  layout = 'vertical',
  correctAnswer,
}) => {
  const handleAnswerSelect = (letter: string) => {
    if (!disabled && !isSubmitted) {
      onAnswerSelect(letter);
    }
  };

  const getLayoutClass = () => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 gap-3';
      case 'horizontal':
        return 'flex flex-wrap gap-3';
      case 'vertical':
      default:
        return 'space-y-3';
    }
  };

  const getOptionItemClass = () => {
    if (layout === 'horizontal') {
      return 'flex-1 min-w-[200px]';
    }
    return '';
  };

  return (
    <div 
      className={getLayoutClass()}
      role="group"
      aria-label="Multiple choice answers"
    >
      {options.map((option) => {
        const isSelected = selectedAnswer === option.letter;
        const isCorrect = correctAnswer ? option.letter === correctAnswer : option.isCorrect;
        
        return (
          <div key={option.letter} className={getOptionItemClass()}>
            <AnswerButton
              letter={option.letter}
              text={option.text}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isSubmitted={isSubmitted}
              showFeedback={showFeedback}
              onClick={() => handleAnswerSelect(option.letter)}
              disabled={disabled}
              variant={variant}
              animateOnHover={animateOnHover}
            />
          </div>
        );
      })}
    </div>
  );
};

export default MultipleChoiceGroup;
