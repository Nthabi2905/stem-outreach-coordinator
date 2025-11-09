/**
 * Password validation utility
 * Enforces strong password requirements
 */

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&* etc.)");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Returns password strength level
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  const validation = validatePassword(password);
  
  if (validation.errors.length === 0) return 'strong';
  if (validation.errors.length <= 2) return 'medium';
  return 'weak';
}
