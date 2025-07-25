// Mock for next/router (Pages Router)
import { jest } from '@jest/globals';

const mockRouter = {
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  back: jest.fn(),
  reload: jest.fn(),
  ready: true,
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  basePath: '',
  locale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  beforeHistoryChange: jest.fn(),
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
  withRouter: (Component: React.ComponentType) => Component,
}));

export { mockRouter };
