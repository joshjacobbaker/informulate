'use client';

import { AnswerResult } from '@/lib/stores/gameStore/gameStore';

// Answer validation and scoring service
export class AnswerValidationService {
  
  /**
   * Calculate points for a correct answer based on difficulty and time taken
   */
  static calculatePoints(
    difficulty: 'easy' | 'medium' | 'hard',
    timeTaken: number,
    timeLimit: number,
    isCorrect: boolean
  ): number {
    if (!isCorrect) return 0;

    // Base points by difficulty
    const basePoints = {
      easy: 10,
      medium: 20,
      hard: 30,
    };

    let points = basePoints[difficulty];

    // Time bonus: up to 50% extra points for quick answers
    const timeRatio = Math.max(0, (timeLimit - timeTaken) / timeLimit);
    const timeBonus = Math.floor(points * timeRatio * 0.5);
    
    points += timeBonus;

    // Speed bonus for very fast answers (under 10 seconds)
    if (timeTaken <= 10) {
      points += Math.floor(points * 0.2); // 20% speed bonus
    }

    return Math.max(points, basePoints[difficulty]); // Ensure minimum base points
  }

  /**
   * Validate answer and create result object
   */
  static validateAnswer(
    selectedAnswer: string,
    correctAnswer: string,
    difficulty: 'easy' | 'medium' | 'hard',
    timeTaken: number,
    timeLimit: number,
    explanation?: string
  ): AnswerResult {
    const isCorrect = selectedAnswer.toLowerCase() === correctAnswer.toLowerCase();
    const pointsEarned = this.calculatePoints(difficulty, timeTaken, timeLimit, isCorrect);

    return {
      isCorrect,
      pointsEarned,
      correctAnswer,
      selectedAnswer,
      timeTaken,
      explanation,
    };
  }

  /**
   * Check for streak-based achievements
   */
  static checkStreakAchievements(currentStreak: number, isCorrect: boolean): {
    type: 'streak';
    value: number;
    message: string;
  } | null {
    if (!isCorrect) return null;

    const streak = currentStreak + 1;

    if (streak === 5) {
      return {
        type: 'streak',
        value: 5,
        message: '🔥 5 Question Streak!',
      };
    }

    if (streak === 10) {
      return {
        type: 'streak',
        value: 10,
        message: '🚀 10 Question Streak!',
      };
    }

    if (streak === 15) {
      return {
        type: 'streak',
        value: 15,
        message: '⚡ Lightning Streak!',
      };
    }

    if (streak === 20) {
      return {
        type: 'streak',
        value: 20,
        message: '🏆 INCREDIBLE! 20 Question Streak!',
      };
    }

    if (streak === 25) {
      return {
        type: 'streak',
        value: 25,
        message: '🌟 LEGENDARY! 25 Question Streak!',
      };
    }

    if (streak === 50) {
      return {
        type: 'streak',
        value: 50,
        message: '👑 MYTHICAL! 50 Question Streak!',
      };
    }

    return null;
  }

  /**
   * Check for score-based achievements
   */
  static checkScoreAchievements(oldScore: number, newScore: number): {
    type: 'milestone';
    value: number;
    message: string;
  } | null {
    const milestones = [
      { value: 100, message: '🎯 First Century! 100 Points!' },
      { value: 500, message: '💫 Rising Star! 500 Points!' },
      { value: 1000, message: '🏅 Four Digits! 1000 Points!' },
      { value: 2500, message: '🚀 High Flyer! 2500 Points!' },
      { value: 5000, message: '💎 Diamond League! 5000 Points!' },
      { value: 10000, message: '👑 Elite Status! 10000 Points!' },
      { value: 25000, message: '🌟 Legendary! 25000 Points!' },
      { value: 50000, message: '🏆 Hall of Fame! 50000 Points!' },
    ];

    for (const milestone of milestones) {
      if (newScore >= milestone.value && oldScore < milestone.value) {
        return {
          type: 'milestone',
          value: milestone.value,
          message: milestone.message,
        };
      }
    }

    return null;
  }

  /**
   * Check for speed-based achievements
   */
  static checkSpeedAchievements(timeTaken: number, pointsEarned: number): {
    type: 'speed_bonus';
    value: number;
    message: string;
  } | null {
    if (timeTaken <= 3) {
      return {
        type: 'speed_bonus',
        value: pointsEarned,
        message: '⚡ Lightning Fast! (3s)',
      };
    }

    if (timeTaken <= 5) {
      return {
        type: 'speed_bonus',
        value: pointsEarned,
        message: '🏃 Quick Draw! (5s)',
      };
    }

    if (timeTaken <= 10) {
      return {
        type: 'speed_bonus',
        value: pointsEarned,
        message: '⏰ Speed Bonus! (10s)',
      };
    }

    return null;
  }

