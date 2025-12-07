# LLM Chat Interface - Project Plan

## Project Overview
A full-stack TypeScript application featuring a chat interface with abstraction layer supporting multiple LLM providers (GPT, Claude, Gemini). Built as an MVP for educational purposes, deployable via Docker.

## Architecture

### Tech Stack
- **Backend**: Node.js + Express/Fastify + TypeScript
- **Frontend**: React/Next.js + TypeScript
- **LLM Providers**: OpenAI (GPT), Anthropic (Claude), Google (Gemini)
- **Containerization**: Docker + Docker Compose
- **Package Manager**: npm or pnpm

### Project Structure
```
llm-chat-app/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express/Fastify server
│   │   ├── routes/
│   │   │   └── chat.ts        # Chat API endpoints
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   │   ├── LLMProvider.ts      # Base interface
│   │   │   │   ├── OpenAIService.ts    # GPT implementation
│   │   │   │   ├── AnthropicService.ts # Claude implementation
│   │   │   │   ├── GeminiService.ts    # Gemini implementation
│   │   │   │   └── LLMFactory.ts       # Factory pattern
│   │   │   └── chatService.ts
│   │   ├── types/
│   │   │   └── index.ts       # Shared types
│   │   └── config/
│   │       └── index.ts       # Configuration
│   ├── __tests__/            # Test files
│   │   ├── unit/             # Unit tests
│   │   ├── integration/       # Integration tests
│   │   └── fixtures/         # Test fixtures and mocks
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ProviderSelector.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── __tests__/            # Test files
│   │   ├── components/       # Component tests
│   │   └── hooks/            # Hook tests
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── test.sh                  # Comprehensive test automation script
├── test-api.sh              # API endpoint testing script
└── README.md
```

## Implementation Phases

### Phase 1: Project Setup & Backend Foundation
**Goal**: Set up project structure and basic backend API

1. Initialize project structure
   - Create backend and frontend directories
   - Set up TypeScript configurations
   - Initialize package.json files
   - Set up .gitignore

2. Backend setup
   - Install Express/Fastify and dependencies
   - Create basic server with health check endpoint
   - Set up CORS for frontend communication
   - Configure environment variables

3. Type definitions
   - Define message types (Message, ChatRequest, ChatResponse)
   - Define LLM provider types
   - Create shared interfaces

### Phase 2: LLM Abstraction Layer
**Goal**: Create provider-agnostic LLM service

1. Base interface design
   - Create `LLMProvider` interface with common methods:
     - `chat(messages: Message[]): Promise<string>`
     - `streamChat(messages: Message[]): AsyncGenerator<string>`
   - Define provider configuration types

2. Implement provider adapters
   - **OpenAI Service**: Wrap OpenAI SDK
   - **Anthropic Service**: Wrap Anthropic SDK
   - **Gemini Service**: Wrap Google Gemini SDK
   - Each adapter implements `LLMProvider` interface

3. Factory pattern
   - Create `LLMFactory` to instantiate providers
   - Provider selection based on configuration
   - Error handling for missing API keys

### Phase 3: Chat API Endpoints
**Goal**: Create RESTful API for chat functionality

1. Chat endpoint
   - POST `/api/chat`
   - Request: `{ provider: string, messages: Message[] }`
   - Response: `{ message: string, provider: string }`
   - Error handling and validation

2. Streaming endpoint (optional for MVP)
   - POST `/api/chat/stream`
   - Server-Sent Events (SSE) for real-time responses

3. Provider management
   - GET `/api/providers` - List available providers
   - GET `/api/providers/:id/config` - Get provider config

### Phase 4: Frontend Chat Interface
**Goal**: Build user-friendly chat UI

1. React app setup
   - Initialize React app (Vite or Create React App)
   - Set up TypeScript
   - Install UI library (optional: shadcn/ui, Material-UI, or Tailwind)

2. Core components
   - **ChatInterface**: Main container component
   - **MessageList**: Display chat history
   - **MessageInput**: Text input with send button
   - **ProviderSelector**: Dropdown to select LLM provider

3. State management
   - Use React hooks (useState, useReducer) or Zustand
   - Manage chat history, current provider, loading states

4. API integration
   - Create API service layer
   - Handle API calls and errors
   - Implement loading and error states

### Phase 5: Docker Configuration
**Goal**: Containerize application for easy deployment

1. Backend Dockerfile
   - Multi-stage build for optimization
   - Install dependencies and build TypeScript
   - Expose appropriate port

