'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Target, Zap, TrendingUp, User, Calendar } from 'lucide-react';
import { SupabaseService } from '@/lib/supabase/service';
import { GameSession } from '@/lib/supabase/types';

interface LiveScoreboardProps {
  sessionId: string;
  className?: string;
  compact?: boolean;
}

interface ScoreboardStats {
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  currentStreak: number;
  maxStreak: number;
  accuracy: number;
  playerId: string;
  isActive: boolean;
}

const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  sessionId,
  className = '',
  compact = false,
}) => {
  const [stats, setStats] = useState<ScoreboardStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial session data
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) return;
      
      setIsLoading(true);
      const supabaseService = new SupabaseService();
      
      try {
        const session = await supabaseService.getGameSession(sessionId);
        if (session) {
          setStats({
            score: session.score,
            correctAnswers: session.correct_answers,
            totalAnswers: session.total_answers,
            currentStreak: session.current_streak,
            maxStreak: session.max_streak,
            accuracy: session.total_answers > 0 ? 
              (session.correct_answers / session.total_answers) * 100 : 0,
            playerId: session.player_id,
            isActive: session.is_active,
          });
        }
      } catch (error) {
        console.error('Error loading session data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId]);

  // Set up real-time subscription to game session updates
  useEffect(() => {
    if (!sessionId) return;

    const supabaseService = new SupabaseService();
    
    // Subscribe to real-time updates for this session
    const subscription = supabaseService.subscribeToGameSession(
      sessionId,
      (payload) => {
        const updatedSession = payload.new as GameSession;
        
        setStats({
          score: updatedSession.score,
          correctAnswers: updatedSession.correct_answers,
          totalAnswers: updatedSession.total_answers,
          currentStreak: updatedSession.current_streak,
          maxStreak: updatedSession.max_streak,
          accuracy: updatedSession.total_answers > 0 ? 
            (updatedSession.correct_answers / updatedSession.total_answers) * 100 : 0,
          playerId: updatedSession.player_id,
          isActive: updatedSession.is_active,
        });
        
        setIsConnected(true);
      }
    );

    setIsConnected(true);

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No game session data available
        </p>
      </div>
    );
  }

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color = 'text-blue-600 dark:text-blue-400',
    highlight = false 
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: string;
    highlight?: boolean;
  }) => (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg p-3 border
      ${highlight ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}
      transition-all duration-300 hover:shadow-md
    `}>
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {label}
        </span>
      </div>
      <div className={`text-lg font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
                {stats.score}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {stats.correctAnswers}/{stats.totalAnswers}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {stats.currentStreak}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Live Scoreboard
            </h3>
            <div className="flex items-center space-x-2">
              <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {stats.playerId}
              </span>
            </div>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {isConnected ? 'Live Updates' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <StatCard
          icon={Trophy}
          label="Total Score"
          value={stats.score.toLocaleString()}
          color="text-yellow-600 dark:text-yellow-400"
          highlight={stats.score > 0}
        />
        
        <StatCard
          icon={Target}
          label="Correct"
          value={`${stats.correctAnswers}/${stats.totalAnswers}`}
          color="text-green-600 dark:text-green-400"
        />
        
        <StatCard
          icon={TrendingUp}
          label="Accuracy"
          value={`${stats.accuracy.toFixed(1)}%`}
          color={stats.accuracy >= 70 ? "text-green-600 dark:text-green-400" : 
                stats.accuracy >= 50 ? "text-yellow-600 dark:text-yellow-400" : 
                "text-red-600 dark:text-red-400"}
        />
        
        <StatCard
          icon={Zap}
          label="Current Streak"
          value={stats.currentStreak}
          color="text-orange-600 dark:text-orange-400"
          highlight={stats.currentStreak > 0}
        />
        
        <StatCard
          icon={Zap}
          label="Best Streak"
          value={stats.maxStreak}
          color="text-purple-600 dark:text-purple-400"
        />
        
        <StatCard
          icon={Calendar}
          label="Status"
          value={stats.isActive ? "Active" : "Ended"}
          color={stats.isActive ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}
        />
      </div>

      {/* Progress Bar for Accuracy */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Overall Performance
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {stats.accuracy.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              stats.accuracy >= 70 ? 'bg-green-500' :
              stats.accuracy >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(stats.accuracy, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Streak Animation */}
      {stats.currentStreak > 2 && (
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-bounce" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              🔥 On Fire! {stats.currentStreak} correct answers in a row!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoreboard;
