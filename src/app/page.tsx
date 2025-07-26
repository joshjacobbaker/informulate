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
import { useCreateGameSession } from "@/lib/query";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createGameSession = useCreateGameSession();

  const router = useRouter();
  const handleStartGame = async (
    playerName: string,
    difficulty: string,
    category: string
  ) => {
    try {
      await createGameSession.mutateAsync({
        playerId: playerName,
        difficulty: difficulty as "easy" | "medium" | "hard",
        category: category || "any",
      });

      // Navigate to game page
      router.push("/game");
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

      {/* Demo Links Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Ready to Play?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Jump into the AI Trivia Arena and test your knowledge
          </p>

          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6 max-w-md mx-auto">
            <Link
              href="/game"
              className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Classic Game
              </h3>
              <p className="text-blue-100 text-sm">
                Original AI trivia experience
              </p>
            </Link>
          </div>
        </div>
      </div>

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