2. Frontend Dockerfile
   - Build React app
   - Serve with nginx or similar

3. Docker Compose
   - Define services (backend, frontend)
   - Set up networking
   - Configure environment variables
   - Volume mounts for development

4. Environment configuration
   - Create .env.example with all required variables
   - Document environment setup

### Phase 6: Documentation & Polish
**Goal**: Make project ready for deployment and sharing

1. README.md
   - Project description
   - Setup instructions
   - Environment variables documentation
   - Docker deployment guide
   - API documentation

2. Code quality
   - Add ESLint and Prettier
   - Type safety improvements
   - Error handling refinement

### Phase 7: Automated Testing
**Goal**: Set up automated testing infrastructure for reliable development

1. Test infrastructure setup
   - Install testing frameworks (Jest/Vitest for backend, Vitest for frontend)
   - Configure test scripts in package.json
   - Set up test environment configuration

2. Backend unit tests
   - Test LLM provider services (mocked API calls)
   - Test LLMFactory initialization and provider management
   - Test ChatService business logic
   - Test API route handlers with request validation
   - Test error handling scenarios

3. Backend integration tests
   - Test API endpoints with test server
   - Test provider availability detection
   - Test chat flow end-to-end (with mocked LLM responses)

4. Frontend unit tests
   - Test React components (ChatInterface, MessageList, etc.)
   - Test custom hooks (useChat)
   - Test API service layer

5. Test automation script
   - Create `test.sh` script to run all tests
   - Support for running specific test suites
   - Integration with CI/CD (optional)
   - Test coverage reporting

## Environment Variables

### Backend
```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
CORS_ORIGIN=http://localhost:3000
```

### Frontend
```env
VITE_API_URL=http://localhost:3001
# or
REACT_APP_API_URL=http://localhost:3001
```

## API Design

### POST /api/chat
**Request:**
```json
{
  "provider": "openai" | "anthropic" | "gemini",
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" }
  ],
  "model": "gpt-4" (optional, provider-specific)
}
```

**Response:**
```json
{
  "message": "Response from LLM",
  "provider": "openai",
  "model": "gpt-4"
}
```

### GET /api/providers
**Response:**
```json
{
  "providers": [
    { "id": "openai", "name": "OpenAI GPT", "available": true },
    { "id": "anthropic", "name": "Anthropic Claude", "available": true },
    { "id": "gemini", "name": "Google Gemini", "available": true }
  ]
}
```

## Deployment Strategy

### Local Docker Deployment
1. Build images: `docker-compose build`
2. Run containers: `docker-compose up`
3. Access: `http://localhost:3000` (frontend), `http://localhost:3001` (backend)

### Cloud Deployment (Digital Ocean)
1. Create Dockerfile optimizations for production
2. Set up environment variables in cloud platform
3. Configure domain and SSL
4. Set up CI/CD pipeline (optional)

## Dependencies

### Backend
- `express` or `fastify` - Web framework
- `@openai/openai` - OpenAI SDK
- `@anthropic-ai/sdk` - Anthropic SDK
- `@google/generative-ai` - Google Gemini SDK
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `zod` - Runtime validation
- `jest` or `vitest` - Testing framework
- `@types/jest` or `@vitest/ui` - Test type definitions
- `supertest` - HTTP assertion library for API testing

### Frontend
- `react` - UI library
- `react-dom` - React DOM
- `axios` or `fetch` - HTTP client
- UI library (optional): `tailwindcss`, `shadcn/ui`, or `@mui/material`
- `vitest` - Testing framework (works well with Vite)
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM

## Testing Strategy

### Automated Testing
- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test API endpoints and service interactions
- **E2E Tests**: Test complete user flows (optional for MVP)

### Test Scripts
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:watch` - Run tests in watch mode
- `./test.sh` - Comprehensive test automation script

### Test Coverage Goals
- Backend: 80%+ coverage for core services
- Frontend: 70%+ coverage for components and hooks
- Critical paths: 100% coverage (error handling, validation)

## Next Steps

1. ✅ Review and approve this plan
2. ✅ Initialize project structure
3. ✅ Set up backend foundation
4. ✅ Implement LLM abstraction layer
5. Build frontend interface
6. Containerize with Docker
7. Set up automated testing
8. Test locally
9. Prepare for cloud deployment

## Notes
- MVP focus: Keep it simple, add features incrementally
- Educational purpose: Well-documented code with clear architecture
- Extensibility: Easy to add new LLM providers in the future
- Error handling: Graceful degradation when providers are unavailable

