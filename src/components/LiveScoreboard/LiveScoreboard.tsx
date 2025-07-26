"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Target, Zap, TrendingUp, User, Calendar, Plus } from "lucide-react";
import { useScoreRealtime, useScoreNotifications } from "@/lib/query";

interface LiveScoreboardProps {
  sessionId: string;
  className?: string;
  compact?: boolean;
}

const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  sessionId,
  className = "",
  compact = false,
}) => {
  // Use enhanced real-time score hooks
  const { liveScoreData, isConnected } = useScoreRealtime(sessionId);
  const { latestUpdate, hasUpdate } = useScoreNotifications();
  
  const [isLoading, setIsLoading] = useState(true);

  // Handle loading state
  useEffect(() => {
    // Set loading to false after some time or when data is received
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Short delay to allow for loading state

    if (liveScoreData) {
      clearTimeout(timer);
      setIsLoading(false);
    }

    return () => clearTimeout(timer);
  }, [liveScoreData, isConnected]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`} role="status" aria-label="Loading scoreboard">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!liveScoreData) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${className}`}
      >
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
    color = "text-blue-600 dark:text-blue-400",
    highlight = false,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: string;
    highlight?: boolean;
  }) => (
    <div
      className={`
      bg-white dark:bg-gray-800 rounded-lg p-3 border
      ${
        highlight
          ? "border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
          : "border-gray-200 dark:border-gray-700"
      }
      transition-all duration-300 hover:shadow-md
    `}
    >
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {label}
        </span>
      </div>
      <div className={`text-lg font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );

  if (compact) {
    return (
      <div
        className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 relative">
              <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
                {liveScoreData.score}
              </span>
              {/* Score increase animation */}
              {liveScoreData.animations.showScoreIncrease && (
                <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                  <Plus className="w-3 h-3 inline mr-1" />
                  {liveScoreData.animations.scoreIncrease}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {liveScoreData.correctAnswers}/{liveScoreData.totalAnswers}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {liveScoreData.currentStreak}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}
    >
      {/* Global Score Update Notification */}
      {hasUpdate && latestUpdate && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {latestUpdate.isCorrect ? '✅ Correct!' : '❌ Incorrect'} 
              {latestUpdate.pointsEarned > 0 && ` +${latestUpdate.pointsEarned} points`}
            </span>
          </div>
        </div>
      )}

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
                Player {sessionId.slice(-6)}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {isConnected ? "Live Updates" : "Offline"}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div className="relative">
          <StatCard
            icon={Trophy}
            label="Total Score"
            value={liveScoreData.score.toLocaleString()}
            color="text-yellow-600 dark:text-yellow-400"
            highlight={liveScoreData.score > 0}
          />
          {/* Score increase animation */}
          {liveScoreData.animations.showScoreIncrease && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce z-10">
              <Plus className="w-3 h-3 inline mr-1" />
              +{liveScoreData.animations.scoreIncrease}
            </div>
          )}
        </div>

        <StatCard
          icon={Target}
          label="Correct"
          value={`${liveScoreData.correctAnswers}/${liveScoreData.totalAnswers}`}
          color="text-green-600 dark:text-green-400"
        />

        <StatCard
          icon={TrendingUp}
          label="Accuracy"
          value={`${liveScoreData.accuracy.toFixed(1)}%`}
          color={
            liveScoreData.accuracy >= 70
              ? "text-green-600 dark:text-green-400"
              : liveScoreData.accuracy >= 50
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400"
          }
        />

        <StatCard
          icon={Zap}
          label="Current Streak"
          value={liveScoreData.currentStreak}
          color="text-orange-600 dark:text-orange-400"
          highlight={liveScoreData.currentStreak > 0}
        />

        <StatCard
          icon={Zap}
          label="Best Streak"
          value={liveScoreData.maxStreak}
          color="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          icon={Calendar}
          label="Status"
          value={liveScoreData.isActive ? "Active" : "Ended"}
          color={
            liveScoreData.isActive
              ? "text-green-600 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400"
          }
        />
      </div>

      {/* Progress Bar for Accuracy */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Overall Performance
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {liveScoreData.accuracy.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              liveScoreData.accuracy >= 70
                ? "bg-green-500"
                : liveScoreData.accuracy >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(liveScoreData.accuracy, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Streak Animation */}
      {liveScoreData.currentStreak > 2 && (
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-bounce" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              🔥 On Fire! {liveScoreData.currentStreak} correct answers in a row!
            </span>
          </div>
        </div>
      )}

      {/* Achievement Notification */}
      {liveScoreData.animations.showAchievement && liveScoreData.animations.achievement && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 rounded-lg animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="text-2xl animate-bounce">
              {liveScoreData.animations.achievement.type === 'streak' && '🔥'}
              {liveScoreData.animations.achievement.type === 'milestone' && '🏆'}
              {liveScoreData.animations.achievement.type === 'perfect_streak' && '💯'}
            </div>
            <div>
              <h4 className="font-bold text-purple-800 dark:text-purple-200">
                Achievement Unlocked!
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {liveScoreData.animations.achievement.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoreboard;
