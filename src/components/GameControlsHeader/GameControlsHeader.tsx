"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface GameControlsHeaderProps {
  endGame: () => void;
}

const GameControlsHeader: React.FC<GameControlsHeaderProps> = ({ endGame }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200">
        AI Trivia Arena
      </h1>
      <div className="flex space-x-3">
        <button
          onClick={() => router.push("/scoreboard-demo")}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          View Demo
        </button>
        <button
          onClick={endGame}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          End Game
        </button>
      </div>
    </div>
  );
};

export default GameControlsHeader;