  /**
   * Check for accuracy-based achievements
   */
  static checkAccuracyAchievements(
    correctAnswers: number,
    totalAnswers: number
  ): {
    type: 'perfect_streak';
    value: number;
    message: string;
  } | null {
    if (totalAnswers < 5) return null; // Need at least 5 answers

    const accuracy = (correctAnswers / totalAnswers) * 100;

    if (accuracy === 100) {
      if (totalAnswers >= 50) {
        return {
          type: 'perfect_streak',
          value: totalAnswers,
          message: '🏆 PERFECT! 50+ Questions Without Error!',
        };
      }
      if (totalAnswers >= 25) {
        return {
          type: 'perfect_streak',
          value: totalAnswers,
          message: '💎 FLAWLESS! 25+ Questions Perfect!',
        };
      }
      if (totalAnswers >= 10) {
        return {
          type: 'perfect_streak',
          value: totalAnswers,
          message: '⭐ AMAZING! 10+ Questions Perfect!',
        };
      }
    }

    return null;
  }

  /**
   * Comprehensive achievement check
   */
  static checkAllAchievements(
    isCorrect: boolean,
    pointsEarned: number,
    timeTaken: number,
    currentStreak: number,
    oldScore: number,
    newScore: number,
    correctAnswers: number,
    totalAnswers: number
  ) {
    const achievements = [];

    // Check streak achievements
    const streakAchievement = this.checkStreakAchievements(currentStreak, isCorrect);
    if (streakAchievement) achievements.push(streakAchievement);

    // Check score milestones
    const scoreAchievement = this.checkScoreAchievements(oldScore, newScore);
    if (scoreAchievement) achievements.push(scoreAchievement);

    // Check speed achievements (only for correct answers)
    if (isCorrect) {
      const speedAchievement = this.checkSpeedAchievements(timeTaken, pointsEarned);
      if (speedAchievement) achievements.push(speedAchievement);
    }

    // Check accuracy achievements
    const accuracyAchievement = this.checkAccuracyAchievements(correctAnswers, totalAnswers);
    if (accuracyAchievement) achievements.push(accuracyAchievement);

    // Return the most significant achievement (prioritize by rarity)
    if (achievements.length > 0) {
      // Sort by priority: perfect_streak > milestone > streak > speed_bonus
      const priority = {
        perfect_streak: 4,
        milestone: 3,
        streak: 2,
        speed_bonus: 1,
      };

      achievements.sort((a, b) => priority[b.type] - priority[a.type]);
      return achievements[0];
    }

    return null;
  }

  /**
   * Format time for display
   */
  static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Get difficulty multiplier for scoring
   */
  static getDifficultyMultiplier(difficulty: 'easy' | 'medium' | 'hard'): number {
    const multipliers = {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0,
    };
    return multipliers[difficulty];
  }

  /**
   * Calculate expected time for a difficulty level
   */
  static getExpectedTime(difficulty: 'easy' | 'medium' | 'hard'): number {
    const expectedTimes = {
      easy: 15,   // seconds
      medium: 30,
      hard: 45,
    };
    return expectedTimes[difficulty];
  }

  /**
   * Provide performance feedback based on answer result
   */
  static getPerformanceFeedback(result: AnswerResult): {
    emoji: string;
    title: string;
    description: string;
    color: string;
  } {
    if (!result.isCorrect) {
      return {
        emoji: '❌',
        title: 'Not Quite Right',
        description: 'Keep trying! Every mistake is a learning opportunity.',
        color: 'red',
      };
    }

    // Correct answer feedback based on time and points
    if (result.timeTaken <= 5) {
      return {
        emoji: '⚡',
        title: 'Lightning Fast!',
        description: 'Incredible speed! You really know your stuff.',
        color: 'yellow',
      };
    }

    if (result.timeTaken <= 15) {
      return {
        emoji: '🔥',
        title: 'Quick Thinking!',
        description: 'Great speed and accuracy combination.',
        color: 'orange',
      };
    }

    if (result.timeTaken <= 30) {
      return {
        emoji: '✅',
        title: 'Well Done!',
        description: 'Good answer with solid timing.',
        color: 'green',
      };
    }

    return {
      emoji: '👍',
      title: 'Correct!',
      description: 'Right answer! Consider speeding up for bonus points.',
      color: 'blue',
    };
  }
}
