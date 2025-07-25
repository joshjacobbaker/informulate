// Router Testing Patterns and Examples
// File: src/jestTestMocks/routerTestingPatterns.md

## Next.js Router Testing with Jest

### Setup (Already Done in jest.setup.js)
```javascript
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
}));
```

### Testing Pattern 1: Component with Navigation
```tsx
import { useRouter } from 'next/navigation';

const NavigationComponent = () => {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.push('/dashboard');
  };
  
  return <button onClick={handleNavigate}>Go to Dashboard</button>;
};

// Test
it('should navigate when button is clicked', () => {
  const mockRouter = jest.mocked(useRouter)();
  
  render(<NavigationComponent />);
  fireEvent.click(screen.getByText('Go to Dashboard'));
  
  expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
});
```

### Testing Pattern 2: Component with Search Params
```tsx
import { useSearchParams } from 'next/navigation';

const SearchComponent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  return <div>Search: {query}</div>;
};

// Test with custom search params
it('should display search query', () => {
  // Mock search params for this specific test
  const mockSearchParams = {
    get: jest.fn((key) => key === 'q' ? 'test-query' : null),
  };
  
  jest.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);
  
  render(<SearchComponent />);
  expect(screen.getByText('Search: test-query')).toBeInTheDocument();
});
```

### Testing Pattern 3: Component with Pathname
```tsx
import { usePathname } from 'next/navigation';

const BreadcrumbComponent = () => {
  const pathname = usePathname();
  
  return <nav>Current path: {pathname}</nav>;
};

// Test
it('should display current pathname', () => {
  jest.mocked(usePathname).mockReturnValue('/dashboard/settings');
  
  render(<BreadcrumbComponent />);
  expect(screen.getByText('Current path: /dashboard/settings')).toBeInTheDocument();
});
```

### Testing Pattern 4: Testing Navigation Side Effects
```tsx
const GameComponent = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  
  const handleGameComplete = () => {
    // Navigate to results page
    router.push(`/results/${sessionId}`);
    
    // Also prefetch the next game
    router.prefetch('/game/new');
  };
  
  return <button onClick={handleGameComplete}>Complete Game</button>;
};

// Test
it('should navigate to results and prefetch next game', () => {
  const mockRouter = jest.mocked(useRouter)();
  
  render(<GameComponent sessionId="123" />);
  fireEvent.click(screen.getByText('Complete Game'));
  
  expect(mockRouter.push).toHaveBeenCalledWith('/results/123');
  expect(mockRouter.prefetch).toHaveBeenCalledWith('/game/new');
});
```

### Testing Pattern 5: Conditional Navigation
```tsx
const ConditionalNav = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };
  
  return <button onClick={handleClick}>Continue</button>;
};

// Test both conditions
it('should navigate to dashboard when logged in', () => {
  const mockRouter = jest.mocked(useRouter)();
  
  render(<ConditionalNav isLoggedIn={true} />);
  fireEvent.click(screen.getByText('Continue'));
  
  expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
});

it('should navigate to login when not logged in', () => {
  const mockRouter = jest.mocked(useRouter)();
  
  render(<ConditionalNav isLoggedIn={false} />);
  fireEvent.click(screen.getByText('Continue'));
  
  expect(mockRouter.push).toHaveBeenCalledWith('/login');
});
```

### Common Test Utilities
```tsx
// Helper function to reset router mocks
const resetRouterMocks = () => {
  const mockRouter = jest.mocked(useRouter)();
  Object.values(mockRouter).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockClear();
    }
  });
};

// Helper to mock specific router behavior
const mockRouterPush = (implementation?: jest.Mock) => {
  const mockRouter = jest.mocked(useRouter)();
  if (implementation) {
    mockRouter.push.mockImplementation(implementation);
  }
  return mockRouter;
};

// Usage in tests
beforeEach(() => {
  resetRouterMocks();
});

it('should handle navigation errors', () => {
  const mockRouter = mockRouterPush(
    jest.fn().mockRejectedValue(new Error('Navigation failed'))
  );
  
  // Test error handling...
});
```
