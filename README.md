# LLM Chat Interface

A full-stack TypeScript application featuring a chat interface with abstraction layer supporting multiple LLM providers (GPT, Claude, Gemini).

## Features

- 🤖 Multi-provider LLM support (OpenAI, Anthropic, Google)
- 💬 Modern chat interface
- 🐳 Docker containerization
- 📦 TypeScript throughout
- 🎯 MVP for educational purposes

## Project Structure

```
llm-chat-app/
├── backend/          # Express API server
├── frontend/         # React + Vite application
├── docker-compose.yml
└── .env.example
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- API keys for at least one LLM provider:
  - OpenAI API key
  - Anthropic API key
  - Google API key

### Installation

1. **Clone and install dependencies:**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Configure environment variables:**

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys
```

3. **Run development servers:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Docker Deployment

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- `.env` file with your API keys (see `.env.example`)

### Quick Start

1. **Set up environment variables:**

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
# At minimum, add keys for the providers you want to use
```

2. **Build and run with Docker Compose:**

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

3. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

### Docker Commands

```bash
# Start services
docker-compose up

# Start in background (detached)
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose up --build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Docker Architecture

- **Backend**: Multi-stage build with Node.js 20 Alpine
  - Production dependencies only
  - Runs as non-root user
  - Health check enabled
  - Port: 3001

- **Frontend**: Multi-stage build with Vite + Nginx
  - Static files served by Nginx
  - API requests proxied to backend
  - Gzip compression enabled
  - Port: 3000 (mapped to Nginx port 80)

- **Networking**: Services communicate via Docker network
  - Frontend proxies `/api/*` to backend
  - CORS configured for localhost:3000

## API Endpoints

### `GET /health`
Health check endpoint to verify the server is running.

**Example Request:**
```bash
curl http://localhost:3001/health
```

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-27T13:36:52.461Z"
}
```

---

### `GET /api/providers`
List all available LLM providers and their availability status. Used by the frontend to populate the provider selector dropdown.

**Example Request:**
```bash
curl http://localhost:3001/api/providers
```

**Example Response:**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI GPT",
      "available": true
    },
    {
      "id": "anthropic",
      "name": "Anthropic Claude",
      "available": true
    },
    {
      "id": "gemini",
      "name": "Google Gemini",
      "available": true
    }
  ]
}
```

**Usage in Frontend:**
- The `useChat` hook calls this endpoint on mount to load available providers
- Only providers with `available: true` are shown in the UI
- The frontend automatically selects the first available provider

---

### `POST /api/chat`
Send a chat message to the selected LLM provider. This is the main endpoint for chat functionality.

**Request Body:**
```typescript
{
  provider: "openai" | "anthropic" | "gemini",  // Required: which LLM provider to use
  messages: [                                     // Required: conversation history
    {
      role: "user" | "assistant" | "system",     // Required: message role
      content: string                             // Required: message content (min 1 char)
    }
  ],
  model?: string                                  // Optional: override default model
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      {
        "role": "user",
        "content": "Hello! What is TypeScript?"
      }
    ]
  }'
```

**Example Response:**
```json
{
  "message": "TypeScript is a statically typed superset of JavaScript...",
  "provider": "openai",
  "model": "gpt-4"
}
```

**Error Responses:**

*400 Bad Request* - Invalid request format:
```json
{
  "error": "Invalid request",
  "details": [
    {
      "path": ["provider"],
      "message": "Invalid enum value. Expected 'openai' | 'anthropic' | 'gemini'"
    }
  ]
}
```

*500 Internal Server Error* - Provider unavailable or API error:
```json
{
  "error": "Chat request failed",
  "message": "Provider 'openai' is not available. Please check your API keys."
}
```

**Usage in Frontend:**
- The `useChat` hook's `sendMessage()` function calls this endpoint
- Messages array includes the full conversation history (for context)
- The last message in the array must have `role: "user"`
- The response includes the actual model used (which may differ from requested model)
- The frontend displays the model name next to assistant messages

**Example Multi-turn Conversation:**
```bash
# First message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      { "role": "user", "content": "What is React?" }
    ]
  }'

# Follow-up message (includes conversation history)
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      { "role": "user", "content": "What is React?" },
      { "role": "assistant", "content": "React is a JavaScript library..." },
      { "role": "user", "content": "How does it differ from Vue?" }
    ]
  }'
```

**Model Override:**
You can optionally specify a different model than the default:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [{ "role": "user", "content": "Hello" }],
    "model": "gpt-3.5-turbo"
  }'
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture diagrams including:
- System architecture overview
- Module dependency graphs
- Data flow sequences
- LLM provider abstraction pattern
- Docker architecture
- Technology stack visualization

## Development

- Backend: `npm run dev` (uses tsx for hot reload)
- Frontend: `npm run dev` (Vite dev server)
- Type checking: `npm run type-check`
- Linting: `npm run lint`

## License

MIT


