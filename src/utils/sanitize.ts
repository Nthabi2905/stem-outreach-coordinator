import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Only allows safe HTML tags for formatting
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitizes plain text by escaping HTML special characters
 * Use this for displaying user input as text
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validates and sanitizes file input
 */
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ],
  ALLOWED_EXTENSIONS: ['.xlsx', '.xls', '.csv']
} as const;

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File is too large. Maximum size: ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }

  if (!FILE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.' 
    };
  }

  const extension = ('.' + file.name.split('.').pop()?.toLowerCase()) as any;
  if (!FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    return { 
      valid: false, 
      error: 'Invalid file extension. Only .xlsx, .xls, and .csv files are allowed.' 
    };
  }

  return { valid: true };
}
