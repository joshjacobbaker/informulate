// Game state management exports
export * from './gameStore/gameStore';
export * from './gameFlow/gameFlow';

// Re-export main hooks for convenience
export { useGameFlow } from './gameFlow/gameFlow';
export { 
  useGameStore, 
  useGameState, 
  useQuestionState, 
  useCurrentQuestion, 
  useGameStats, 
  useGameConfig, 
  useLastResult, 
  useGameError 
} from './gameStore/gameStore';
