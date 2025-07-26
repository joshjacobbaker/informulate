'use client';

import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/lib/supabase/service';
import { GameSession } from '@/lib/supabase/types';
import { gameSessionKeys } from './gameSessionQuery';

// Types for score updates
export interface ScoreUpdate {
  sessionId: string;
  oldScore: number;
  newScore: number;
  pointsEarned: number;
  isCorrect: boolean;
  currentStreak: number;
  maxStreak: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  timestamp: string;
  achievement?: {
    type: 'streak' | 'milestone' | 'perfect_streak';
    value: number;
    message: string;
  };
}

export interface LiveScoreData {
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  currentStreak: number;
  maxStreak: number;
  accuracy: number;
  isActive: boolean;
  lastUpdate: string;
  animations: {
    showScoreIncrease: boolean;
    scoreIncrease: number;
    showAchievement: boolean;
    achievement?: ScoreUpdate['achievement'];
  };
}

// Hook for managing real-time score updates
export function useScoreRealtime(sessionId: string | null) {
  const queryClient = useQueryClient();
  const [liveScoreData, setLiveScoreData] = useState<LiveScoreData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Handle score updates from database changes
  const handleScoreUpdate = useCallback((payload: { new: GameSession }) => {
    if (!sessionId) return;
    
    const updatedSession = payload.new;

    const newScoreData: LiveScoreData = {
      score: updatedSession.score,
      correctAnswers: updatedSession.correct_answers,
      totalAnswers: updatedSession.total_answers,
      currentStreak: updatedSession.current_streak,
      maxStreak: updatedSession.max_streak,
      accuracy: updatedSession.total_answers > 0 
        ? (updatedSession.correct_answers / updatedSession.total_answers) * 100 
        : 0,
      isActive: updatedSession.is_active,
      lastUpdate: updatedSession.updated_at || new Date().toISOString(),
      animations: {
        showScoreIncrease: false,
        scoreIncrease: 0,
        showAchievement: false,
        achievement: undefined,
      },
    };

    // Calculate score increase for animation
    if (liveScoreData && updatedSession.score > liveScoreData.score) {
      newScoreData.animations.showScoreIncrease = true;
      newScoreData.animations.scoreIncrease = updatedSession.score - liveScoreData.score;
      
      // Auto-hide score increase animation after 3 seconds
      setTimeout(() => {
        setLiveScoreData(prev => prev ? {
          ...prev,
          animations: {
            ...prev.animations,
            showScoreIncrease: false,
            scoreIncrease: 0,
          }
        } : null);
      }, 3000);
    }

    // Check for achievements
    const achievement = checkForAchievements(liveScoreData, newScoreData);
    if (achievement) {
      newScoreData.animations.showAchievement = true;
      newScoreData.animations.achievement = achievement;
      
      // Auto-hide achievement after 5 seconds
      setTimeout(() => {
        setLiveScoreData(prev => prev ? {
          ...prev,
          animations: {
            ...prev.animations,
            showAchievement: false,
            achievement: undefined,
          }
        } : null);
      }, 5000);
    }

    setLiveScoreData(newScoreData);

    // Update React Query cache
    queryClient.setQueryData(
      gameSessionKeys.session(sessionId),
      updatedSession
    );

    setConnectionStatus('connected');
  }, [queryClient, sessionId, liveScoreData]);

  // Handle score broadcast events (immediate feedback)
  const handleScoreBroadcast = useCallback((payload: ScoreUpdate) => {
    if (!sessionId || payload.sessionId !== sessionId) return;
    

    const newScoreData: LiveScoreData = {
      score: payload.newScore,
      correctAnswers: payload.correctAnswers,
      totalAnswers: payload.totalAnswers,
      currentStreak: payload.currentStreak,
      maxStreak: payload.maxStreak,
      accuracy: payload.accuracy,
      isActive: true,
      lastUpdate: payload.timestamp,
      animations: {
        showScoreIncrease: payload.pointsEarned > 0,
        scoreIncrease: payload.pointsEarned,
        showAchievement: !!payload.achievement,
        achievement: payload.achievement,
      },
    };

    setLiveScoreData(newScoreData);

    // Auto-hide animations
    setTimeout(() => {
      setLiveScoreData(prev => prev ? {
        ...prev,
        animations: {
          showScoreIncrease: false,
          scoreIncrease: 0,
          showAchievement: false,
          achievement: undefined,
        }
      } : null);
    }, 3000);

    // Trigger custom event for other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('scoreUpdate', {
        detail: payload
      }));
    }

    setConnectionStatus('connected');
  }, [sessionId]);

  // Set up subscriptions
  useEffect(() => {
    if (!sessionId) return;

    setConnectionStatus('connecting');
    const supabaseService = new SupabaseService();
    
    // Subscribe to database changes for game sessions
    const sessionSubscription = supabaseService.subscribeToGameSession(sessionId, handleScoreUpdate);
    
    // Subscribe to score broadcast events
    const scoreBroadcastSubscription = supabaseService.subscribeToScoreBroadcasts(handleScoreBroadcast);

    // Cleanup subscriptions
    return () => {
      sessionSubscription.unsubscribe();
      scoreBroadcastSubscription.unsubscribe();
      setConnectionStatus('disconnected');
    };
  }, [sessionId, handleScoreUpdate, handleScoreBroadcast]);

  // Load initial score data
  useEffect(() => {
    const loadInitialScore = async () => {
      if (!sessionId) return;

      const supabaseService = new SupabaseService();
      try {
        const session = await supabaseService.getGameSession(sessionId);
        if (session) {
          setLiveScoreData({
            score: session.score,
            correctAnswers: session.correct_answers,
            totalAnswers: session.total_answers,
            currentStreak: session.current_streak,
            maxStreak: session.max_streak,
            accuracy: session.total_answers > 0 
              ? (session.correct_answers / session.total_answers) * 100 
              : 0,
            isActive: session.is_active,
            lastUpdate: session.updated_at || new Date().toISOString(),
            animations: {
              showScoreIncrease: false,
              scoreIncrease: 0,
              showAchievement: false,
              achievement: undefined,
            },
          });
        }
      } catch (error) {
        console.error('Error loading initial score:', error);
        setConnectionStatus('disconnected');
      }
    };

    loadInitialScore();
  }, [sessionId]);

  return {
    liveScoreData,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    clearAnimations: () => {
      setLiveScoreData(prev => prev ? {
        ...prev,
        animations: {
          showScoreIncrease: false,
          scoreIncrease: 0,
          showAchievement: false,
          achievement: undefined,
        }
      } : null);
    },
  };
}

