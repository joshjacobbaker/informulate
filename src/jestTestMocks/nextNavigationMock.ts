// Advanced mock for next/navigation with configurable values
import { jest } from '@jest/globals';

// Create mock router object
const createMockRouter = (overrides: Record<string, unknown> = {}) => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  ...overrides,
});

// Create mock search params
const createMockSearchParams = (params: Record<string, string> = {}) => ({
  get: jest.fn((key: string) => params[key] || null),
  getAll: jest.fn((key: string) => params[key] ? [params[key]] : []),
  has: jest.fn((key: string) => key in params),
  keys: jest.fn(() => Object.keys(params)),
  values: jest.fn(() => Object.values(params)),
  entries: jest.fn(() => Object.entries(params)),
  forEach: jest.fn(),
  toString: jest.fn(() => new URLSearchParams(params).toString()),
});

// Export mock functions for use in tests
export const mockRouter = createMockRouter();
export const mockSearchParams = createMockSearchParams();
export const mockPathname = '/';

// Mock the entire next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
  useParams: () => ({}),
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Utility function to update mock values in tests
export const updateMockRouter = (overrides: Record<string, unknown>) => {
  Object.assign(mockRouter, overrides);
};

export const updateMockSearchParams = (params: Record<string, string>) => {
  const newSearchParams = createMockSearchParams(params);
  Object.assign(mockSearchParams, newSearchParams);
};
