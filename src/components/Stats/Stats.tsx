import React from "react";

type Stat = {
  value: string | number;
  label: string;
};

type StatsProps = {
  stats: Stat[];
};

const Stats: React.FC<StatsProps> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
    {stats.map((stat, index) => (
      <div key={index} className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
          {stat.value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {stat.label}
        </div>
      </div>
    ))}
  </div>
);

export default Stats;
