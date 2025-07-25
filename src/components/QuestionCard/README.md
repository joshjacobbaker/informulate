# QuestionCard Component

A comprehensive, interactive React component for displaying trivia questions with multiple choice answers. This component is designed for the AI Trivia Arena application and provides a polished user experience with visual feedback, timing features, and accessibility support.

## Features

- **Interactive Multiple Choice**: Click-to-select answer options with visual feedback
- **Timer Integration**: Built-in countdown timer with color-coded urgency indicators
- **Visual States**: Different visual states for selected, correct, and incorrect answers
- **Difficulty Indicators**: Color-coded difficulty badges (easy/medium/hard)
- **Category Display**: Shows question category with relevant icons
- **Loading State**: Skeleton loading animation while questions are being fetched
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Dark Mode Support**: Full support for light and dark themes
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Props

### QuestionCardProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `question` | `QuestionData` | ✅ | The question data object containing question text, options, correct answer, etc. |
| `selectedAnswer` | `string` | ❌ | The currently selected answer (A, B, C, or D) |
| `onAnswerSelect` | `(answer: string) => void` | ✅ | Callback function called when user selects an answer |
| `timeRemaining` | `number` | ❌ | Seconds remaining for the question (shows timer if provided) |
| `isSubmitted` | `boolean` | ✅ | Whether the answer has been submitted (disables interaction) |
| `isLoading` | `boolean` | ❌ | Shows loading skeleton instead of question content |
| `showCorrectAnswer` | `boolean` | ❌ | Whether to highlight the correct answer (for review mode) |

### QuestionData

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier for the question |
| `question` | `string` | ✅ | The question text to display |
| `options` | `string[]` | ✅ | Array of answer options (with or without A./B./C./D. prefixes) |
| `correctAnswer` | `string` | ✅ | The correct answer letter (A, B, C, or D) |
| `category` | `string` | ✅ | Question category (e.g., "Geography", "Science") |
| `difficulty` | `'easy' \| 'medium' \| 'hard'` | ✅ | Question difficulty level |

## Usage Examples

### Basic Usage

```tsx
import QuestionCard from '@/components/QuestionCard';

const ExampleComponent = () => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questionData = {
    id: 'q1',
    question: 'What is the capital of France?',
    options: ['A. London', 'B. Berlin', 'C. Paris', 'D. Madrid'],
    correctAnswer: 'C',
    category: 'Geography',
    difficulty: 'easy' as const,
  };

  return (
    <QuestionCard
      question={questionData}
      selectedAnswer={selectedAnswer}
      onAnswerSelect={setSelectedAnswer}
      isSubmitted={isSubmitted}
    />
  );
};
```

### With Timer

```tsx
import QuestionCard from '@/components/QuestionCard';

const TimedQuestion = () => {
  const [timeRemaining, setTimeRemaining] = useState(60);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <QuestionCard
      question={questionData}
      selectedAnswer={selectedAnswer}
      onAnswerSelect={setSelectedAnswer}
      timeRemaining={timeRemaining}
      isSubmitted={isSubmitted}
    />
  );
};
```

### Loading State

```tsx
<QuestionCard
  question={emptyQuestion}
  onAnswerSelect={() => {}}
  isSubmitted={false}
  isLoading={true}
/>
```

### Review Mode (Show Correct Answer)

```tsx
<QuestionCard
  question={questionData}
  selectedAnswer="B" // User's incorrect answer
  onAnswerSelect={() => {}} // Disabled in review mode
  isSubmitted={true}
  showCorrectAnswer={true} // Highlights correct answer
/>
```

## Visual States

### Answer Option States

1. **Default**: Gray border, white background
2. **Hover**: Blue border, light blue background
3. **Selected**: Blue border, blue background, slightly scaled
4. **Correct (after submission)**: Green border, green background, checkmark icon
5. **Incorrect (after submission)**: Red border, red background, X icon
6. **Disabled (not selected)**: Gray background, muted text

### Timer States

- **Normal (>10s)**: Gray color
- **Warning (≤10s)**: Red color, bold font
- **Format**: MM:SS (e.g., "1:30", "0:05")

### Difficulty Colors

- **Easy**: Green badge
- **Medium**: Yellow badge  
- **Hard**: Red badge

## Integration with React Query

The QuestionCard component works seamlessly with the React Query hooks provided in the `questionQuery.ts` file:

```tsx
import { useGenerateQuestion, useSubmitAnswer } from '@/lib/query';
import QuestionCard from '@/components/QuestionCard';

const GameComponent = ({ sessionId }) => {
  const generateQuestion = useGenerateQuestion();
  const submitAnswer = useSubmitAnswer();
  
  // Generate a new question
  const handleNewQuestion = () => {
    generateQuestion.mutate({
      sessionId,
      difficulty: 'medium',
      category: 'Science',
    });
  };
  
  // Submit selected answer
  const handleSubmit = () => {
    submitAnswer.mutate({
      sessionId,
      questionId: question.id,
      selectedAnswer,
      timeTaken: 60 - timeRemaining,
    });
  };
  
  return (
    <QuestionCard
      question={generateQuestion.data?.question}
      selectedAnswer={selectedAnswer}
      onAnswerSelect={setSelectedAnswer}
      isSubmitted={submitAnswer.isPending}
      isLoading={generateQuestion.isPending}
    />
  );
};
```

## Styling

The component uses Tailwind CSS with the following design system:

- **Colors**: Blue/purple gradients for primary actions, semantic colors for states
- **Typography**: Responsive text sizing (2xl-3xl for questions, lg for options)
- **Spacing**: Consistent padding and margins using Tailwind's spacing scale
- **Shadows**: Subtle shadows for depth and visual hierarchy
- **Animations**: Smooth transitions and hover effects
- **Dark Mode**: Full support using Tailwind's dark mode utilities

## Testing

The component includes comprehensive tests covering:

- Rendering of question text and options
- Answer selection interaction
- Visual state changes (selected, submitted, correct/incorrect)
- Timer display and formatting
- Loading states
- Error scenarios
- Accessibility features

Run tests with:
```bash
npm test QuestionCard.test.tsx
```

## Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets WCAG AA standards for color contrast
- **Focus Indicators**: Clear focus states for keyboard users
- **Alternative Text**: Icons include proper alternative text
