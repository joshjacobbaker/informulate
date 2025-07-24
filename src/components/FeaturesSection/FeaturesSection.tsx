import React from "react";
import { featuresData } from "./featuresSectionData";

export interface Feature {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FeaturesSectionProps {
  features: Feature[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  features = featuresData,
}) => (
  <section className="py-20 bg-white/50 dark:bg-gray-800/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Why Choose AI Trivia Arena?
        </h3>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Built with cutting-edge technology to deliver the most engaging and
          intelligent trivia experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg w-fit mb-4">
                {Icon ? <Icon className="w-6 h-6 text-white" /> : null}
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
