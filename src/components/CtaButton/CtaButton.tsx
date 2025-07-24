import React from "react";
import { Play, Sparkles } from "lucide-react";

interface CtaButtonProps {
  onStartPlaying: () => void;
  onViewDemo?: () => void;
}

const CtaButton: React.FC<CtaButtonProps> = ({
  onStartPlaying,
  onViewDemo,
}) => (
  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
    <button
      onClick={onStartPlaying}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
    >
      <Play className="w-6 h-6" />
      Start Playing Now
    </button>

    <button
      onClick={onViewDemo}
      className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
      type="button"
    >
      <Sparkles className="w-6 h-6" />
      View Demo
    </button>
  </div>
);

export default CtaButton;
