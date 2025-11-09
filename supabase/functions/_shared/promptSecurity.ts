/**
 * Sanitizes user input to prevent AI prompt injection attacks
 * Removes common prompt injection patterns and limits length
 */
export function sanitizePromptInput(input: string): string {
  // Remove common prompt injection patterns
  const dangerousPatterns = [
    /ignore\s+(previous|all|prior)\s+instructions?/gi,
    /system\s*:/gi,
    /you\s+are\s+now/gi,
    /forget\s+(everything|all|previous)/gi,
    /new\s+instructions?/gi,
    /reveal\s+(api|key|password|secret|token)/gi,
    /disregard\s+(previous|all|prior)/gi,
    /override\s+instructions?/gi,
    /<\|.*?\|>/g, // Special tokens
    /\[INST\]/gi,
    /\[\/INST\]/gi,
  ];

  let clean = input.trim();
  
  // Remove dangerous patterns
  dangerousPatterns.forEach(pattern => {
    clean = clean.replace(pattern, '');
  });

  // Remove excessive whitespace
  clean = clean.replace(/\s+/g, ' ');

  // Limit length (200 characters for prompt inputs)
  return clean.substring(0, 200);
}

/**
 * Validates AI output to prevent malicious content injection
 */
export function sanitizeAIOutput(output: string): string {
  // Remove potential script tags or other dangerous HTML
  let clean = output
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers

  return clean.trim();
}
