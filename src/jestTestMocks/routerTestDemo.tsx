// Example: Testing a component that uses Next.js router
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';

// Mock component for demonstration
const NavigationComponent = () => {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.push('/game/123');
  };
  
  const handleReplace = () => {
    router.replace('/dashboard');
  };
  
  return (
    <div>
      <button onClick={handleNavigate}>Go to Game</button>
      <button onClick={handleReplace}>Go to Dashboard</button>
    </div>
  );
};

describe('NavigationComponent', () => {
  it('should call router.push when navigating to game', () => {
    // Get the mocked router
    const mockRouter = jest.mocked(useRouter());
    
    render(<NavigationComponent />);
    
    fireEvent.click(screen.getByText('Go to Game'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/game/123');
  });
  
  it('should call router.replace when going to dashboard', () => {
    const mockRouter = jest.mocked(useRouter());
    
    render(<NavigationComponent />);
    
    fireEvent.click(screen.getByText('Go to Dashboard'));
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });
});
