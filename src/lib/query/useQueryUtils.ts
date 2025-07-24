import { useQueryClient } from '@tanstack/react-query'

export function useQueryUtils() {
  const queryClient = useQueryClient()

  const invalidateGameSessions = () => {
    return queryClient.invalidateQueries({
      queryKey: ['gameSessions']
    })
  }

  const clearGameSessionCache = () => {
    queryClient.removeQueries({
      queryKey: ['gameSessions']
    })
  }

  const prefetchGameSession = (sessionId: string) => {
    return queryClient.prefetchQuery({
      queryKey: ['gameSessions', 'session', sessionId],
      queryFn: async () => {
        const response = await fetch(`/api/session/${sessionId}`)
        if (!response.ok) throw new Error('Failed to fetch session')
        return response.json()
      },
    })
  }

  return {
    invalidateGameSessions,
    clearGameSessionCache,
    prefetchGameSession,
    queryClient,
  }
}
