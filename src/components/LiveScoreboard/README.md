# LiveScoreboard Component

A real-time scoreboard component that displays live game statistics and updates instantly using Supabase Realtime subscriptions.

## Overview

The `LiveScoreboard` component provides a comprehensive view of the player's game progress, including score, accuracy, streaks, and other relevant statistics. It automatically subscribes to real-time updates from the game session and updates the UI instantly when scores change.

## Features

- **Real-time Updates**: Automatically subscribes to Supabase Realtime updates for instant score changes
- **Comprehensive Statistics**: Displays score, correct/total answers, accuracy percentage, current and max streaks
- **Connection Status**: Visual indicators for live connection status
- **Responsive Design**: Full and compact views for different screen sizes and layouts
- **Streak Celebrations**: Special animations and notifications for achievement streaks
- **Performance Indicators**: Color-coded accuracy display based on performance levels
- **Loading States**: Smooth loading animations while data is being fetched
- **Error Handling**: Graceful handling of connection issues and missing data

## Usage

### Basic Usage

```tsx
import { LiveScoreboard } from '@/components';

function GamePage() {
  const sessionId = "your-game-session-id";
  
  return (
    <div>
      <LiveScoreboard sessionId={sessionId} />
    </div>
  );
}
```

### Compact View

For smaller spaces or inline display:

```tsx
<LiveScoreboard sessionId={sessionId} compact />
```

### With Custom Styling

```tsx
<LiveScoreboard 
  sessionId={sessionId} 
  compact 
  className="mb-4 shadow-lg" 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sessionId` | `string` | - | **Required.** The ID of the game session to track |
| `compact` | `boolean` | `false` | Whether to display the compact version of the scoreboard |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

## Component Structure

### Full View Layout

The full scoreboard includes:

- **Header**: Component title, player name, and connection status
- **Statistics Grid**: 6 key metrics displayed in cards:
  - Total Score (with number formatting)
  - Correct/Total Answers
  - Accuracy Percentage (color-coded)
  - Current Streak
  - Best Streak
  - Game Status (Active/Ended)
- **Progress Bar**: Visual representation of overall accuracy
- **Streak Celebrations**: Special notifications for streaks > 2

### Compact View Layout

The compact view shows:
- Score, correct/total answers, and current streak in a single row
- Connection status indicator
- Minimal space footprint for integration into game UI

## Real-time Integration

### Subscription Setup

The component automatically:
1. Loads initial session data on mount
2. Sets up a Supabase Realtime subscription for the specific session
3. Updates the UI instantly when the session data changes
4. Cleans up the subscription on unmount

### Data Flow

1. **Initial Load**: Fetches current session data via `SupabaseService.getGameSession()`
2. **Real-time Updates**: Subscribes to `game_sessions` table changes for the specific session
3. **State Updates**: Updates local component state when real-time data is received
4. **UI Updates**: React re-renders the component with new data

## Statistics Calculated

- **Score**: Total points earned in the session
- **Correct Answers**: Number of questions answered correctly
- **Total Answers**: Total number of questions attempted
- **Accuracy**: Percentage of correct answers (correct/total * 100)
- **Current Streak**: Consecutive correct answers
- **Max Streak**: Highest streak achieved in the session

## Styling and Theming

### Color Coding

- **Accuracy Colors**:
  - Green (≥70%): High performance
  - Yellow (50-69%): Moderate performance  
  - Red (<50%): Needs improvement

- **Connection Status**:
  - Green pulsing dot: Connected and receiving live updates
  - Red dot: Offline or connection issues

### Responsive Design

- Desktop: Full grid layout with 3 columns
- Tablet: 2-column grid layout
- Mobile: Single column, stacked layout
- Compact view: Always single row regardless of screen size

## Integration Examples

### In Game UI

```tsx
function GameScreen({ sessionId }: { sessionId: string }) {
  return (
    <div className="game-layout">
      {/* Compact scoreboard at top */}
      <LiveScoreboard sessionId={sessionId} compact className="mb-4" />
      
      {/* Game question component */}
      <GameQuestion sessionId={sessionId} />
    </div>
  );
}
```

### In Dashboard

```tsx
function PlayerDashboard({ sessionId }: { sessionId: string }) {
  return (
    <div className="dashboard">
      <h1>Game Statistics</h1>
      
      {/* Full scoreboard with all details */}
      <LiveScoreboard sessionId={sessionId} className="mb-8" />
      
      {/* Other dashboard content */}
    </div>
  );
}
```

## Error Handling

The component handles several error scenarios:

- **No Session ID**: Shows "No game session data available"
- **Session Load Error**: Displays error message with fallback content
- **Connection Issues**: Shows offline status, continues to display last known data
- **Invalid Session**: Gracefully handles non-existent sessions

## Performance Considerations

- **Subscription Cleanup**: Automatically unsubscribes from Realtime updates on unmount
- **Debounced Updates**: Real-time updates are processed efficiently
- **Loading States**: Provides smooth loading experience while data loads
- **Memory Management**: Properly cleans up event listeners and subscriptions

## Dependencies

- `@supabase/supabase-js`: For real-time subscriptions
- `lucide-react`: For icons (Trophy, Target, Zap, etc.)
- `@/lib/supabase/service`: For database operations
- React hooks: `useState`, `useEffect` for state management

## Testing

Basic test structure is provided in `LiveScoreboard.test.tsx`. The component should be tested for:

- Rendering in different states (loading, error, success)
- Real-time update functionality
- Statistics calculations
- Compact vs full view modes
- Connection status indicators
- Error handling scenarios

Note: Full Jest tests are currently blocked by ES module compatibility issues with Supabase dependencies.

## Browser Compatibility

The component works in all modern browsers that support:
- ES6+ JavaScript features
- WebSocket connections (for Realtime functionality)
- CSS Grid and Flexbox (for responsive layout)

## Troubleshooting

### Common Issues

1. **No real-time updates**: Check Supabase Realtime is enabled in your project
2. **Connection always shows offline**: Verify network connectivity and Supabase credentials
3. **Statistics not updating**: Ensure the session ID is valid and the session exists in the database
4. **Styling issues**: Check for CSS conflicts with Tailwind classes

### Debug Mode

Enable debug logging by adding to the component:

```tsx
useEffect(() => {
  console.log('LiveScoreboard: Session data updated', stats);
}, [stats]);
```
