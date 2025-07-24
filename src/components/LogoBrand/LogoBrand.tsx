import React from "react";
import { Brain } from "lucide-react";

const LogoBrand: React.FC = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
      <Brain data-testid="brain-icon" className="w-8 h-8 text-white" />
    </div>
    <h1 className="ml-4 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      AI Trivia Arena
    </h1>
  </div>
);

export default LogoBrand;
