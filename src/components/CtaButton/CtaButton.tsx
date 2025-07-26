import React from "react";
import { Play } from "lucide-react";

interface CtaButtonProps {
  onStartPlaying: () => void;
}

const CtaButton: React.FC<CtaButtonProps> = ({
  onStartPlaying,
}) => (
  <div className="flex justify-center mb-12">
    <button
      onClick={onStartPlaying}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
    >
      <Play className="w-6 h-6" />
      Start Playing Now
    </button>
  </div>
);

export default CtaButton;