// Helper function to check for achievements
function checkForAchievements(
  oldData: LiveScoreData | null,
  newData: LiveScoreData
): ScoreUpdate['achievement'] | undefined {
  if (!oldData) return undefined;

  // Streak achievements
  if (newData.currentStreak > oldData.currentStreak) {
    if (newData.currentStreak === 5) {
      return {
        type: 'streak',
        value: 5,
        message: '🔥 5 in a Row! You\'re on fire!'
      };
    }
    if (newData.currentStreak === 10) {
      return {
        type: 'streak',
        value: 10,
        message: '⚡ 10 Streak! Unstoppable!'
      };
    }
    if (newData.currentStreak === 20) {
      return {
        type: 'streak',
        value: 20,
        message: '🌟 20 Streak! Legendary!'
      };
    }
  }

  // Score milestones
  if (newData.score >= 1000 && oldData.score < 1000) {
    return {
      type: 'milestone',
      value: 1000,
      message: '🎯 1,000 Points! Excellent work!'
    };
  }
  if (newData.score >= 5000 && oldData.score < 5000) {
    return {
      type: 'milestone',
      value: 5000,
      message: '🏆 5,000 Points! You\'re a champion!'
    };
  }

  // Perfect accuracy achievements
  if (newData.totalAnswers >= 10 && newData.accuracy === 100 && oldData.accuracy < 100) {
    return {
      type: 'perfect_streak',
      value: newData.totalAnswers,
      message: '💯 Perfect Score! Flawless execution!'
    };
  }

  return undefined;
}

// Hook for score notifications across the app
export function useScoreNotifications() {
  const [latestUpdate, setLatestUpdate] = useState<ScoreUpdate | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScoreUpdate = (event: CustomEvent<ScoreUpdate>) => {
      setLatestUpdate(event.detail);
      
      // Clear after 5 seconds
      setTimeout(() => setLatestUpdate(null), 5000);
    };

    window.addEventListener('scoreUpdate', handleScoreUpdate as EventListener);

    return () => {
      window.removeEventListener('scoreUpdate', handleScoreUpdate as EventListener);
    };
  }, []);

  return {
    latestUpdate,
    hasUpdate: latestUpdate !== null,
    clearUpdate: () => setLatestUpdate(null),
  };
}
