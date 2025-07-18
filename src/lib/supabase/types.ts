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
          explanation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          question_text: string
          options: string[]
          correct_answer: string
          explanation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          question_text?: string
          options?: string[]
          correct_answer?: string
          explanation?: string | null
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          player_id: string
          score: number
          correct_answers: number
          total_answers: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          score?: number
          correct_answers?: number
          total_answers?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          score?: number
          correct_answers?: number
          total_answers?: number
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
          answered_at: string
        }
        Insert: {
          id?: string
          question_id: string
          session_id: string
          selected_answer: string
          is_correct: boolean
          answered_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          session_id?: string
          selected_answer?: string
          is_correct?: boolean
          answered_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
