import React from "react";

const GameInstructions: React.FC = () => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
      How to Play
    </h3>
    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
      <div>
        <strong>1. Answer Questions:</strong> Select your answer from the
        multiple choice options.
      </div>
      <div>
        <strong>2. Watch Your Score:</strong> The scoreboard updates instantly
        with your progress.
      </div>
      <div>
        <strong>3. Build Streaks:</strong> Get consecutive correct answers for
        bonus points.
      </div>
      <div>
        <strong>4. Learn &amp; Improve:</strong> Read AI explanations after each
        answer.
      </div>
    </div>
  </div>
);

export default GameInstructions;
