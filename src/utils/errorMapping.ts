/**
 * Maps internal error messages to user-friendly messages
 * This prevents exposing internal implementation details to users
 */
export function getPublicErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authorization')) {
      return 'You must be logged in to perform this action.';
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('admin')) {
      return 'You do not have permission to perform this action.';
    }
    
    // Organization errors
    if (message.includes('organization')) {
      return 'Organization access required. Please contact your administrator.';
    }
    
    // AI/OpenAI errors
    if (message.includes('openai') || message.includes('ai')) {
      return 'AI service temporarily unavailable. Please try again.';
    }
    
    // Rate limiting
    if (message.includes('rate limit')) {
      return 'Too many requests. Please try again in a moment.';
    }
    
    // Validation errors
    if (message.includes('invalid') || message.includes('validation')) {
      return 'The information provided is invalid. Please check your input.';
    }
    
    // Network/API errors
    if (message.includes('fetch') || message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
  }
  
  // Generic fallback
  return 'An unexpected error occurred. Please try again or contact support.';
}
