import { describe, it, expect } from 'vitest';
import { validateEmail } from '../constants/validatros';

describe('validateEmail', () => {
  it('should validate correct email formats', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@example.com')).toBe(true);
    expect(validateEmail('user+tag@example.co.uk')).toBe(true);
    expect(validateEmail('user123@test-domain.com')).toBe(true);
    expect(validateEmail('user_name@example.org')).toBe(true);
  });

  it('should reject emails without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
    expect(validateEmail('user.example.com')).toBe(false);
  });

  it('should reject emails without domain', () => {
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user@domain')).toBe(false);
  });

  it('should reject emails without local part', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('should reject emails with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
    expect(validateEmail('user@ example.com')).toBe(false);
    expect(validateEmail('user@example .com')).toBe(false);
  });

  it('should reject empty strings', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('should reject emails without TLD', () => {
    expect(validateEmail('user@domain')).toBe(false);
  });

  it('should reject malformed emails', () => {
    expect(validateEmail('user@@example.com')).toBe(false);
    // Note: The current regex doesn't catch all edge cases like double dots
    // but it does catch most common invalid formats
  });
});
