# LLM Chat Interface - Project Plan

## Project Overview
A full-stack TypeScript application featuring a chat interface with abstraction layer supporting multiple LLM providers (GPT, Claude, Gemini, OLLAMA). Built as an MVP for educational purposes, deployable via Docker.

### Branching Strategy
The project uses a branching strategy to support different deployment scenarios:

- **`main` branch**: Cloud deployment version
  - Supports: OpenAI, Anthropic, Gemini
  - Optimized for cloud deployment (Digital Ocean, etc.)
  - Standard Docker Compose setup

- **`local-ollama` branch**: Local deployment with OLLAMA
  - Supports: OpenAI, Anthropic, Gemini, **OLLAMA (Local)**
  - Hardware detection and optimization
  - Mac M-series: Native OLLAMA with Metal acceleration
  - Linux NVIDIA: Docker OLLAMA with GPU support
  - CPU-only: Standard Docker OLLAMA

## Architecture

### Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript
- **LLM Providers**: 
  - **Cloud**: OpenAI (GPT), Anthropic (Claude), Google (Gemini)
  - **Local**: OLLAMA (with hardware-optimized setup)
- **Containerization**: Docker + Docker Compose
- **Package Manager**: npm
- **Testing**: Jest (backend), Vitest (frontend)

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
│   │   │   │   ├── OllamaService.ts    # OLLAMA implementation (local-ollama branch)
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
├── docker-compose.yml              # Standard/CPU-only setup
├── docker-compose.mac-metal.yml    # Mac M-series (native OLLAMA)
├── docker-compose.nvidia-gpu.yml   # Linux with NVIDIA GPU
├── .env.example
├── .gitignore
├── test.sh                  # Comprehensive test automation script
├── test-api.sh              # API endpoint testing script
├── detect-hardware.sh       # Hardware detection (local-ollama branch)
├── setup-ollama.sh          # Automated OLLAMA setup (local-ollama branch)
├── README.md                # Main documentation
├── README_LOCAL.md          # Local deployment guide (local-ollama branch)
├── HARDWARE_SETUP.md       # Hardware-specific setup (local-ollama branch)
├── ARCHITECTURE.md          # Architecture diagrams
└── TESTING.md               # Testing documentation
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
   - **OLLAMA Service**: HTTP client for local OLLAMA API (local-ollama branch)
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

### Phase 5.5: OLLAMA Local LLM Integration (local-ollama branch)
**Goal**: Add local LLM support with hardware optimization

1. OLLAMA Service Implementation
   - Create OllamaService implementing LLMProvider
   - HTTP client for OLLAMA API
   - Error handling and connection management

2. Hardware Detection
   - Detect Mac M-series (Apple Silicon)
   - Detect NVIDIA GPU (Linux)
   - Fallback to CPU-only configuration

3. Hardware-Specific Docker Compose
   - Mac M-series: Native OLLAMA with Metal acceleration
   - NVIDIA GPU: Docker OLLAMA with GPU support
   - CPU-only: Standard Docker OLLAMA

4. Automated Setup Scripts
   - Hardware detection script
   - Automated OLLAMA installation and configuration
   - Model pulling automation

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

# OLLAMA Configuration (local-ollama branch only)
OLLAMA_BASE_URL=http://localhost:11434  # or http://ollama:11434 for Docker
OLLAMA_DEFAULT_MODEL=mistral             # or llama3, llama2, etc.
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
  "provider": "openai" | "anthropic" | "gemini" | "ollama",
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" }
  ],
  "model": "gpt-4" (optional, provider-specific)
}
```

**Note**: `"ollama"` provider available only in `local-ollama` branch.

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
    { "id": "gemini", "name": "Google Gemini", "available": true },
    { "id": "ollama", "name": "OLLAMA (Local)", "available": true }
  ]
}
```

**Note**: `"ollama"` provider appears only in `local-ollama` branch when configured.

## Deployment Strategy

### Branch Selection
- **`main` branch**: Use for cloud deployment (Digital Ocean, AWS, etc.)
- **`local-ollama` branch**: Use for local deployment with OLLAMA support

### Local Docker Deployment (main branch)
1. Build images: `docker-compose build`
2. Run containers: `docker-compose up`
3. Access: `http://localhost:3000` (frontend), `http://localhost:3001` (backend)

### Local Deployment with OLLAMA (local-ollama branch)
1. **Mac M-series (Recommended: Native OLLAMA)**
   - Install OLLAMA: `brew install ollama`
   - Start OLLAMA: `brew services start ollama`
   - Pull models: `ollama pull mistral`
   - Start app: `docker-compose -f docker-compose.mac-metal.yml up`

2. **Linux with NVIDIA GPU**
   - Install NVIDIA Container Toolkit
   - Start services: `docker-compose -f docker-compose.nvidia-gpu.yml up`
   - Pull models: `docker exec -it llm-chat-ollama ollama pull mistral`

3. **CPU-only**
   - Start services: `docker-compose up`
   - Pull models: `docker exec -it llm-chat-ollama ollama pull mistral`

4. **Automated Setup**
   - Run: `./setup-ollama.sh` (detects hardware and guides setup)

### Cloud Deployment (Digital Ocean) - main branch
1. Create Dockerfile optimizations for production
2. Set up environment variables in cloud platform
3. Configure domain and SSL
4. Set up CI/CD pipeline (optional)
5. **Note**: OLLAMA not included in cloud deployment (use cloud providers)

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

## Implementation Status

### Completed Phases ✅
1. ✅ Project setup & backend foundation
2. ✅ LLM abstraction layer (OpenAI, Anthropic, Gemini)
3. ✅ Chat API endpoints
4. ✅ Frontend chat interface
5. ✅ Docker configuration
6. ✅ Documentation & polish
7. ✅ Automated testing infrastructure
8. ✅ OLLAMA local LLM integration (local-ollama branch)
9. ✅ Hardware detection and optimization

### Next Steps

**Main Branch (Cloud Deployment)**
- [ ] Deploy to Digital Ocean
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Set up domain and SSL

**Local-OLLAMA Branch (Local Deployment)**
- [x] OLLAMA integration complete
- [x] Hardware detection working
- [x] Mac M-series Metal acceleration tested
- [ ] Test on Linux with NVIDIA GPU (if available)
- [ ] Performance benchmarking

## Notes
- MVP focus: Keep it simple, add features incrementally
- Educational purpose: Well-documented code with clear architecture
- Extensibility: Easy to add new LLM providers in the future
- Error handling: Graceful degradation when providers are unavailable
- Branching: Separate branches for different deployment scenarios
- Hardware optimization: Automatic detection and configuration for best performance
- Privacy: OLLAMA option keeps conversations local (no external API calls)

## Branch-Specific Features

### Main Branch
- Cloud-optimized deployment
- Three cloud LLM providers (OpenAI, Anthropic, Gemini)
- Standard Docker Compose setup
- Ready for Digital Ocean deployment

### Local-OLLAMA Branch
- All features from main branch
- Plus: OLLAMA local LLM support
- Hardware detection and optimization
- Mac M-series: Native OLLAMA with Metal
- Linux NVIDIA: Docker OLLAMA with GPU
- CPU-only: Standard Docker OLLAMA
- Privacy-focused local option

