// API service functions for game sessions
export interface GameSession {
  id: string
  playerId: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  score: number
  questionsAnswered: number
  createdAt: string
}

export interface CreateSessionData {
  playerId: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface CreateSessionResponse {
  session: GameSession
}

export const gameSessionService = {
  createSession: async (data: CreateSessionData): Promise<CreateSessionResponse> => {
    const response = await fetch('/api/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create game session')
    }

    return response.json()
  },

  getSession: async (sessionId: string): Promise<GameSession> => {
    const response = await fetch(`/api/session/${sessionId}`)
    
    if (!response.ok) {
      throw new Error('Failed to get game session')
    }
    
    return response.json()
  }
}
