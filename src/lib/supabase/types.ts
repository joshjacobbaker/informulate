export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string
          question_text: string
          options: string[]
          correct_answer: string
          category: string
          difficulty: string
          explanation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_text: string
          options: string[]
          correct_answer: string
          category?: string
          difficulty?: string
          explanation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_text?: string
          options?: string[]
          correct_answer?: string
          category?: string
          difficulty?: string
          explanation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          player_id: string
          score: number
          correct_answers: number
          total_answers: number
          current_streak: number
          max_streak: number
          difficulty_preference: string
          category_preference: string | null
          is_active: boolean
          started_at: string
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          score?: number
          correct_answers?: number
          total_answers?: number
          current_streak?: number
          max_streak?: number
          difficulty_preference?: string
          category_preference?: string | null
          is_active?: boolean
          started_at?: string
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          score?: number
          correct_answers?: number
          total_answers?: number
          current_streak?: number
          max_streak?: number
          difficulty_preference?: string
          category_preference?: string | null
          is_active?: boolean
          started_at?: string
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          session_id: string
          selected_answer: string
          is_correct: boolean
          time_taken: number | null
          points_earned: number
          answered_at: string
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          session_id: string
          selected_answer: string
          is_correct: boolean
          time_taken?: number | null
          points_earned?: number
          answered_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          session_id?: string
          selected_answer?: string
          is_correct?: boolean
          time_taken?: number | null
          points_earned?: number
          answered_at?: string
          created_at?: string
        }
      }
      question_history: {
        Row: {
          id: string
          session_id: string
          question_id: string
          asked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          asked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          asked_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_question: {
        Args: {
          p_session_id: string
          p_category?: string
          p_difficulty?: string
        }
        Returns: {
          id: string
          question_text: string
          options: string[]
          correct_answer: string
          category: string
          difficulty: string
        }[]
      }
      calculate_score: {
        Args: {
          p_difficulty: string
          p_time_taken?: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Question = Database['public']['Tables']['questions']['Row']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']

export type GameSession = Database['public']['Tables']['game_sessions']['Row']
export type GameSessionInsert = Database['public']['Tables']['game_sessions']['Insert']
export type GameSessionUpdate = Database['public']['Tables']['game_sessions']['Update']

export type Answer = Database['public']['Tables']['answers']['Row']
export type AnswerInsert = Database['public']['Tables']['answers']['Insert']
export type AnswerUpdate = Database['public']['Tables']['answers']['Update']

export type QuestionHistory = Database['public']['Tables']['question_history']['Row']
export type QuestionHistoryInsert = Database['public']['Tables']['question_history']['Insert']
export type QuestionHistoryUpdate = Database['public']['Tables']['question_history']['Update']

// Game-specific types
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type GameCategory = 
  | 'General Knowledge'
  | 'Science & Nature'
  | 'History'
  | 'Geography'
  | 'Sports'
  | 'Entertainment'
  | 'Technology'
  | 'Literature'
  | 'Art & Culture'
  | 'Politics'
  | 'Mathematics'
  | 'Food & Drink'
