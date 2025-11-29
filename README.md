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

### Build and run with Docker Compose:

```bash
docker-compose up --build
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/chat` - Send chat message (coming soon)
- `GET /api/providers` - List available providers (coming soon)

## Development

- Backend: `npm run dev` (uses tsx for hot reload)
- Frontend: `npm run dev` (Vite dev server)
- Type checking: `npm run type-check`
- Linting: `npm run lint`

## License

MIT


