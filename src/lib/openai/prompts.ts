import type { 
  QuestionPromptOptions, 
  ExplanationPromptOptions,
  DifficultyLevel,
  TriviaCategory 
} from './types'

export class PromptTemplates {
  
  // Generate a trivia question prompt
  static generateQuestionPrompt(options: QuestionPromptOptions = {}): string {
    const {
      category,
      difficulty = 'medium',
      numOptions = 4,
      avoidTopics = []
    } = options

    let prompt = `Generate a ${difficulty} difficulty trivia question`
    
    if (category) {
      prompt += ` about ${category}`
    }
    
    prompt += ` with exactly ${numOptions} multiple choice options.`

    if (avoidTopics.length > 0) {
      prompt += ` Avoid topics related to: ${avoidTopics.join(', ')}.`
    }

    prompt += `

Requirements:
- The question should be clear and unambiguous
- Provide exactly ${numOptions} answer options labeled A, B, C, D${numOptions > 4 ? ', E' : ''}
- Only one answer should be correct
- Incorrect options should be plausible but clearly wrong
- Make the question engaging and educational

Format your response as valid JSON with this exact structure:
{
  "question": "Your question here?",
  "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"${numOptions > 4 ? ', "E. Fifth option"' : ''}],
  "correctAnswer": "A",
  "category": "${category || 'General Knowledge'}",
  "difficulty": "${difficulty}"
}

Do not include any text outside the JSON object.`

    return prompt
  }

  // Generate an explanation prompt
  static generateExplanationPrompt(
    question: string,
    correctAnswer: string,
    userAnswer: string,
    isCorrect: boolean,
    options: ExplanationPromptOptions = {}
  ): string {
    const {
      includeAdditionalInfo = true,
      tone = 'encouraging'
    } = options

    const toneMap = {
      educational: 'educational and informative',
      casual: 'casual and friendly',
      encouraging: 'encouraging and supportive'
    }

    let prompt = `Provide an explanation for this trivia question result:

Question: ${question}
Correct Answer: ${correctAnswer}
User's Answer: ${userAnswer}
Result: ${isCorrect ? 'Correct' : 'Incorrect'}

Create a ${toneMap[tone]} explanation that:`

    if (isCorrect) {
      prompt += `
- Congratulates the user
- Explains why the answer is correct
- Provides interesting context or background information`
    } else {
      prompt += `
- Gently explains why their answer was incorrect
- Explains why the correct answer is right
- Helps them learn from the mistake`
    }

    if (includeAdditionalInfo) {
      prompt += `
- Includes a fun fact or additional information related to the topic`
    }

    prompt += `

Format your response as valid JSON with this exact structure:
{
  "explanation": "Main explanation (2-3 sentences)",
  "reasoning": "Detailed reasoning about the correct answer",
  ${includeAdditionalInfo ? '"additionalInfo": "Fun fact or additional context"' : '"additionalInfo": null'}
}

Keep the explanation concise but informative. Use a ${tone} tone throughout.
Do not include any text outside the JSON object.`

    return prompt
  }

  // Generate a category-specific question prompt
  static generateCategoryQuestionPrompt(
    category: TriviaCategory,
    difficulty: DifficultyLevel = 'medium',
    subtopic?: string
  ): string {
    // Use the standard question prompt but with category-specific options
    return this.generateQuestionPrompt({
      category,
      difficulty,
      numOptions: 4,
      ...(subtopic && { avoidTopics: [] }) // Add subtopic handling if needed
    })
  }

  // Validate that a prompt response is valid JSON
  static validateJSONResponse(response: string): { isValid: boolean; error?: string } {
    try {
      JSON.parse(response.trim())
      return { isValid: true }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON format'
      }
    }
  }

  // Clean and parse JSON response
  static parseJSONResponse<T>(response: string): T | null {
    try {
      // Remove any markdown code blocks or extra whitespace
      const cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      return JSON.parse(cleaned) as T
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      return null
    }
  }
}
