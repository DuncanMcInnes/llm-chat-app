#!/bin/bash

# Comprehensive Test Automation Script
# Runs all tests for the LLM Chat App project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Parse command line arguments
RUN_UNIT=true
RUN_INTEGRATION=true
RUN_E2E=false
RUN_LINT=true
RUN_TYPE_CHECK=true
RUN_API_TESTS=false
VERBOSE=false
COVERAGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --unit-only)
            RUN_UNIT=true
            RUN_INTEGRATION=false
            RUN_E2E=false
            RUN_API_TESTS=false
            shift
            ;;
        --integration-only)
            RUN_UNIT=false
            RUN_INTEGRATION=true
            RUN_E2E=false
            RUN_API_TESTS=false
            shift
            ;;
        --e2e-only)
            RUN_UNIT=false
            RUN_INTEGRATION=false
            RUN_E2E=true
            RUN_API_TESTS=false
            shift
            ;;
        --api-tests)
            RUN_API_TESTS=true
            shift
            ;;
        --no-lint)
            RUN_LINT=false
            shift
            ;;
        --no-type-check)
            RUN_TYPE_CHECK=false
            shift
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./test.sh [options]"
            echo ""
            echo "Options:"
            echo "  --unit-only          Run only unit tests"
            echo "  --integration-only   Run only integration tests"
            echo "  --e2e-only           Run only end-to-end tests"
            echo "  --api-tests          Run API endpoint tests (requires server)"
            echo "  --no-lint            Skip linting"
            echo "  --no-type-check      Skip TypeScript type checking"
            echo "  --coverage           Generate test coverage reports"
            echo "  --verbose, -v        Verbose output"
            echo "  --help, -h            Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_section "🧪 LLM Chat App - Test Suite"
echo "Running comprehensive test suite..."
echo ""

# Check prerequisites
print_section "📋 Checking Prerequisites"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

# Type checking
if [ "$RUN_TYPE_CHECK" = true ]; then
    print_section "🔍 TypeScript Type Checking"
    
    # Backend type check
    if [ -d "backend" ]; then
        echo "Checking backend types..."
        cd backend
        if npm run type-check >/dev/null 2>&1; then
            print_result 0 "Backend type check passed"
        else
            if [ "$VERBOSE" = true ]; then
                npm run type-check
            fi
            print_result 1 "Backend type check failed"
        fi
        cd ..
    else
        echo -e "${YELLOW}⚠️  Backend directory not found${NC}"
    fi
    
    # Frontend type check
    if [ -d "frontend" ]; then
        echo "Checking frontend types..."
        cd frontend
        if npm run type-check >/dev/null 2>&1; then
            print_result 0 "Frontend type check passed"
        else
            if [ "$VERBOSE" = true ]; then
                npm run type-check
            fi
            print_result 1 "Frontend type check failed"
        fi
        cd ..
    else
        echo -e "${YELLOW}⚠️  Frontend directory not found${NC}"
    fi
fi

# Linting
if [ "$RUN_LINT" = true ]; then
    print_section "🔧 Linting"
    
    # Backend lint
    if [ -d "backend" ]; then
        echo "Linting backend..."
        cd backend
        if npm run lint >/dev/null 2>&1; then
            print_result 0 "Backend linting passed"
        else
            if [ "$VERBOSE" = true ]; then
                npm run lint
            fi
            print_result 1 "Backend linting failed"
        fi
        cd ..
    fi
    
    # Frontend lint
    if [ -d "frontend" ]; then
        echo "Linting frontend..."
        cd frontend
        if npm run lint >/dev/null 2>&1; then
            print_result 0 "Frontend linting passed"
        else
            if [ "$VERBOSE" = true ]; then
                npm run lint
            fi
            print_result 1 "Frontend linting failed"
        fi
        cd ..
    fi
fi

