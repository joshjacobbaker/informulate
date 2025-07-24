import { ArrowRight } from "lucide-react";
import React from "react";

const HowItWorksSectionData = [
  {
    step: "1",
    title: "Choose Your Preferences",
    description:
      "Select your difficulty level, preferred categories, and enter your player name.",
  },
  {
    step: "2",
    title: "Answer Questions",
    description:
      "Respond to AI-generated questions with real-time feedback and scoring.",
  },
  {
    step: "3",
    title: "Track Your Progress",
    description:
      "Monitor your scores, streaks, and improvement across different categories.",
  },
];

const HowItWorksSection: React.FC = () => (
  <div className="py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          How It Works
        </h3>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Get started in three simple steps and begin your trivia journey.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {HowItWorksSectionData.map((item, index) => (
          <div key={index} className="text-center relative">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              {item.step}
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {item.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {item.description}
            </p>
            {index < 2 && (
              <ArrowRight
                data-testid="lucide-arrow-right"
                className="w-6 h-6 text-blue-500 absolute top-6 -right-3 hidden md:block"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default HowItWorksSection;
