import { Brain } from "lucide-react";
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Brain
                data-testid="lucide-brain"
                className="w-6 h-6 text-white"
              />
            </div>
            <span className="ml-3 text-xl font-bold">AI Trivia Arena</span>
          </div>
          <p className="text-gray-400 mb-4">
            Powered by AI • Built with Next.js • Real-time updates with Supabase
          </p>
          <div className="text-sm text-gray-500">
            © 2025 AI Trivia Arena. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
