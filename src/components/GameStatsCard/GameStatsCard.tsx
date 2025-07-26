import React from "react";
import { features } from "./GameStatsCardData";

const GameStatsCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
      Game Features
    </h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature) => (
        <div
          key={feature.title}
          className={`text-center p-4 rounded-lg ${feature.bg}`}
        >
          <div className={`text-2xl font-bold ${feature.iconColor}`}>
            {feature.icon}
          </div>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
            {feature.title}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {feature.subtitle}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default GameStatsCard;
