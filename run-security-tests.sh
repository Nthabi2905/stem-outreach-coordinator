#!/bin/bash

# Security Testing Runner Script
# Usage: ./run-security-tests.sh [option]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   STEM Outreach Platform Security Tests   ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Function to run tests with header
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${YELLOW}🔒 Running: $test_name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name PASSED${NC}"
    else
        echo -e "${RED}❌ $test_name FAILED${NC}"
        exit 1
    fi
    echo ""
}

# Main test execution
case "${1:-all}" in
    "all")
        echo -e "${BLUE}Running ALL security tests...${NC}\n"
        run_test "Input Validation Tests" "npx vitest run src/utils/__tests__/"
        run_test "AI Security Tests" "npx vitest run src/test/security/promptInjection.test.ts"
        run_test "Authentication Tests" "npx vitest run src/test/security/authentication.test.ts"
        run_test "RLS Policy Tests" "npx vitest run src/test/security/rls-policies.test.ts"
        run_test "Edge Function Security Tests" "npx vitest run src/test/security/edge-functions.test.ts"
        run_test "npm audit" "npm audit --production --audit-level=moderate"
        ;;
        
    "quick")
        echo -e "${BLUE}Running QUICK security tests...${NC}\n"
        run_test "Input Validation" "npx vitest run src/utils/__tests__/"
        run_test "AI Security" "npx vitest run src/test/security/promptInjection.test.ts"
        ;;
        
    "input")
        run_test "Input Validation Tests" "npx vitest run src/utils/__tests__/"
        ;;
        
    "ai")
        run_test "AI Security Tests" "npx vitest run src/test/security/"
        ;;
        
    "auth")
        run_test "Authentication Tests" "npx vitest run src/test/security/authentication.test.ts"
        ;;
        
    "rls")
        run_test "RLS Policy Tests" "npx vitest run src/test/security/rls-policies.test.ts"
        ;;
        
    "edge")
        run_test "Edge Function Tests" "npx vitest run src/test/security/edge-functions.test.ts"
        ;;
        
    "coverage")
        echo -e "${BLUE}Generating coverage report...${NC}\n"
        npx vitest run --coverage
        echo -e "${GREEN}✅ Coverage report generated in ./coverage/${NC}"
        ;;
        
    "audit")
        run_test "Dependency Audit" "npm audit --production"
        run_test "Check Outdated Packages" "npm outdated"
        ;;
        
    "watch")
        echo -e "${BLUE}Starting test watch mode...${NC}\n"
        npx vitest watch
        ;;
        
    "help"|"-h"|"--help")
        echo "Usage: ./run-security-tests.sh [option]"
        echo ""
        echo "Options:"
        echo "  all       Run all security tests (default)"
        echo "  quick     Run quick security tests (input + AI)"
        echo "  input     Run input validation tests only"
        echo "  ai        Run AI security tests only"
        echo "  auth      Run authentication tests only"
        echo "  rls       Run RLS policy tests only"
        echo "  edge      Run edge function security tests only"
        echo "  coverage  Generate coverage report"
        echo "  audit     Run npm audit and check outdated packages"
        echo "  watch     Run tests in watch mode"
        echo "  help      Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./run-security-tests.sh           # Run all tests"
        echo "  ./run-security-tests.sh quick     # Quick validation"
        echo "  ./run-security-tests.sh coverage  # Generate coverage"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        echo "Run './run-security-tests.sh help' for usage information"
        exit 1
        ;;
esac

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ All Security Tests Completed          ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