# Unit tests
if [ "$RUN_UNIT" = true ]; then
    print_section "🧩 Unit Tests"
    
    # Backend unit tests
    if [ -d "backend" ]; then
        echo "Running backend unit tests..."
        cd backend
        if [ -f "package.json" ] && grep -q '"test"' package.json; then
            COVERAGE_FLAG=""
            if [ "$COVERAGE" = true ]; then
                COVERAGE_FLAG="--coverage"
            fi
            
            if npm run test -- $COVERAGE_FLAG >/dev/null 2>&1; then
                print_result 0 "Backend unit tests passed"
            else
                if [ "$VERBOSE" = true ]; then
                    npm run test
                fi
                print_result 1 "Backend unit tests failed"
            fi
        else
            echo -e "${YELLOW}⚠️  Backend test script not configured${NC}"
            ((TESTS_SKIPPED++))
        fi
        cd ..
    fi
    
    # Frontend unit tests
    if [ -d "frontend" ]; then
        echo "Running frontend unit tests..."
        cd frontend
        if [ -f "package.json" ] && grep -q '"test"' package.json; then
            COVERAGE_FLAG=""
            if [ "$COVERAGE" = true ]; then
                COVERAGE_FLAG="--coverage"
            fi
            
            if npm run test -- $COVERAGE_FLAG >/dev/null 2>&1; then
                print_result 0 "Frontend unit tests passed"
            else
                if [ "$VERBOSE" = true ]; then
                    npm run test
                fi
                print_result 1 "Frontend unit tests failed"
            fi
        else
            echo -e "${YELLOW}⚠️  Frontend test script not configured${NC}"
            ((TESTS_SKIPPED++))
        fi
        cd ..
    fi
fi

# Integration tests
if [ "$RUN_INTEGRATION" = true ]; then
    print_section "🔗 Integration Tests"
    
    if [ -d "backend" ]; then
        cd backend
        if [ -f "package.json" ] && grep -q '"test:integration"' package.json; then
            if npm run test:integration >/dev/null 2>&1; then
                print_result 0 "Backend integration tests passed"
            else
                if [ "$VERBOSE" = true ]; then
                    npm run test:integration
                fi
                print_result 1 "Backend integration tests failed"
            fi
        else
            echo -e "${YELLOW}⚠️  Integration tests not configured${NC}"
            ((TESTS_SKIPPED++))
        fi
        cd ..
    fi
fi

# API endpoint tests
if [ "$RUN_API_TESTS" = true ]; then
    print_section "🌐 API Endpoint Tests"
    
    if [ -f "test-api.sh" ]; then
        echo "Running API endpoint tests..."
        echo -e "${YELLOW}⚠️  Note: Backend server must be running on http://localhost:3001${NC}"
        
        if ./test-api.sh >/dev/null 2>&1; then
            print_result 0 "API endpoint tests passed"
        else
            if [ "$VERBOSE" = true ]; then
                ./test-api.sh
            fi
            print_result 1 "API endpoint tests failed"
        fi
    else
        echo -e "${YELLOW}⚠️  test-api.sh not found${NC}"
        ((TESTS_SKIPPED++))
    fi
fi

# E2E tests
if [ "$RUN_E2E" = true ]; then
    print_section "🎭 End-to-End Tests"
    
    if [ -d "e2e" ] || [ -f "e2e.config.js" ]; then
        echo -e "${YELLOW}⚠️  E2E tests not yet implemented${NC}"
        ((TESTS_SKIPPED++))
    else
        echo -e "${YELLOW}⚠️  E2E tests not configured${NC}"
        ((TESTS_SKIPPED++))
    fi
fi

# Summary
print_section "📊 Test Summary"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))

echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
if [ $TESTS_SKIPPED -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Skipped: $TESTS_SKIPPED${NC}"
fi
echo -e "${BLUE}📈 Total: $TOTAL_TESTS${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}💥 Some tests failed. Please review the output above.${NC}"
    exit 1
fi

