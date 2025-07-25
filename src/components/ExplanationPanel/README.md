# ExplanationPanel Component

A comprehensive React component for displaying rich AI-generated explanations in trivia and quiz applications. This component provides an enhanced learning experience with visual feedback, multiple display variants, and detailed explanation content.

## Features

- **Rich AI Content Display**: Shows detailed explanations with reasoning and additional information
- **Multiple Variants**: Compact, default, and detailed display modes
- **Visual Feedback**: Different styling for correct vs incorrect answers
- **Answer Summary**: Compares user's answer with the correct answer
- **Encouragement Messages**: Positive reinforcement for learning
- **Flexible Content**: Handles both simple strings and structured explanation objects
- **Animations**: Smooth entry animations and visual transitions
- **Responsive Design**: Works beautifully on all screen sizes
- **Dark Mode**: Full support for light and dark themes

## Props

### ExplanationPanelProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isCorrect` | `boolean` | ✅ | Whether the user's answer was correct |
| `correctAnswer` | `string` | ✅ | The correct answer text |
| `userAnswer` | `string` | ❌ | The user's selected answer |
| `explanation` | `ExplanationData \| string` | ❌ | The explanation content (rich object or simple string) |
| `pointsEarned` | `number` | ❌ | Points earned for the answer (default: 0) |
| `variant` | `'default' \| 'compact' \| 'detailed'` | ❌ | Display variant (default: 'default') |
| `animateOnMount` | `boolean` | ❌ | Whether to animate when mounting (default: true) |
| `showScoreInfo` | `boolean` | ❌ | Whether to show score information (default: true) |
| `className` | `string` | ❌ | Additional CSS classes |

### ExplanationData

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `explanation` | `string` | ✅ | Main explanation text |
| `reasoning` | `string` | ✅ | Detailed reasoning behind the answer |
| `additionalInfo` | `string` | ❌ | Fun facts or additional context |

## Usage Examples

### Basic Usage

```tsx
import ExplanationPanel from '@/components/ExplanationPanel';

const BasicExample = () => {
  return (
    <ExplanationPanel
      isCorrect={true}
      correctAnswer="C. Paris"
      userAnswer="C. Paris"
      explanation="Paris is the capital of France."
      pointsEarned={10}
    />
  );
};
```

### Rich AI-Generated Explanation

```tsx
import ExplanationPanel, { ExplanationData } from '@/components/ExplanationPanel';

const AIExample = () => {
  const richExplanation: ExplanationData = {
    explanation: 'Paris is indeed the capital and largest city of France.',
    reasoning: 'Paris has been the capital of France since the late 10th century and serves as the country\'s political, economic, and cultural center.',
    additionalInfo: 'Paris is often called the "City of Light" and is home to famous landmarks like the Eiffel Tower and the Louvre Museum.'
  };

  return (
    <ExplanationPanel
      isCorrect={false}
      correctAnswer="C. Paris"
      userAnswer="A. London"
      explanation={richExplanation}
      pointsEarned={0}
      variant="detailed"
    />
  );
};
```

### Compact Variant

```tsx
<ExplanationPanel
  isCorrect={true}
  correctAnswer="B. JavaScript"
  explanation="JavaScript is a programming language for web development."
  variant="compact"
  showScoreInfo={false}
/>
```

### With Game Integration

```tsx
import { useSubmitAnswer } from '@/lib/query';
import ExplanationPanel from '@/components/ExplanationPanel';

const GameComponent = () => {
  const submitAnswerMutation = useSubmitAnswer();
  
  return (
    <div>
      {/* Question and answer selection UI */}
      
      {submitAnswerMutation.data && (
        <ExplanationPanel
          isCorrect={submitAnswerMutation.data.isCorrect}
          correctAnswer={submitAnswerMutation.data.correctAnswer}
          userAnswer={selectedAnswer}
          explanation={submitAnswerMutation.data.explanation}
          pointsEarned={submitAnswerMutation.data.pointsEarned}
          variant="default"
        />
      )}
    </div>
  );
};
```

## Visual Variants

### Compact Variant
- Minimal space usage
- Basic explanation display
- Suitable for quick feedback
- No detailed reasoning or additional info

### Default Variant
- Balanced information display
- Shows main explanation and answer summary
- Good for most use cases
- Includes score information

### Detailed Variant
- Comprehensive information display
- Shows all explanation sections
- Includes reasoning and additional info
- Features encouragement messages
- Best for learning-focused applications

## Visual States

### Correct Answer State
- Green color scheme
- Checkmark icon
- Congratulatory messaging
- Points earned display

### Incorrect Answer State
- Red color scheme
- X mark icon
- Answer comparison section
- Encouraging messaging for learning

## Content Handling

The component intelligently handles different explanation formats:

1. **Rich ExplanationData Object**: Displays all sections (explanation, reasoning, additional info)
2. **JSON String**: Attempts to parse and display as rich content
3. **Simple String**: Displays as basic explanation text
4. **No Explanation**: Gracefully handles missing explanation data

## Styling

The component uses Tailwind CSS with:

- **Colors**: Semantic green/red color schemes for correct/incorrect states
- **Typography**: Responsive text sizing and proper hierarchy
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle depth with shadow effects
- **Borders**: Rounded corners and colored borders for visual separation
- **Animations**: Smooth slide-in and fade animations
- **Dark Mode**: Complete dark mode support with appropriate color variants

## Integration with AI Services

The component is designed to work seamlessly with OpenAI-generated explanations:

```typescript
// The AI service returns structured explanation data
const explanationResult = await openAIService.generateExplanation({
  question: 'What is the capital of France?',
  correctAnswer: 'C. Paris',
  userAnswer: 'A. London',
  isCorrect: false
});

// Use directly with ExplanationPanel
<ExplanationPanel
  isCorrect={false}
  correctAnswer="C. Paris"
  userAnswer="A. London"
  explanation={explanationResult.explanation} // Rich ExplanationData object
  pointsEarned={0}
  variant="detailed"
/>
```

## Testing

The component includes comprehensive tests covering:

- All variants (compact, default, detailed)
- Correct and incorrect answer states
- Rich and simple explanation handling
- JSON parsing and error handling
- Visual state changes and styling
- Accessibility features
- Animation controls

Run tests with:
```bash
npm test ExplanationPanel.test.tsx
```

## Accessibility

- **Semantic HTML**: Proper heading hierarchy and content structure
- **Color Contrast**: High contrast colors for readability
- **Screen Readers**: Descriptive text and proper ARIA usage
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Alternative Text**: Icons include appropriate alternative meanings through context

## Demo

Visit `/demo/explanation-panel` to see the component in action with interactive examples showcasing all variants and states.
