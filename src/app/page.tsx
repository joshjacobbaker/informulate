"use client";

import { useState } from "react";
import StartGameModal from "@/components/StartGameModal/StartGameModal";
import Footer from "@/components/Footer/Footer";
import CallToActionSection from "@/components/CallToActionSection/CallToActionSection";
import HowItWorksSection from "@/components/HowItWorksSection/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection/FeaturesSection";
import { featuresData } from "@/components/FeaturesSection/featuresSectionData";
import Stats from "@/components/Stats/Stats";
import { statsData } from "@/components/Stats/statsData";
import CtaButton from "@/components/CtaButton/CtaButton";
import LogoBrand from "@/components/LogoBrand/LogoBrand";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartGame = async (
    playerName: string,
    difficulty: string,
    category: string
  ) => {
    try {
      // Create a new game session
      const sessionResponse = await fetch("/api/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: playerName,
          difficultyPreference: difficulty,
          categoryPreference: category || null,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to create game session");
      }

      const sessionData = await sessionResponse.json();

      // Store session info in localStorage for the game
      localStorage.setItem(
        "gameSession",
        JSON.stringify({
          sessionId: sessionData.session.id,
          playerName: sessionData.session.playerId,
          difficulty,
          category,
        })
      );

      // TODO: Navigate to game page once it's implemented
      console.log("Game session created:", sessionData);
      alert(`Game session created! Session ID: ${sessionData.session.id}`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Failed to start game. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center pt-20 pb-16">
            {/* Logo/Brand */}
            <LogoBrand />

            {/* Hero Content */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Challenge Your Mind with
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  AI-Powered Trivia
                </span>
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Experience the future of trivia gaming with dynamically
                generated questions, real-time scoring, and intelligent
                difficulty adaptation. Test your knowledge across multiple
                categories and compete for the highest scores.
              </p>

              {/* CTA Buttons */}
              <CtaButton
                onStartPlaying={() => setIsModalOpen(true)}
                onViewDemo={() => console.log("View Demo clicked")}
              />

              {/* Stats */}
              <Stats stats={statsData} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <FeaturesSection features={[...featuresData]} />

      {/* How it works Section */}
      <HowItWorksSection />
      {/* Call to Action Section */}
      <CallToActionSection setIsModalOpen={setIsModalOpen} />
      {/* Footer */}
      <Footer />

      {/* Start Game Modal */}
      <StartGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartGame={handleStartGame}
      />
    </div>
  );
}
