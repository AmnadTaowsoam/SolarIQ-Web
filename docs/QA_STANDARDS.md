# SolarIQ-Web QA Standards & Testing Guide

This document defines the Quality Assurance standards for the SolarIQ-Web frontend application.

## Table of Contents

1. [Quality Gates](#quality-gates)
2. [Verification Commands](#verification-commands)
3. [Red Flags Checklist](#red-flags-checklist)
4. [Test Coverage Requirements](#test-coverage-requirements)
5. [Accessibility Standards](#accessibility-standards)
6. [Performance Budgets](#performance-budgets)
7. [CI/CD Pipeline](#cicd-pipeline)

---

## Quality Gates

Every commit must pass these quality gates before merging:

### Code Quality
- ✅ Code complete - No TODO/FIXME/HACK/XXX comments
- ✅ ESLint pass (all rules)
- ✅ TypeScript strict mode pass (`tsc --noEmit`)
- ✅ No `any` type (or justified with comment)
- ✅ No `@ts-ignore` or `@ts-expect-error` (or justified)

### Testing
- ✅ Unit test pass - coverage >= 80%
- ✅ E2E tests pass (Playwright)
- ✅ All tests have meaningful assertions

### Security
- ✅ No hardcoded secrets (gitleaks scan pass)
- ✅ No console.log/error in production code
- ✅ npm audit - no critical/high vulnerabilities

### Build
- ✅ `pnpm build` succeeds without warnings
- ✅ No TypeScript build errors

---

## Verification Commands

### Quick Checks

```bash
# Check for TODO/FIXME/HACK/XXX
pnpm check:todos

# Check for console.log/error
pnpm check:console

# Check for hardcoded secrets
pnpm check:secrets
```

### Full QA Verification

```bash
# Linux/macOS
pnpm qa

# Windows
pnpm qa:win
```

### Individual Commands

```bash
# ESLint
pnpm lint

# TypeScript type check
pnpm type-check

# Unit tests with coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# Production build
pnpm build

# Security audit
pnpm audit --audit-level=high
```

---

## Red Flags Checklist

The following patterns are considered red flags and should be avoided:

| # | Red Flag | Problem | Solution |
|---|----------|---------|----------|
| 1 | `any` type | Loses type safety | Use proper types |
| 2 | `@ts-ignore` | Hides type errors | Fix the underlying issue |
| 3 | `eslint-disable` | Bypasses lint rules | Fix the underlying issue |
| 4 | `console.log` | Not proper logging | Use logging service or remove |
| 5 | Hardcoded URLs/keys | Security risk | Use environment variables |
| 6 | Tests without assertions | False confidence | Add meaningful assertions |
| 7 | `useEffect` without cleanup | Memory leaks | Add cleanup function |
| 8 | Missing `key` prop | React warnings | Add unique keys |
| 9 | No error boundary | App crashes | Wrap with ErrorBoundary |
| 10 | No loading state | Poor UX | Add loading indicators |

---

## Test Coverage Requirements

| Category | Files | Coverage Target |
|----------|-------|-----------------|
| UI Components | `src/components/ui/*.tsx` | >= 90% |
| Layout Components | `src/components/layout/*.tsx` | >= 80% |
| Custom Hooks | `src/hooks/*.ts` | >= 85% |
| Context Providers | `src/context/*.tsx` | >= 80% |
| Lib/Utils | `src/lib/*.ts` | >= 90% |
| Pages | `src/app/*/page.tsx` | >= 70% |
| Middleware | `src/middleware.ts` | >= 90% |
| E2E | Critical flows | Auth + Lead + Solar |

### Running Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## Accessibility Standards

All components must meet these accessibility requirements:

### Interactive Elements
- Every interactive element must have an `aria-label` or visible label
- Buttons must have discernible text
- Links must have meaningful text (not "click here")

### Forms
- All form inputs must be associated with `<label>` elements
- Error messages must use `role="alert"`
- Required fields must be marked

### Modals & Dialogs
- Focus must be trapped within the modal
- Escape key must close the modal
- Focus must return to trigger element on close

### Notifications
- Toast notifications must use `aria-live` region
- Dynamic content updates must be announced

### Visual
- Color contrast ratio must be >= 4.5:1
- Don't rely solely on color to convey information

---

## Performance Budgets

The application must stay within these performance budgets:

| Metric | Budget | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Total JS Bundle (gzipped) | < 300KB | Build analysis |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true pnpm build
```

---

## CI/CD Pipeline

The CI pipeline (`.github/workflows/ci.yml`) runs automatically on every push and pull request.

### Jobs

1. **Security Scan**
   - gitleaks scan for secrets
   - npm audit for vulnerabilities

2. **Lint & Type Check**
   - ESLint validation
   - TypeScript type checking

3. **Unit Tests**
   - Jest tests with coverage
   - Coverage threshold: 80%

4. **Build**
   - Production build verification

5. **E2E Tests**
   - Playwright browser tests
   - Critical user flows

### CI Status Badge

```markdown
![CI](https://github.com/your-org/solariq-web/workflows/CI/badge.svg)
```

---

## Pre-commit Hooks

Install husky and lint-staged to run checks before commits:

```bash
# Install dependencies
pnpm add -D husky lint-staged

# Setup husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "pnpm lint-staged"
```

---

## Troubleshooting

### Common Issues

**TypeScript errors in tests**
- Tests use a separate `tsconfig.test.json`
- Run `pnpm test` instead of `tsc` directly

**ESLint errors**
- Run `pnpm lint:fix` to auto-fix
- Review remaining errors manually

**Coverage below threshold**
- Check coverage report in `coverage/lcov-report/`
- Add tests for uncovered branches

**Build failures**
- Check for missing environment variables
- Verify all imports are correct

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/docs/)
- [Playwright](https://playwright.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
