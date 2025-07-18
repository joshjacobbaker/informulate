// Main exports for OpenAI integration
export * from './types'
export * from './client'
export * from './service'
export * from './prompts'
export * from './utils'

// Re-export commonly used items for convenience
export { openAIClient } from './client'
export { openAIService } from './service'
export { PromptTemplates } from './prompts'

// Default export for the service (most commonly used)
export { openAIService as default } from './service'
