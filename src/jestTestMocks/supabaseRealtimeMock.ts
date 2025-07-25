// Mock for Supabase realtime functionality to avoid ES module issues in Jest
export const mockSupabaseRealtime = {
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(() => ({
        unsubscribe: jest.fn()
      }))
    })),
    send: jest.fn(),
    unsubscribe: jest.fn()
  })),
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }))
};

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseRealtime
}));

// Mock the SupabaseService
jest.mock('@/lib/supabase/service', () => ({
  SupabaseService: jest.fn().mockImplementation(() => ({
    subscribeToQuestions: jest.fn(() => ({ unsubscribe: jest.fn() })),
    subscribeToAnswers: jest.fn(() => ({ unsubscribe: jest.fn() })),
    subscribeToQuestionHistory: jest.fn(() => ({ unsubscribe: jest.fn() })),
    subscribeToQuestionBroadcasts: jest.fn(() => ({ unsubscribe: jest.fn() })),
    subscribeToAnswerBroadcasts: jest.fn(() => ({ unsubscribe: jest.fn() }))
  }))
}));

// Mock the realtime hooks
jest.mock('@/lib/query/questionRealtime', () => ({
  useQuestionRealtime: jest.fn(() => ({ isConnected: true })),
  useQuestionNotifications: jest.fn(() => ({}))
}));
