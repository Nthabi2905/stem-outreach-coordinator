import { describe, it, expect } from 'vitest';
import { validatePassword, getPasswordStrength } from '../passwordValidation';

describe('Security - passwordValidation.ts', () => {
  describe('validatePassword', () => {
    it('should accept strong password', () => {
      const result = validatePassword('MyStr0ng!Pass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 12 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('nostrongpass123!');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('NOSTRONGPASS123!');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
    });

    it('should reject password without number', () => {
      const result = validatePassword('NoNumbersHere!');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });

    it('should reject password without special character', () => {
      const result = validatePassword('NoSpecialChar123');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('special character'))).toBe(true);
    });

    it('should handle multiple validation failures', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should accept passwords with all required character types', () => {
      const passwords = [
        'MyP@ssw0rd123',
        'S3cur3!Password',
        'T3st!ngPass123',
        'C0mpl3x#Passw0rd'
      ];
      
      passwords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('getPasswordStrength', () => {
    it('should return strong for valid password', () => {
      const strength = getPasswordStrength('MyStr0ng!Pass123');
      expect(strength).toBe('strong');
    });

    it('should return weak for invalid password', () => {
      const strength = getPasswordStrength('weak');
      expect(strength).toBe('weak');
    });

    it('should return medium for partially valid password', () => {
      const strength = getPasswordStrength('NoNumbers!');
      expect(strength).toBe('medium');
    });
  });
});
