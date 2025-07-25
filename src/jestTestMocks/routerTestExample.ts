// Example test file showing how to use the router mocks
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockRouter, updateMockRouter } from '@/jestTestMocks/nextNavigationMock';

// Import your component that uses router
// import MyComponent from './MyComponent';

describe('Component with Next.js Router', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should navigate when button is clicked', () => {
    // Render component
    // render(<MyComponent />);
    
    // Simulate user interaction
    // fireEvent.click(screen.getByText('Navigate'));
    
    // Assert router.push was called
    expect(mockRouter.push).toHaveBeenCalledWith('/expected-route');
  });

  it('should handle router replace', () => {
    // Update mock router for this specific test
    updateMockRouter({
      pathname: '/current-page',
      query: { id: '123' },
    });

    // render(<MyComponent />);
    
    // fireEvent.click(screen.getByText('Replace'));
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/new-route');
  });

  it('should handle search params', () => {
    // You can also test search params
    // const { updateMockSearchParams } = require('@/jestTestMocks/nextNavigationMock');
    // updateMockSearchParams({ search: 'test', filter: 'active' });
    
    // render(<MyComponent />);
    
    // Your component should now have access to search params
    // expect(screen.getByText('Search: test')).toBeInTheDocument();
  });

  it('should handle navigation errors', () => {
    // Mock router.push to reject
    (mockRouter.push as jest.Mock).mockRejectedValueOnce(new Error('Navigation failed'));
    
    // render(<MyComponent />);
    // fireEvent.click(screen.getByText('Navigate'));
    
    // Test error handling in your component
  });
});
