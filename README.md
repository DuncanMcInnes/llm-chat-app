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

- `GET /health` - Health check endpoint
- `GET /api/providers` - List available LLM providers and their status
- `POST /api/chat` - Send chat message to selected LLM provider
  - Request body: `{ provider: string, messages: Message[], model?: string }`
  - Response: `{ message: string, provider: string, model: string }`

## Development

- Backend: `npm run dev` (uses tsx for hot reload)
- Frontend: `npm run dev` (Vite dev server)
- Type checking: `npm run type-check`
- Linting: `npm run lint`

## License

MIT


