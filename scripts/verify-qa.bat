@echo off
REM SolarIQ-Web QA Verification Script for Windows
REM Run this script to verify all quality gates before committing

echo ================================================
echo SolarIQ-Web QA Verification
echo ================================================
echo.

set PASS_COUNT=0
set FAIL_COUNT=0

REM 1. Check for TODO/FIXME/HACK/XXX
echo Checking for TODO/FIXME/HACK/XXX comments...
findstr /S /N /I "TODO FIXME HACK XXX" src\*.ts src\*.tsx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [FAIL] Found TODO/FIXME/HACK/XXX comments:
    findstr /S /N /I "TODO FIXME HACK XXX" src\*.ts src\*.tsx
    set /a FAIL_COUNT+=1
) else (
    echo [PASS] No TODO/FIXME/HACK/XXX comments found
    set /a PASS_COUNT+=1
)
echo.

REM 2. Check for console.log/error
echo Checking for console.log/error statements...
findstr /S /N /I "console\.\(log\|error\)" src\*.ts src\*.tsx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [FAIL] Found console.log/error statements:
    findstr /S /N /C:"console.log" C:"console.error" src\*.ts src\*.tsx
    set /a FAIL_COUNT+=1
) else (
    echo [PASS] No console.log/error statements found
    set /a PASS_COUNT+=1
)
echo.

REM 3. Check for any type
echo Checking for 'any' type usage...
findstr /S /N /C:": any" src\*.ts src\*.tsx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARN] Found 'any' type usages:
    findstr /S /N /C:": any" src\*.ts src\*.tsx
) else (
    echo [PASS] No 'any' type usage found
    set /a PASS_COUNT+=1
)
echo.

REM 4. Run ESLint
echo Running ESLint...
call pnpm lint
if %ERRORLEVEL% EQU 0 (
    echo [PASS] ESLint passed
    set /a PASS_COUNT+=1
) else (
    echo [FAIL] ESLint failed
    set /a FAIL_COUNT+=1
)
echo.

REM 5. Run TypeScript type check
echo Running TypeScript type check...
call pnpm type-check
if %ERRORLEVEL% EQU 0 (
    echo [PASS] TypeScript type check passed
    set /a PASS_COUNT+=1
) else (
    echo [FAIL] TypeScript type check failed
    set /a FAIL_COUNT+=1
)
echo.

REM 6. Run unit tests
echo Running unit tests with coverage...
call pnpm test:coverage
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Unit tests passed
    set /a PASS_COUNT+=1
) else (
    echo [FAIL] Unit tests failed
    set /a FAIL_COUNT+=1
)
echo.

REM 7. Run build
echo Running production build...
call pnpm build
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Production build succeeded
    set /a PASS_COUNT+=1
) else (
    echo [FAIL] Production build failed
    set /a FAIL_COUNT+=1
)
echo.

REM Summary
echo ================================================
echo QA Verification Summary
echo ================================================
echo Passed: %PASS_COUNT%
echo Failed: %FAIL_COUNT%
echo.

if %FAIL_COUNT% GTR 0 (
    echo [FAIL] QA Verification FAILED. Please fix the issues above.
    exit /b 1
) else (
    echo [PASS] QA Verification PASSED. Ready to commit!
    exit /b 0
)
