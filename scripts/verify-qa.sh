#!/bin/bash

# SolarIQ-Web QA Verification Script
# Run this script to verify all quality gates before committing

set -e

echo "🔍 Running SolarIQ-Web QA Verification..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS_COUNT++))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}⚠️ WARN${NC}: $1"
}

# 1. Check for TODO/FIXME/HACK/XXX
echo "📋 Checking for TODO/FIXME/HACK/XXX comments..."
TODO_COUNT=$(grep -rn "TODO\|FIXME\|HACK\|XXX" ./src/ 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -eq 0 ]; then
    check_pass "No TODO/FIXME/HACK/XXX comments found"
else
    check_fail "Found $TODO_COUNT TODO/FIXME/HACK/XXX comments"
    grep -rn "TODO\|FIXME\|HACK\|XXX" ./src/ 2>/dev/null || true
fi
echo ""

# 2. Check for hardcoded secrets
echo "🔒 Checking for hardcoded secrets..."
SECRETS_COUNT=$(grep -rn "AIza\|sk-\|ghp_\|password\s*=\s*['\"]" ./src/ 2>/dev/null | grep -v "password is required" | wc -l || echo "0")
if [ "$SECRETS_COUNT" -eq 0 ]; then
    check_pass "No hardcoded secrets found"
else
    check_fail "Found $SECRETS_COUNT potential hardcoded secrets"
    grep -rn "AIza\|sk-\|ghp_\|password\s*=\s*['\"]" ./src/ 2>/dev/null | grep -v "password is required" || true
fi
echo ""

# 3. Check for console.log/error/warn
echo "🖥️ Checking for console.log/error/warn statements..."
CONSOLE_COUNT=$(grep -rn "console\.\(log\|error\)" ./src/ 2>/dev/null | wc -l || echo "0")
if [ "$CONSOLE_COUNT" -eq 0 ]; then
    check_pass "No console.log/error statements found"
else
    check_fail "Found $CONSOLE_COUNT console.log/error statements"
    grep -rn "console\.\(log\|error\)" ./src/ 2>/dev/null || true
fi
echo ""

# 4. Check for any type
echo "🔤 Checking for 'any' type usage..."
ANY_COUNT=$(grep -rn ": any" ./src/ 2>/dev/null | wc -l || echo "0")
if [ "$ANY_COUNT" -eq 0 ]; then
    check_pass "No 'any' type usage found"
else
    check_warn "Found $ANY_COUNT 'any' type usages (review if intentional)"
    grep -rn ": any" ./src/ 2>/dev/null || true
fi
echo ""

# 5. Check for @ts-ignore or @ts-expect-error
echo "⏭️ Checking for @ts-ignore/@ts-expect-error..."
TS_IGNORE_COUNT=$(grep -rn "@ts-ignore\|@ts-expect-error" ./src/ 2>/dev/null | wc -l || echo "0")
if [ "$TS_IGNORE_COUNT" -eq 0 ]; then
    check_pass "No @ts-ignore/@ts-expect-error found"
else
    check_warn "Found $TS_IGNORE_COUNT @ts-ignore/@ts-expect-error (review if justified)"
    grep -rn "@ts-ignore\|@ts-expect-error" ./src/ 2>/dev/null || true
fi
echo ""

# 6. Run ESLint
echo "📏 Running ESLint..."
if pnpm lint 2>/dev/null; then
    check_pass "ESLint passed"
else
    check_fail "ESLint failed"
fi
echo ""

# 7. Run TypeScript type check
echo "🔷 Running TypeScript type check..."
if pnpm type-check 2>/dev/null; then
    check_pass "TypeScript type check passed"
else
    check_fail "TypeScript type check failed"
fi
echo ""

# 8. Run unit tests with coverage
echo "🧪 Running unit tests with coverage..."
if pnpm test:coverage 2>/dev/null; then
    check_pass "Unit tests passed"
else
    check_fail "Unit tests failed"
fi
echo ""

# 9. Run build
echo "🏗️ Running production build..."
if pnpm build 2>/dev/null; then
    check_pass "Production build succeeded"
else
    check_fail "Production build failed"
fi
echo ""

# 10. Run npm audit
echo "🔐 Running npm audit..."
if pnpm audit --audit-level=high 2>/dev/null; then
    check_pass "No high/critical vulnerabilities found"
else
    check_warn "Vulnerabilities found - review and fix if possible"
fi
echo ""

# Summary
echo "================================"
echo "📊 QA Verification Summary"
echo "================================"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ QA Verification FAILED. Please fix the issues above.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ QA Verification PASSED. Ready to commit!${NC}"
    exit 0
fi
