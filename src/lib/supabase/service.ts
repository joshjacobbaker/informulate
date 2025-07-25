import { createClient } from './client'
import { Database, Question, GameSession, Answer, QuestionHistory, DifficultyLevel, GameCategory } from './types'

type Tables = Database['public']['Tables']

export class SupabaseService {
  private supabase = createClient()

  // Question operations
  async createQuestion(question: Tables['questions']['Insert']): Promise<Question | null> {
    const { data, error } = await this.supabase
      .from('questions')
      .insert(question)
      .select()
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return null
    }
    return data
  }

  async getQuestion(id: string): Promise<Question | null> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return null
    }
    return data
  }

  async getRandomQuestion(
    sessionId: string,
    category?: GameCategory,
    difficulty?: DifficultyLevel
  ): Promise<Question | null> {
    const { data, error } = await this.supabase
      .rpc('get_random_question', {
        p_session_id: sessionId,
        p_category: category || null,
        p_difficulty: difficulty || null
      })

    if (error) {
      console.error('Error fetching random question:', error)
      return null
    }

    // The RPC returns an array, get the first item
    const questionData = data?.[0]
    if (!questionData) return null

    // Convert the RPC result to our Question type
    return {
      id: questionData.id,
      question_text: questionData.question_text,
      options: questionData.options,
      correct_answer: questionData.correct_answer,
      category: questionData.category,
      difficulty: questionData.difficulty,
      explanation: null, // We'll fetch this separately when needed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  async getQuestionsByCategory(category: GameCategory): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching questions by category:', error)
      return []
    }
    return data || []
  }

  async getQuestionsByDifficulty(difficulty: DifficultyLevel): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('difficulty', difficulty)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching questions by difficulty:', error)
      return []
    }
    return data || []
  }

  // Game session operations
  async createGameSession(playerId: string): Promise<GameSession | null> {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .insert({ 
        player_id: playerId,
        score: 0,
        correct_answers: 0,
        total_answers: 0,
        current_streak: 0,
        max_streak: 0,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating game session:', error)
      return null
    }
    return data
  }

  async getGameSession(sessionId: string): Promise<GameSession | null> {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('Error fetching game session:', error)
      return null
    }
    return data
  }

  async getActiveGameSession(playerId: string): Promise<GameSession | null> {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .select('*')
      .eq('player_id', playerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching active game session:', error)
      return null
    }
    return data
  }

  async updateGameSession(
    sessionId: string, 
    updates: Tables['game_sessions']['Update']
  ): Promise<GameSession | null> {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating game session:', error)
      return null
    }
    return data
  }

  async endGameSession(sessionId: string): Promise<GameSession | null> {
    return this.updateGameSession(sessionId, {
      is_active: false,
      ended_at: new Date().toISOString()
    })
  }

  // Answer operations
  async submitAnswer(answer: Tables['answers']['Insert']): Promise<Answer | null> {
    const { data, error } = await this.supabase
      .from('answers')
      .insert(answer)
      .select()
      .single()

    if (error) {
      console.error('Error submitting answer:', error)
      return null
    }
    return data
  }

  async getAnswersForSession(sessionId: string): Promise<Answer[]> {
    const { data, error } = await this.supabase
      .from('answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('answered_at', { ascending: true })

    if (error) {
      console.error('Error fetching answers for session:', error)
      return []
    }
    return data || []
  }

  // Question history operations
  async markQuestionAsAsked(sessionId: string, questionId: string): Promise<QuestionHistory | null> {
    const { data, error } = await this.supabase
      .from('question_history')
      .insert({
        session_id: sessionId,
        question_id: questionId
      })
      .select()
      .single()

    if (error) {
      console.error('Error marking question as asked:', error)
      return null
    }
    return data
  }

  async getAskedQuestions(sessionId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('question_history')
      .select('question_id')
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error fetching asked questions:', error)
      return []
    }
    return data.map(item => item.question_id)
  }

  // Statistics operations
  async getPlayerStats(playerId: string): Promise<{
    totalGames: number
    totalScore: number
    totalCorrect: number
    totalAnswers: number
    averageScore: number
    accuracy: number
    maxStreak: number
  }> {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .select('score, correct_answers, total_answers, max_streak')
      .eq('player_id', playerId)

    if (error) {
      console.error('Error fetching player stats:', error)
      return {
        totalGames: 0,
        totalScore: 0,
        totalCorrect: 0,
        totalAnswers: 0,
        averageScore: 0,
        accuracy: 0,
        maxStreak: 0
      }
    }

    const stats = data || []
    const totalGames = stats.length
    const totalScore = stats.reduce((sum, game) => sum + game.score, 0)
    const totalCorrect = stats.reduce((sum, game) => sum + game.correct_answers, 0)
    const totalAnswers = stats.reduce((sum, game) => sum + game.total_answers, 0)
    const maxStreak = Math.max(...stats.map(game => game.max_streak), 0)

    return {
      totalGames,
      totalScore,
      totalCorrect,
      totalAnswers,
      averageScore: totalGames > 0 ? totalScore / totalGames : 0,
      accuracy: totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0,
      maxStreak
    }
  }

  // Utility functions
  async calculateScore(difficulty: DifficultyLevel, timeTaken?: number): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('calculate_score', {
        p_difficulty: difficulty,
        p_time_taken: timeTaken || null
      })

    if (error) {
      console.error('Error calculating score:', error)
      // Fallback calculation
      const baseScore = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30
      const timeBonus = timeTaken && timeTaken < 5000 ? 10 : timeTaken && timeTaken < 10000 ? 5 : 0
      return baseScore + timeBonus
    }

    return data || 0
  }

  // Realtime subscriptions
  subscribeToQuestions(callback: (payload: { new: Question }) => void) {
    return this.supabase
      .channel('questions-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'questions' }, 
        callback
      )
      .subscribe()
  }

  subscribeToGameSession(sessionId: string, callback: (payload: { new: GameSession }) => void) {
    return this.supabase
      .channel(`game-session-${sessionId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        }, 
        callback
      )
      .subscribe()
  }

  subscribeToAnswers(sessionId: string, callback: (payload: { new: Answer }) => void) {
    return this.supabase
      .channel(`answers-${sessionId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'answers',
          filter: `session_id=eq.${sessionId}`
        }, 
        callback
      )
      .subscribe()
  }

  subscribeToQuestionHistory(sessionId: string, callback: (payload: { new: QuestionHistory }) => void) {
    return this.supabase
      .channel(`question-history-${sessionId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'question_history',
          filter: `session_id=eq.${sessionId}`
        }, 
        callback
      )
      .subscribe()
  }

  // Broadcast subscription methods
  subscribeToQuestionBroadcasts(callback: (payload: {
    sessionId: string;
    question: {
      id: string;
      question: string;
      options: string[];
      correctAnswer: string;
      category: string;
      difficulty: string;
    };
    questionSource: string;
    timestamp: string;
  }) => void) {
    return this.supabase
      .channel('question-updates')
      .on('broadcast', { event: 'question-generated' }, (payload) => {
        callback(payload.payload);
      })
      .subscribe()
  }

  subscribeToAnswerBroadcasts(callback: (payload: {
    sessionId: string;
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
    explanation?: string | object;
    timestamp: string;
  }) => void) {
    return this.supabase
      .channel('answer-updates')
      .on('broadcast', { event: 'answer-submitted' }, (payload) => {
        callback(payload.payload);
      })
      .subscribe()
  }

  // Admin/Development functions
  async insertSampleQuestions(): Promise<void> {
    const sampleQuestions = [
      {
        question_text: "What is the largest planet in our solar system?",
        options: ["A. Earth", "B. Jupiter", "C. Saturn", "D. Neptune"],
        correct_answer: "B",
        category: "Science & Nature",
        difficulty: "easy",
        explanation: "Jupiter is the largest planet in our solar system, with a mass greater than all other planets combined."
      },
      {
        question_text: "Who painted the Mona Lisa?",
        options: ["A. Vincent van Gogh", "B. Pablo Picasso", "C. Leonardo da Vinci", "D. Michelangelo"],
        correct_answer: "C",
        category: "Art & Culture",
        difficulty: "medium",
        explanation: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519. It's now housed in the Louvre Museum in Paris."
      },
      {
        question_text: "What is the chemical symbol for gold?",
        options: ["A. Go", "B. Au", "C. Ag", "D. Gd"],
        correct_answer: "B",
        category: "Science & Nature",
        difficulty: "medium",
        explanation: "The chemical symbol for gold is Au, which comes from the Latin word 'aurum' meaning gold."
      }
    ]

    for (const question of sampleQuestions) {
      await this.createQuestion(question)
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService()
