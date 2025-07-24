import { Play, Star } from "lucide-react";
import React from "react";

interface CallToActionSectionProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({
  setIsModalOpen,
}) => (
  <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <Star className="w-16 h-16 text-white mx-auto mb-6" />
      <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
        Ready to Test Your Knowledge?
      </h3>
      <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
        Join thousands of players who are already challenging themselves with AI
        Trivia Arena. Start your journey to becoming a trivia master today!
      </p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white text-blue-600 hover:text-blue-700 font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-lg mx-auto"
      >
        <Play className="w-6 h-6" />
        Get Started Free
      </button>
    </div>
  </div>
);

export default CallToActionSection;
