import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(() => null),
      getAll: jest.fn(() => []),
      has: jest.fn(() => false),
    };
  },
  usePathname() {
    return '/';
  },
  useParams() {
    return {};
  },
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Global Supabase realtime mocks to avoid ES module issues in Jest
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
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
  })
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