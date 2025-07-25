"use client";

import React, { useState } from "react";
import QuestionCard, { QuestionData } from "@/components/QuestionCard";

const demoQuestions: QuestionData[] = [
  {
    id: "demo-1",
    question: "What is the capital of France?",
    options: ["A. London", "B. Berlin", "C. Paris", "D. Madrid"],
    correctAnswer: "C",
    category: "Geography",
    difficulty: "easy",
  },
  {
    id: "demo-2",
    question:
      "Which programming language is known for its use in web development and has a name related to coffee?",
    options: ["A. Python", "B. JavaScript", "C. Java", "D. C++"],
    correctAnswer: "C",
    category: "Technology",
    difficulty: "medium",
  },
  {
    id: "demo-3",
    question: "What is the time complexity of binary search in a sorted array?",
    options: ["A. O(n)", "B. O(log n)", "C. O(n²)", "D. O(1)"],
    correctAnswer: "B",
    category: "Computer Science",
    difficulty: "hard",
  },
];

export default function DemoPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = demoQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    const nextIndex = (currentQuestionIndex + 1) % demoQuestions.length;
    setCurrentQuestionIndex(nextIndex);
    setSelectedAnswer("");
    setIsSubmitted(false);
    setShowResult(false);
    setTimeRemaining(30);
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setIsSubmitted(false);
    setShowResult(false);
    setTimeRemaining(30);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Question Card Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience our interactive question card component with different
            difficulty levels and categories. This demo showcases the UI without
            requiring a game session.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Question:
            </span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {currentQuestionIndex + 1} of {demoQuestions.length}
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Difficulty:
            </span>
            <span
              className={`ml-2 font-semibold capitalize ${
                currentQuestion.difficulty === "easy"
                  ? "text-green-600 dark:text-green-400"
                  : currentQuestion.difficulty === "medium"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Category:
            </span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {currentQuestion.category}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          timeRemaining={timeRemaining}
          isSubmitted={isSubmitted}
          showCorrectAnswer={showResult}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
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
                Reset Demo
              </button>
            </>
          )}
        </div>

        {/* Result Display */}
        {showResult && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div
              className={`p-6 rounded-xl border-2 ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="text-center">
                <h3
                  className={`text-2xl font-bold mb-3 ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {selectedAnswer === currentQuestion.correctAnswer
                    ? "🎉 Correct!"
                    : "❌ Incorrect"}
                </h3>
                <p
                  className={`text-lg mb-2 ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {selectedAnswer === currentQuestion.correctAnswer
                    ? "Well done! You got it right."
                    : `The correct answer was ${currentQuestion.correctAnswer}.`}
                </p>
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Demo Note:</strong> In a real game, this would show
                    AI-generated explanations, points earned, and updated scores
                    with streak bonuses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🎨 Interactive Design
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Responsive design with hover effects, animations, and visual
              feedback for selected answers.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              ⏱️ Timer Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Built-in timer display with color-coded urgency indicators for
              time-based challenges.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🔍 Clear Feedback
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Immediate visual feedback showing correct/incorrect answers with
              checkmarks and X icons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
