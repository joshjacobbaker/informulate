import { createClient } from './client'
import { Database } from './types'

type Tables = Database['public']['Tables']
type Question = Tables['questions']['Row']
type GameSession = Tables['game_sessions']['Row']
type Answer = Tables['answers']['Row']

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

  // Game session operations
  async createGameSession(playerId: string): Promise<GameSession | null> {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .insert({ 
        player_id: playerId,
        score: 0,
        correct_answers: 0,
        total_answers: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating game session:', error)
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
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating game session:', error)
      return null
    }
    return data
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
}

export const supabaseService = new SupabaseService()
