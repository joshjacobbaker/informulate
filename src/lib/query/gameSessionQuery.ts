import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gameSessionService, CreateSessionData, GameSession } from '@/lib/services/gameSessionService'

// Query keys
export const gameSessionKeys = {
  all: ['gameSessions'] as const,
  session: (id: string) => [...gameSessionKeys.all, 'session', id] as const,
}

// Hook to create a new game session
export function useCreateGameSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSessionData) => gameSessionService.createSession(data),
    onSuccess: (data) => {
      // Store session in localStorage
      localStorage.setItem('gameSession', JSON.stringify(data.session))
      
      // Update query cache
      queryClient.setQueryData(
        gameSessionKeys.session(data.session.id),
        data.session
      )
    },
    onError: (error) => {
      console.error('Error creating game session:', error)
    },
  })
}

// Hook to get a game session by ID
export function useGameSession(sessionId: string | null) {
  return useQuery({
    queryKey: gameSessionKeys.session(sessionId || ''),
    queryFn: () => gameSessionService.getSession(sessionId!),
    enabled: !!sessionId,
  })
}

// Hook to get current session from localStorage
export function useCurrentGameSession() {
  const getCurrentSession = (): GameSession | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const storedSession = localStorage.getItem('gameSession')
      return storedSession ? JSON.parse(storedSession) : null
    } catch {
      return null
    }
  }

  const currentSession = getCurrentSession()
  
  return useGameSession(currentSession?.id || null)
}
