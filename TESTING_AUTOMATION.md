# Testing Automation Guide

## Overview

The project includes comprehensive test automation through the `test.sh` script, which orchestrates all testing activities including type checking, linting, unit tests, integration tests, and API endpoint tests.

## Quick Start

### Run All Tests
```bash
./test.sh
```

This will run:
- TypeScript type checking (backend & frontend)
- ESLint linting (backend & frontend)
- Unit tests (if configured)
- Integration tests (if configured)
- API endpoint tests (optional)

### Run Specific Test Suites

```bash
# Only unit tests
./test.sh --unit-only

# Only integration tests
./test.sh --integration-only

# Only API endpoint tests (requires server running)
./test.sh --api-tests

# Skip linting
./test.sh --no-lint

# Skip type checking
./test.sh --no-type-check

# Generate coverage reports
./test.sh --coverage

# Verbose output
./test.sh --verbose
```

## Test Script Options

| Option | Description |
|--------|-------------|
| `--unit-only` | Run only unit tests |
| `--integration-only` | Run only integration tests |
| `--e2e-only` | Run only end-to-end tests |
| `--api-tests` | Run API endpoint tests (requires backend server) |
| `--no-lint` | Skip ESLint linting |
| `--no-type-check` | Skip TypeScript type checking |
| `--coverage` | Generate test coverage reports |
| `--verbose`, `-v` | Show detailed output for failed tests |
| `--help`, `-h` | Show help message |

## Setting Up Tests

### Backend Testing Setup

1. **Install testing dependencies:**
   ```bash
   cd backend
   npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
   ```

2. **Configure Jest** (create `backend/jest.config.js`):
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/src', '<rootDir>/__tests__'],
     testMatch: ['**/__tests__/**/*.test.ts'],
     collectCoverageFrom: [
       'src/**/*.ts',
       '!src/**/*.d.ts',
     ],
   };
   ```

3. **Add test scripts to `backend/package.json`:**
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage",
       "test:integration": "jest --testPathPattern=integration"
     }
   }
   ```

### Frontend Testing Setup

1. **Install testing dependencies:**
   ```bash
   cd frontend
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
   ```

2. **Configure Vitest** (update `frontend/vite.config.ts`):
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './src/test/setup.ts',
     },
   })
   ```

3. **Add test scripts to `frontend/package.json`:**
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

## Test Structure

### Backend Tests

```
backend/
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   │   ├── OpenAIService.test.ts
│   │   │   │   ├── AnthropicService.test.ts
│   │   │   │   └── GeminiService.test.ts
│   │   │   └── chatService.test.ts
│   │   └── routes/
│   │       └── chat.test.ts
│   ├── integration/
│   │   └── api.test.ts
│   └── fixtures/
│       └── mockResponses.ts
```

### Frontend Tests

```
frontend/
├── __tests__/
│   ├── components/
│   │   ├── ChatInterface.test.tsx
│   │   ├── MessageList.test.tsx
│   │   └── MessageInput.test.tsx
│   └── hooks/
│       └── useChat.test.ts
```

## Example Test Files

### Backend Unit Test Example

```typescript
// backend/__tests__/unit/services/llm/OpenAIService.test.ts
import { OpenAIService } from '../../../src/services/llm/OpenAIService';

describe('OpenAIService', () => {
  it('should initialize with API key', () => {
    const service = new OpenAIService('test-key');
    expect(service.isAvailable()).toBe(true);
  });

  it('should not be available without API key', () => {
    const service = new OpenAIService('');
    expect(service.isAvailable()).toBe(false);
  });
});
```

### Frontend Component Test Example

```typescript
// frontend/__tests__/components/ChatInterface.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatInterface } from '../../src/components/ChatInterface';

describe('ChatInterface', () => {
  it('renders chat interface', () => {
    render(<ChatInterface />);
    expect(screen.getByText('LLM Chat Interface')).toBeInTheDocument();
  });
});
```

## Continuous Integration

The test script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: ./test.sh --coverage
```

## Test Coverage Goals

- **Backend**: 80%+ coverage for core services
- **Frontend**: 70%+ coverage for components and hooks
- **Critical paths**: 100% coverage (error handling, validation)

## Troubleshooting

### Tests not running
- Ensure dependencies are installed: `npm install`
- Check that test scripts are configured in `package.json`
- Verify test files match the expected naming pattern (`*.test.ts` or `*.spec.ts`)

### API tests failing
- Ensure backend server is running: `cd backend && npm run dev`
- Check that server is accessible at `http://localhost:3001`
- Verify API keys are set in `.env` (if testing real providers)

### Coverage not generating
- Ensure coverage tools are installed
- Check that `--coverage` flag is passed
- Verify coverage configuration in test framework config

## Next Steps

1. Set up test frameworks (Jest/Vitest)
2. Write initial unit tests for core services
3. Add integration tests for API endpoints
4. Set up test coverage reporting
5. Integrate with CI/CD pipeline

