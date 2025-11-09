import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizeText, validateFile, FILE_UPLOAD_CONFIG } from '../sanitize';

describe('Security - sanitize.ts', () => {
  describe('sanitizeHTML', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const output = sanitizeHTML(input);
      expect(output).toContain('<p>');
      expect(output).toContain('<strong>');
    });

    it('should remove script tags (XSS prevention)', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
    });

    it('should remove onclick handlers (XSS prevention)', () => {
      const input = '<p onclick="alert(\'XSS\')">Click me</p>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('onclick');
      expect(output).not.toContain('alert');
    });

    it('should remove iframe tags', () => {
      const input = '<p>Test</p><iframe src="evil.com"></iframe>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('<iframe>');
      expect(output).not.toContain('evil.com');
    });

    it('should remove img tags with onerror', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('onerror');
    });

    it('should handle empty input', () => {
      const output = sanitizeHTML('');
      expect(output).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const output = sanitizeText(input);
      expect(output).toContain('&lt;script&gt;');
      expect(output).not.toContain('<script>');
    });

    it('should escape quotes', () => {
      const input = 'He said "hello"';
      const output = sanitizeText(input);
      expect(output).toContain('&quot;');
    });

    it('should escape apostrophes', () => {
      const input = "It's a test";
      const output = sanitizeText(input);
      expect(output).toContain('&#x27;');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const output = sanitizeText(input);
      expect(output).toBe('test');
    });
  });

  describe('validateFile', () => {
    it('should accept valid Excel file', () => {
      const file = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept valid CSV file', () => {
      const file = new File(['test'], 'test.csv', {
        type: 'text/csv'
      });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject file that is too large', () => {
      const largeContent = new Array(FILE_UPLOAD_CONFIG.MAX_FILE_SIZE + 1000).fill('a').join('');
      const file = new File([largeContent], 'large.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'test.exe', {
        type: 'application/x-msdownload'
      });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject invalid file extension', () => {
      const file = new File(['test'], 'test.pdf', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file extension');
    });

    it('should handle files at exact size limit', () => {
      const content = new Array(FILE_UPLOAD_CONFIG.MAX_FILE_SIZE).fill('a').join('');
      const file = new File([content], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });
});
