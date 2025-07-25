"use client";

import React, { useState } from "react";
import ExplanationPanel, {
  ExplanationData,
} from "@/components/ExplanationPanel";

const sampleExplanations: ExplanationData[] = [
  {
    explanation:
      "Paris is indeed the capital and largest city of France, located in the north-central part of the country.",
    reasoning:
      "Paris has been the capital of France since the late 10th century and serves as the country's political, economic, and cultural center.",
    additionalInfo:
      'Paris is often called the "City of Light" and is home to famous landmarks like the Eiffel Tower and the Louvre Museum.',
  },
  {
    explanation:
      "JavaScript is a high-level programming language that is one of the core technologies of the World Wide Web.",
    reasoning:
      "JavaScript enables interactive web pages and is an essential part of web applications, running in web browsers to provide dynamic content.",
    additionalInfo:
      "JavaScript was created in just 10 days in 1995 by Brendan Eich while he was working at Netscape.",
  },
  {
    explanation:
      'The mitochondria is often called the "powerhouse of the cell" because it produces most of the cell\'s energy.',
    reasoning:
      "Mitochondria generate ATP (adenosine triphosphate) through cellular respiration, which is the primary energy currency used by cells.",
    additionalInfo:
      "Mitochondria have their own DNA and are thought to have evolved from ancient bacteria that were engulfed by early cells.",
  },
];

export default function ExplanationPanelDemo() {
  const [currentExample, setCurrentExample] = useState(0);
  const [isCorrect, setIsCorrect] = useState(true);
  const [variant, setVariant] = useState<"default" | "compact" | "detailed">(
    "default"
  );
  const [showScoreInfo, setShowScoreInfo] = useState(true);

  const explanation = sampleExplanations[currentExample];
  const correctAnswers = ["C. Paris", "B. JavaScript", "A. Mitochondria"];
  const userAnswers = ["A. London", "A. Python", "B. Nucleus"];
  const questions = [
    "What is the capital of France?",
    "Which programming language is primarily used for web development?",
    "What organelle is known as the powerhouse of the cell?",
  ];

  const handleNextExample = () => {
    setCurrentExample((prev) => (prev + 1) % sampleExplanations.length);
  };

  const handlePrevExample = () => {
    setCurrentExample(
      (prev) =>
        (prev - 1 + sampleExplanations.length) % sampleExplanations.length
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explanation Panel Component
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Rich, interactive explanation panels with AI-generated content for
            enhanced learning experiences. Features multiple variants, visual
            feedback, and comprehensive information display.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="grid md:grid-cols-4 gap-6">
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
                <option value="detailed">Detailed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Result
              </label>
              <select
                value={isCorrect ? "correct" : "incorrect"}
                onChange={(e) => setIsCorrect(e.target.value === "correct")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="correct">Correct Answer</option>
                <option value="incorrect">Incorrect Answer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Example
              </label>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentExample + 1} of {sampleExplanations.length}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Score Info
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showScoreInfo}
                  onChange={(e) => setShowScoreInfo(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Question Context */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Question Context
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {questions[currentExample]}
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Correct Answer:
              </span>
              <span className="ml-2 text-green-600 dark:text-green-400">
                {correctAnswers[currentExample]}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                User&apos;s Answer:
              </span>
              <span
                className={`ml-2 ${
                  isCorrect
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isCorrect
                  ? correctAnswers[currentExample]
                  : userAnswers[currentExample]}
              </span>
            </div>
          </div>
        </div>

        {/* Explanation Panel Demo */}
        <div className="mb-8">
          <ExplanationPanel
            isCorrect={isCorrect}
            correctAnswer={correctAnswers[currentExample]}
            userAnswer={
              isCorrect
                ? correctAnswers[currentExample]
                : userAnswers[currentExample]
            }
            explanation={explanation}
            pointsEarned={isCorrect ? 10 : 0}
            variant={variant}
            showScoreInfo={showScoreInfo}
            animateOnMount={true}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handlePrevExample}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Previous Example
          </button>
          <button
            onClick={handleNextExample}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Next Example
          </button>
        </div>

        {/* Variant Examples Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            All Variant Examples
          </h3>

          <div className="space-y-8">
            {/* Compact Variant */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compact Variant
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <ExplanationPanel
                  isCorrect={true}
                  correctAnswer="C. Paris"
                  explanation={explanation}
                  variant="compact"
                  animateOnMount={false}
                />
                <ExplanationPanel
                  isCorrect={false}
                  correctAnswer="C. Paris"
                  userAnswer="A. London"
                  explanation={explanation}
                  variant="compact"
                  animateOnMount={false}
                />
              </div>
            </div>

            {/* Default Variant */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Default Variant
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <ExplanationPanel
                  isCorrect={true}
                  correctAnswer="C. Paris"
                  explanation={explanation}
                  variant="default"
                  animateOnMount={false}
                />
                <ExplanationPanel
                  isCorrect={false}
                  correctAnswer="C. Paris"
                  userAnswer="A. London"
                  explanation={explanation}
                  variant="default"
                  animateOnMount={false}
                />
              </div>
            </div>

            {/* Detailed Variant */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detailed Variant
              </h4>
              <div className="space-y-4">
                <ExplanationPanel
                  isCorrect={true}
                  correctAnswer="C. Paris"
                  explanation={explanation}
                  variant="detailed"
                  animateOnMount={false}
                />
                <ExplanationPanel
                  isCorrect={false}
                  correctAnswer="C. Paris"
                  userAnswer="A. London"
                  explanation={explanation}
                  variant="detailed"
                  animateOnMount={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🧠 AI-Powered Content
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Displays rich AI-generated explanations with main content,
              detailed reasoning, and fun facts.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🎨 Multiple Variants
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Compact for quick feedback, default for standard use, and detailed
              for comprehensive learning.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              ✅ Visual Feedback
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Clear visual indicators for correct/incorrect answers with
              appropriate colors and icons.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🎯 Answer Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Shows user&apos;s answer vs correct answer for learning from
              mistakes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🌟 Encouraging
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Positive messaging that encourages learning and celebrates
              success.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📱 Responsive
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Fully responsive design that works beautifully on all screen
              sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
