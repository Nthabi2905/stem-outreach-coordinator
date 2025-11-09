# Security Testing Documentation

## Overview

This directory contains comprehensive security tests for the STEM Outreach Platform. All tests are automated and run on every commit via GitHub Actions.

## Test Categories

### 1. Input Validation & Sanitization (`utils/__tests__/`)

**File**: `sanitize.test.ts`
- XSS prevention tests
- HTML sanitization
- Text escaping
- File upload validation
- File size limits
- MIME type validation

**File**: `passwordValidation.test.ts`
- Password strength validation
- Complexity requirements
- Length enforcement

### 2. AI Security (`security/promptInjection.test.ts`)

- Prompt injection prevention
- System instruction override attempts
- Secret extraction attempts
- Token overflow prevention
- AI output sanitization

### 3. Authentication & Authorization (`security/authentication.test.ts`)

- JWT validation
- Session management
- Role-based access control (RBAC)
- Organization membership checks
- Password security

### 4. Row Level Security (`security/rls-policies.test.ts`)

- RLS policy documentation
- Organization data isolation
- User-specific data access
- Admin privilege enforcement

### 5. Edge Function Security (`security/edge-functions.test.ts`)

- Authentication requirements
- Input validation
- CORS configuration
- Error handling
- Secrets management
- Rate limiting
- AI safety controls

## Running Tests

### Run all tests
```bash
npm test
```

### Run security tests only
```bash
npm run test:security
```

### Run with coverage
```bash
npm run test:coverage
```

### Watch mode (development)
```bash
npm run test:watch
```

## Test Commands

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:security": "vitest run src/test/security",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

## Security Test Checklist

### Before Every Release

- [ ] All security tests passing
- [ ] No vulnerabilities in `npm audit`
- [ ] RLS policies verified
- [ ] Edge function auth checks in place
- [ ] Input sanitization working
- [ ] Password policies enforced
- [ ] File upload limits enforced
- [ ] AI prompt injection prevention active
- [ ] Secrets not exposed in logs/errors

### Monthly Security Review

- [ ] Review failed authentication attempts
- [ ] Check edge function logs for anomalies
- [ ] Verify RLS policies still effective
- [ ] Update dependencies with security patches
- [ ] Run penetration test scenarios
- [ ] Review AI usage patterns

## CI/CD Integration

Security tests run automatically via GitHub Actions:

- **On every push** to main branch
- **On every pull request**
- **Daily at 2 AM** (scheduled)

View results in GitHub Actions tab.

## Coverage Requirements

Minimum coverage targets:
- **Security utilities**: 90%
- **Authentication logic**: 85%
- **Input validation**: 90%

## Adding New Security Tests

When adding new features:

1. **Identify security risks** - What could go wrong?
2. **Write failing tests** - Test the attack scenarios
3. **Implement protections** - Add security controls
4. **Verify tests pass** - Ensure protections work
5. **Document the test** - Explain what's being protected

## Security Test Examples

### Testing XSS Prevention
```typescript
it('should remove script tags', () => {
  const malicious = '<script>alert("XSS")</script>';
  const safe = sanitizeHTML(malicious);
  expect(safe).not.toContain('<script>');
});
```

### Testing Authentication
```typescript
it('should require valid JWT', async () => {
  const response = await fetch('/edge-function', {
    headers: {} // No auth header
  });
  expect(response.status).toBe(401);
});
```

### Testing RLS Policies
```typescript
it('should prevent cross-org access', async () => {
  const { data } = await supabase
    .from('schools')
    .select()
    .eq('organization_id', 'other-org');
  
  expect(data).toHaveLength(0); // No access
});
```

## Reporting Security Issues

If tests reveal security vulnerabilities:

1. **Do not commit** the vulnerable code
2. **Document the issue** in security test
3. **Implement fix** immediately
4. **Verify fix** with passing test
5. **Review similar code** for same issue

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [POPIA Compliance](https://popia.co.za/)
- [Vitest Documentation](https://vitest.dev/)

## Contact

Security concerns? Contact the security team or create a private security issue.
