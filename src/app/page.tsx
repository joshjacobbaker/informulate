'use client'

import { useState } from 'react'
import { Brain, Zap, Trophy, Users, ArrowRight, Play, Star, Sparkles } from 'lucide-react'

interface StartGameModalProps {
  isOpen: boolean
  onClose: () => void
  onStartGame: (playerName: string, difficulty: string, category: string) => void
}

function StartGameModal({ isOpen, onClose, onStartGame }: StartGameModalProps) {
  const [playerName, setPlayerName] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [category, setCategory] = useState('any')

  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'Perfect for beginners' },
    { value: 'medium', label: 'Medium', description: 'Balanced challenge' },
    { value: 'hard', label: 'Hard', description: 'For trivia masters' }
  ]

  const categories = [
    { value: 'any', label: 'Any Category' },
    { value: 'Science & Nature', label: 'Science & Nature' },
    { value: 'History', label: 'History' },
    { value: 'Geography', label: 'Geography' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Literature', label: 'Literature' },
    { value: 'Art & Culture', label: 'Art & Culture' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStartGame(playerName || 'Anonymous Player', difficulty, category === 'any' ? '' : category)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start New Game</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Player Name (Optional)
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Difficulty Level
            </label>
            <div className="space-y-2">
              {difficulties.map((diff) => (
                <label key={diff.value} className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="difficulty"
                    value={diff.value}
                    checked={difficulty === diff.value}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{diff.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{diff.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Game
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStartGame = async (playerName: string, difficulty: string, category: string) => {
    try {
      // Create a new game session
      const sessionResponse = await fetch('/api/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: playerName,
          difficultyPreference: difficulty,
          categoryPreference: category || null
        })
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to create game session')
      }

      const sessionData = await sessionResponse.json()
      
      // Store session info in localStorage for the game
      localStorage.setItem('gameSession', JSON.stringify({
        sessionId: sessionData.session.id,
        playerName: sessionData.session.playerId,
        difficulty,
        category
      }))

      // TODO: Navigate to game page once it's implemented
      console.log('Game session created:', sessionData)
      alert(`Game session created! Session ID: ${sessionData.session.id}`)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error starting game:', error)
      alert('Failed to start game. Please try again.')
    }
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Dynamic questions generated by advanced AI, ensuring fresh challenges every time you play.'
    },
    {
      icon: Zap,
      title: 'Real-time Gameplay',
      description: 'Experience instant feedback, live scoring, and seamless gameplay with real-time updates.'
    },
    {
      icon: Trophy,
      title: 'Smart Scoring',
      description: 'Earn points based on difficulty, speed, and accuracy. Build streaks for bonus rewards.'
    },
    {
      icon: Users,
      title: 'Multiple Categories',
      description: 'Test your knowledge across Science, History, Sports, Entertainment, and many more categories.'
    }
  ]

  const stats = [
    { label: 'Questions Available', value: '10,000+' },
    { label: 'Categories', value: '12+' },
    { label: 'Difficulty Levels', value: '3' },
    { label: 'AI-Powered', value: '100%' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center pt-20 pb-16">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="ml-4 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Trivia Arena
              </h1>
            </div>

            {/* Hero Content */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Challenge Your Mind with
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  AI-Powered Trivia
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Experience the future of trivia gaming with dynamically generated questions, 
                real-time scoring, and intelligent difficulty adaptation. Test your knowledge 
                across multiple categories and compete for the highest scores.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
                >
                  <Play className="w-6 h-6" />
                  Start Playing Now
                </button>
                
                <button className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg">
                  <Sparkles className="w-6 h-6" />
                  View Demo
                </button>
              </div>

              {/* Stats */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose AI Trivia Arena?
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built with cutting-edge technology to deliver the most engaging and intelligent trivia experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
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
            {[
              {
                step: '1',
                title: 'Choose Your Preferences',
                description: 'Select your difficulty level, preferred categories, and enter your player name.'
              },
              {
                step: '2',
                title: 'Answer Questions',
                description: 'Respond to AI-generated questions with real-time feedback and scoring.'
              },
              {
                step: '3',
                title: 'Track Your Progress',
                description: 'Monitor your scores, streaks, and improvement across different categories.'
              }
            ].map((item, index) => (
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
                  <ArrowRight className="w-6 h-6 text-blue-500 absolute top-6 -right-3 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Star className="w-16 h-16 text-white mx-auto mb-6" />
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Test Your Knowledge?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of players who are already challenging themselves with AI Trivia Arena. 
            Start your journey to becoming a trivia master today!
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
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

      {/* Start Game Modal */}
      <StartGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartGame={handleStartGame}
      />
    </div>
  )
}
