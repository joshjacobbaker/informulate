// How to add router mocking to your existing tests
import { jest } from '@jest/globals';

// Simple router mock - add this to your jest.setup.js or at the top of test files
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
    };
  },
  usePathname() {
    return '/';
  },
  useParams() {
    return {};
  },
}));

// If you need to test router interactions, you can access the mock like this:
export const getMockRouter = () => {
  const mockUseRouter = (jest.requireMock('next/navigation') as typeof import('next/navigation')).useRouter;
  return mockUseRouter();
};
