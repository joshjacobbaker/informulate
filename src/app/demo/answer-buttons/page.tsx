'use client';

import React, { useState } from 'react';
import AnswerButton from '@/components/AnswerButton';
import MultipleChoiceGroup from '@/components/MultipleChoiceGroup';

const sampleQuestions = [
  {
    id: 1,
    question: 'What is the capital of France?',
    options: [
      { letter: 'A', text: 'London', isCorrect: false },
      { letter: 'B', text: 'Berlin', isCorrect: false },
      { letter: 'C', text: 'Paris', isCorrect: true },
      { letter: 'D', text: 'Madrid', isCorrect: false },
    ],
    correctAnswer: 'C',
  },
  {
    id: 2,
    question: 'Which programming language is known for web development?',
    options: [
      { letter: 'A', text: 'Python', isCorrect: false },
      { letter: 'B', text: 'JavaScript', isCorrect: true },
      { letter: 'C', text: 'C++', isCorrect: false },
      { letter: 'D', text: 'Java', isCorrect: false },
    ],
    correctAnswer: 'B',
  },
];

export default function AnswerButtonsDemo() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [layout, setLayout] = useState<'vertical' | 'grid' | 'horizontal'>('vertical');
  const [variant, setVariant] = useState<'default' | 'compact' | 'large'>('default');

  const question = sampleQuestions[currentQuestion];

  const handleAnswerSelect = (letter: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(letter);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    const nextIndex = (currentQuestion + 1) % sampleQuestions.length;
    setCurrentQuestion(nextIndex);
    setSelectedAnswer('');
    setIsSubmitted(false);
    setShowFeedback(false);
  };

  const handleReset = () => {
    setSelectedAnswer('');
    setIsSubmitted(false);
    setShowFeedback(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Multiple Choice Answer Buttons
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Interactive answer buttons with multiple layouts, variants, and feedback states.
            Perfect for quizzes, surveys, and trivia games.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout
              </label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as typeof layout)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="vertical">Vertical</option>
                <option value="grid">Grid</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variant
              </label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value as typeof variant)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="compact">Compact</option>
                <option value="default">Default</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question
              </label>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentQuestion + 1} of {sampleQuestions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
            {question.question}
          </h2>

          {/* Multiple Choice Group */}
          <MultipleChoiceGroup
            options={question.options}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            isSubmitted={isSubmitted}
            showFeedback={showFeedback}
            layout={layout}
            variant={variant}
            correctAnswer={question.correctAnswer}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {!isSubmitted && selectedAnswer && (
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Submit Answer
            </button>
          )}
          
          {isSubmitted && (
            <>
              <button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Next Question
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {/* Individual Button Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Individual AnswerButton Examples
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default State</h4>
              <AnswerButton
                letter="A"
                text="Default answer button"
                onClick={() => {}}
              />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selected State</h4>
              <AnswerButton
                letter="B"
                text="Selected answer button"
                isSelected={true}
                onClick={() => {}}
              />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Correct Answer</h4>
              <AnswerButton
                letter="C"
                text="Correct answer button"
                isCorrect={true}
                showFeedback={true}
                onClick={() => {}}
              />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Incorrect Answer</h4>
              <AnswerButton
                letter="D"
                text="Incorrect answer button"
                isSelected={true}
                isCorrect={false}
                showFeedback={true}
                onClick={() => {}}
              />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Disabled State</h4>
              <AnswerButton
                letter="E"
                text="Disabled answer button"
                disabled={true}
                onClick={() => {}}
              />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compact Variant</h4>
              <AnswerButton
                letter="F"
                text="Compact answer button"
                variant="compact"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🎨 Multiple Variants
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Compact, default, and large variants to fit different design needs and screen sizes.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📱 Flexible Layouts
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Vertical, grid, and horizontal layouts for optimal presentation across devices.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              ✅ Visual Feedback
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Clear visual indicators for correct/incorrect answers with checkmarks and X icons.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              ♿ Accessibility
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              ARIA labels, keyboard navigation, and focus management for inclusive design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
