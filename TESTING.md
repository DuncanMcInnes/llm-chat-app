# Testing Guide

This document describes the testing infrastructure and how to run tests for the LLM Chat App.

## Test Infrastructure

### Backend Testing (Jest)

- **Framework**: Jest with ts-jest
- **Location**: `backend/src/__tests__/`
- **Configuration**: `backend/jest.config.js`

#### Test Structure

```
backend/src/__tests__/
├── setup.ts                    # Test setup and configuration
├── unit/                       # Unit tests
│   ├── LLMFactory.test.ts     # Factory pattern tests
│   └── ChatService.test.ts     # Business logic tests
└── integration/                # Integration tests
    └── chat.routes.test.ts     # API endpoint tests
```

#### Running Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Testing (Vitest)

- **Framework**: Vitest with React Testing Library
- **Location**: `frontend/src/__tests__/`
- **Configuration**: `frontend/vite.config.ts` (test section)

#### Test Structure

```
frontend/src/__tests__/
├── setup.ts                    # Test setup and configuration
├── hooks/                       # Hook tests
│   └── useChat.test.tsx        # Chat hook tests
└── components/                  # Component tests
    └── ProviderSelector.test.tsx # Component tests
```

#### Running Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Comprehensive Test Script

The project includes a comprehensive test automation script at the root:

```bash
# Run all tests (type check, lint, unit, integration)
./test.sh

# Run only unit tests
./test.sh --unit-only

# Run only integration tests
./test.sh --integration-only

# Run with coverage
./test.sh --coverage

# Run with verbose output
./test.sh --verbose

# Skip linting
./test.sh --no-lint

# Skip type checking
./test.sh --no-type-check
```

## Test Coverage

### Backend Coverage Goals

- **Core Services**: 80%+ coverage
- **LLM Providers**: Mocked API calls, test error handling
- **API Routes**: Full request/response cycle testing
- **Critical Paths**: 100% coverage (error handling, validation)

### Frontend Coverage Goals

- **Components**: 70%+ coverage
- **Hooks**: 80%+ coverage
- **API Service**: Mocked fetch calls
- **User Interactions**: Test user events and state changes

## Writing Tests

### Backend Unit Test Example

```typescript
import { ChatService } from '../../services/chatService';
import { LLMFactory } from '../../services/llm/LLMFactory';

jest.mock('../../services/llm/LLMFactory');

describe('ChatService', () => {
  const mockProvider = {
    chat: jest.fn(),
    isAvailable: jest.fn(() => true),
    getDefaultModel: jest.fn(() => 'gpt-4'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (LLMFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
  });

  it('should process valid chat request', async () => {
    // Test implementation
  });
});
```

### Frontend Component Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProviderSelector } from '../../components/ProviderSelector';

describe('ProviderSelector', () => {
  it('should render and handle selection', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(
      <ProviderSelector
        providers={mockProviders}
        value="openai"
        onChange={mockOnChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'anthropic');
    
    expect(mockOnChange).toHaveBeenCalledWith('anthropic');
  });
});
```

## Mocking

### Backend Mocks

- **LLMFactory**: Mocked to avoid actual API calls
- **External APIs**: All LLM provider SDKs are mocked in tests
- **Config**: Environment variables mocked for test scenarios

### Frontend Mocks

- **API Service**: `fetchProviders` and `sendChat` are mocked
- **Fetch API**: Can be mocked using `vi.stubGlobal` if needed

## Continuous Integration

The test scripts are designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    ./test.sh --coverage
```

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Mock external dependencies (APIs, file system)
3. **Coverage**: Aim for high coverage on critical paths
4. **Readability**: Use descriptive test names and clear assertions
5. **Speed**: Keep tests fast (unit tests should be < 1s each)

## Troubleshooting

### Backend Tests

- **Module not found**: Ensure `ts-jest` is properly configured
- **Mock not working**: Check that mocks are set up before imports
- **Type errors**: Ensure `@types/jest` is installed

### Frontend Tests

- **DOM not found**: Ensure `jsdom` environment is set in `vite.config.ts`
- **React hooks errors**: Use `@testing-library/react` hooks utilities
- **Async issues**: Use `waitFor` from testing library for async operations

## Next Steps

- [ ] Add E2E tests with Playwright or Cypress
- [ ] Set up test coverage reporting in CI
- [ ] Add visual regression tests for UI components
- [ ] Performance testing for API endpoints
