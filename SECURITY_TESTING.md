# Security Testing Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm installed
- Project dependencies installed (`npm install`)

### Test Scripts

Since `package.json` is managed automatically, run tests using `npx`:

```bash
# Run all tests
npx vitest

# Run security tests only
npx vitest run src/test/security

# Run with coverage
npx vitest run --coverage

# Watch mode (for development)
npx vitest watch

# Run specific test file
npx vitest run src/utils/__tests__/sanitize.test.ts
```

## 📋 Test Categories

### 1. Input Validation Tests
**Location**: `src/utils/__tests__/`

```bash
npx vitest run src/utils/__tests__/sanitize.test.ts
npx vitest run src/utils/__tests__/passwordValidation.test.ts
```

**What's tested**:
- ✅ XSS prevention (script tag removal)
- ✅ HTML sanitization
- ✅ File upload validation (size, type, extension)
- ✅ Password strength requirements
- ✅ Text escaping

### 2. AI Security Tests
**Location**: `src/test/security/promptInjection.test.ts`

```bash
npx vitest run src/test/security/promptInjection.test.ts
```

**What's tested**:
- ✅ Prompt injection attack prevention
- ✅ System instruction override attempts
- ✅ Secret extraction prevention
- ✅ Token overflow prevention
- ✅ AI output sanitization

### 3. Authentication Tests
**Location**: `src/test/security/authentication.test.ts`

```bash
npx vitest run src/test/security/authentication.test.ts
```

**What's tested**:
- ✅ JWT validation
- ✅ Session management
- ✅ Role-based access control
- ✅ Password security policies
- ✅ Organization membership checks

### 4. RLS Policy Tests
**Location**: `src/test/security/rls-policies.test.ts`

```bash
npx vitest run src/test/security/rls-policies.test.ts
```

**What's tested**:
- ✅ Row Level Security documentation
- ✅ Organization data isolation
- ✅ User-specific data access
- ✅ Admin privilege enforcement

### 5. Edge Function Security Tests
**Location**: `src/test/security/edge-functions.test.ts`

```bash
npx vitest run src/test/security/edge-functions.test.ts
```

**What's tested**:
- ✅ Authentication requirements
- ✅ Input validation with Zod
- ✅ CORS configuration
- ✅ Error handling (no secret exposure)
- ✅ Rate limiting
- ✅ AI safety controls

## 🎯 Running Tests in CI/CD

Tests run automatically via GitHub Actions:

### Workflow Files
- `.github/workflows/security.yml` - Dependency scanning
- `.github/workflows/security-tests.yml` - Automated security tests

### Triggers
- ✅ Every push to main
- ✅ Every pull request
- ✅ Daily at 2 AM (scheduled)

## 📊 Coverage Reports

Generate coverage report:

```bash
npx vitest run --coverage
```

View report:
```bash
open coverage/index.html  # Mac
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Targets
- Security utilities: **90%+**
- Authentication logic: **85%+**
- Input validation: **90%+**

## ⚡ Quick Test Examples

### Test XSS Prevention
```bash
npx vitest run -t "should remove script tags"
```

### Test Password Validation
```bash
npx vitest run -t "should accept strong password"
```

### Test File Upload Security
```bash
npx vitest run -t "should reject file that is too large"
```

## 🔍 Debugging Failed Tests

### Verbose output
```bash
npx vitest run --reporter=verbose
```

### Run single test with output
```bash
npx vitest run -t "specific test name" --reporter=verbose
```

### Watch mode for debugging
```bash
npx vitest watch src/utils/__tests__/sanitize.test.ts
```

## 🛡️ Security Test Checklist

### Before Every Deployment

Run this checklist:

```bash
# 1. Run all security tests
npx vitest run src/test/security

# 2. Check for vulnerabilities
npm audit --production

# 3. Verify no secrets in code
git grep -i "api.key\|secret\|password" src/

# 4. Generate coverage report
npx vitest run --coverage
```

### Monthly Security Review

```bash
# Update dependencies
npm outdated
npm audit

# Re-run full test suite
npx vitest run

# Check RLS policies
grep -r "ENABLE ROW LEVEL SECURITY" supabase/migrations/
```

## 📝 Writing New Security Tests

### Template for New Test

```typescript
import { describe, it, expect } from 'vitest';

describe('Security - New Feature', () => {
  describe('Attack scenario', () => {
    it('should prevent XYZ attack', () => {
      // Arrange: Setup the attack
      const maliciousInput = '<script>alert("XSS")</script>';
      
      // Act: Apply security control
      const sanitized = sanitize(maliciousInput);
      
      // Assert: Verify protection works
      expect(sanitized).not.toContain('<script>');
    });
  });
});
```

### Test Naming Convention
- Use descriptive names: `should prevent prompt injection`
- Include attack type: `should remove script tags (XSS prevention)`
- Be specific: `should reject files larger than 10MB`

## 🚨 Common Issues

### Issue: Tests fail with module not found
**Solution**: Ensure all dependencies installed
```bash
npm install
```

### Issue: Coverage not generating
**Solution**: Install coverage provider
```bash
npm install -D @vitest/coverage-v8
```

### Issue: Tests timeout
**Solution**: Increase timeout in test
```typescript
it('slow test', async () => {
  // Test code
}, { timeout: 10000 }); // 10 seconds
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Supabase Security Docs](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contributing Security Tests

When adding security tests:

1. **Identify the risk** - What could go wrong?
2. **Write failing test** - Document the attack
3. **Implement protection** - Add security control
4. **Verify test passes** - Confirm protection works
5. **Document in README** - Explain what's protected

## 📞 Security Concerns?

If you discover a security vulnerability:

1. **DO NOT** commit the vulnerability
2. Create a **private** security issue
3. Document the issue in a test
4. Implement the fix
5. Verify with passing tests

---

**Last Updated**: 2025
**Maintained by**: STEM Outreach Platform Security Team
