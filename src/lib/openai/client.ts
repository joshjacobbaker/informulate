import OpenAI from 'openai'
import { config } from '../config'
import type { OpenAIConfig } from './types'

// Default configuration
const DEFAULT_CONFIG: Partial<OpenAIConfig> = {
  model: 'gpt-4o-mini', // Cost-effective model for trivia generation
  maxTokens: 1000,
  temperature: 0.8, // Some creativity but still consistent
  timeout: 30000, // 30 seconds
}

class OpenAIClient {
  private client: OpenAI
  private config: OpenAIConfig

  constructor(customConfig?: Partial<OpenAIConfig>) {
    this.config = {
      apiKey: config.openai.apiKey,
      ...DEFAULT_CONFIG,
      ...customConfig,
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
    })
  }

  // Get the OpenAI client instance
  getClient(): OpenAI {
    return this.client
  }

  // Get current configuration
  getConfig(): OpenAIConfig {
    return { ...this.config }
  }

  // Update configuration
  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Recreate client if API key changed
    if (newConfig.apiKey) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        timeout: this.config.timeout,
      })
    }
  }

  // Test the connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.models.list()
      return response.data.length > 0
    } catch (error) {
      console.error('OpenAI connection test failed:', error)
      return false
    }
  }

  // Make a completion request with error handling
  async createCompletion(prompt: string, options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }): Promise<string | null> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.config.model!,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
      })

      return response.choices[0]?.message?.content || null
    } catch (error) {
      console.error('OpenAI completion failed:', error)
      throw error
    }
  }
}

// Export singleton instance
export const openAIClient = new OpenAIClient()

// Export the class for custom instances
export { OpenAIClient }
