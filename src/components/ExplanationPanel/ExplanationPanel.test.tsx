import React from 'react';
import { render, screen } from '@testing-library/react';
import ExplanationPanel, { ExplanationData } from './ExplanationPanel';

const mockExplanationData: ExplanationData = {
  explanation: 'This is the main explanation for the answer.',
  reasoning: 'This is the detailed reasoning behind the correct answer.',
  additionalInfo: 'Here is some additional fun fact information.',
};

const mockSimpleExplanation = 'This is a simple string explanation.';

describe('ExplanationPanel', () => {
  const defaultProps = {
    isCorrect: true,
    correctAnswer: 'C. Paris',
    userAnswer: 'C. Paris',
    pointsEarned: 10,
  };

  it('renders correct answer state', () => {
    render(<ExplanationPanel {...defaultProps} explanation={mockExplanationData} />);
    
    expect(screen.getByText('🎉 Excellent!')).toBeInTheDocument();
    expect(screen.getByText('+10 points earned!')).toBeInTheDocument();
    expect(screen.getByText(mockExplanationData.explanation)).toBeInTheDocument();
  });

  it('renders incorrect answer state', () => {
    render(
      <ExplanationPanel 
        {...defaultProps} 
        isCorrect={false}
        userAnswer="A. London"
        explanation={mockExplanationData}
      />
    );
    
    expect(screen.getByText('❌ Not Quite Right')).toBeInTheDocument();
    expect(screen.getByText('The correct answer was C. Paris')).toBeInTheDocument();
    expect(screen.getByText(/Your answer:/)).toBeInTheDocument();
    expect(screen.getByText('A. London')).toBeInTheDocument();
    expect(screen.getByText(/Correct answer:/)).toBeInTheDocument();
    expect(screen.getByText('C. Paris')).toBeInTheDocument();
  });

  it('handles simple string explanation', () => {
    render(
      <ExplanationPanel 
        {...defaultProps} 
        explanation={mockSimpleExplanation}
      />
    );
    
    expect(screen.getByText(mockSimpleExplanation)).toBeInTheDocument();
  });

  it('handles JSON string explanation', () => {
    const jsonExplanation = JSON.stringify(mockExplanationData);
    
    render(
      <ExplanationPanel 
        {...defaultProps} 
        explanation={jsonExplanation}
      />
    );
    
    expect(screen.getByText(mockExplanationData.explanation)).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(
      <ExplanationPanel 
        {...defaultProps} 
        variant="compact"
        explanation={mockExplanationData}
      />
    );
    
    expect(screen.getByText('🎉 Correct!')).toBeInTheDocument();
    expect(screen.getByText(mockExplanationData.explanation)).toBeInTheDocument();
    // Should not show detailed reasoning in compact mode
    expect(screen.queryByText('Why This Answer')).not.toBeInTheDocument();
  });

  it('renders detailed variant with all sections', () => {
    render(
      <ExplanationPanel 
        {...defaultProps} 
        variant="detailed"
        explanation={mockExplanationData}
      />
    );
    
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.getByText('Why This Answer')).toBeInTheDocument();
    expect(screen.getByText('Did You Know?')).toBeInTheDocument();
    expect(screen.getByText(mockExplanationData.explanation)).toBeInTheDocument();
    expect(screen.getByText(mockExplanationData.reasoning)).toBeInTheDocument();
    expect(screen.getByText(mockExplanationData.additionalInfo!)).toBeInTheDocument();
    expect(screen.getByText('Great job! Keep up the excellent work! 🌟')).toBeInTheDocument();
  });

  it('shows encouragement message for incorrect answers in detailed mode', () => {
    render(
      <ExplanationPanel 
        {...defaultProps} 
        isCorrect={false}
        variant="detailed"
        explanation={mockExplanationData}
      />
    );
    
    expect(screen.getByText("Every mistake is a learning opportunity. You've got this! 💪")).toBeInTheDocument();
  });

  it('handles missing explanation data gracefully', () => {
    render(<ExplanationPanel {...defaultProps} />);
    
    expect(screen.getByText('🎉 Excellent!')).toBeInTheDocument();
    expect(screen.getByText('+10 points earned!')).toBeInTheDocument();
    // Should not crash without explanation
    expect(screen.queryByText('Explanation')).not.toBeInTheDocument();
  });

  it('hides score info when showScoreInfo is false', () => {
    render(
      <ExplanationPanel 
        {...defaultProps} 
        showScoreInfo={false}
        explanation={mockExplanationData}
      />
    );
    
    expect(screen.queryByText('+10 points earned!')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ExplanationPanel 
        {...defaultProps} 
        className="custom-class"
        explanation={mockExplanationData}
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows correct icons for correct and incorrect answers', () => {
    const { container, rerender } = render(
      <ExplanationPanel {...defaultProps} explanation={mockExplanationData} />
    );
    
    // Check for correct answer icon (CheckCircle) - look for the lucide class
    expect(container.querySelector('.lucide-circle-check-big')).toBeInTheDocument();
    
    rerender(
      <ExplanationPanel 
        {...defaultProps} 
        isCorrect={false}
        explanation={mockExplanationData}
      />
    );
    
    // Check for incorrect answer icon (XCircle) - look for the lucide class
    expect(container.querySelector('.lucide-circle-x')).toBeInTheDocument();
  });

  it('handles explanation data with missing optional fields', () => {
    const partialExplanation: ExplanationData = {
      explanation: 'Main explanation only',
      reasoning: 'Basic reasoning',
      // additionalInfo is missing
    };
    
    render(
      <ExplanationPanel 
        {...defaultProps} 
        variant="detailed"
        explanation={partialExplanation}
      />
    );
    
    expect(screen.getByText('Main explanation only')).toBeInTheDocument();
    expect(screen.getByText('Basic reasoning')).toBeInTheDocument();
    expect(screen.queryByText('Did You Know?')).not.toBeInTheDocument();
  });

  it('handles malformed JSON gracefully', () => {
    const malformedJson = '{"explanation": "test", "reasoning":}'; // Invalid JSON
    
    render(
      <ExplanationPanel 
        {...defaultProps} 
        explanation={malformedJson}
      />
    );
    
    // Should treat as simple string explanation
    expect(screen.getByText(malformedJson)).toBeInTheDocument();
  });

  it('renders without animation when animateOnMount is false', () => {
    const { container } = render(
      <ExplanationPanel 
        {...defaultProps} 
        animateOnMount={false}
        explanation={mockExplanationData}
      />
    );
    
    expect(container.firstChild).not.toHaveClass('animate-in');
  });

  it('shows answer summary only for incorrect answers', () => {
    const { rerender } = render(
      <ExplanationPanel 
        {...defaultProps} 
        isCorrect={true}
        userAnswer="C. Paris"
        explanation={mockExplanationData}
      />
    );
    
    expect(screen.queryByText('Answer Summary:')).not.toBeInTheDocument();
    
    rerender(
      <ExplanationPanel 
        {...defaultProps} 
        isCorrect={false}
        userAnswer="A. London"
        explanation={mockExplanationData}
      />
    );
    
    expect(screen.getByText('Answer Summary:')).toBeInTheDocument();
  });
});
