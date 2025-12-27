# LLM Chat App - Local Deployment with OLLAMA

This branch (`local-ollama`) includes support for local LLM deployment using OLLAMA, in addition to the cloud-based providers (OpenAI, Anthropic, Gemini).

## What's Different in This Branch?

- **OLLAMA Integration**: Added support for running local LLMs through OLLAMA
- **Docker Compose**: Includes an OLLAMA service container
- **No API Keys Required**: OLLAMA runs locally, no external API keys needed
- **Privacy**: All conversations with OLLAMA stay on your local machine

## Quick Start

### Automatic Hardware Detection & Setup

The easiest way to get started is using the automated setup script:

```bash
./setup-ollama.sh
```

This script will:
1. Detect your hardware (Mac M-series, NVIDIA GPU, or CPU-only)
2. Recommend the best setup for your system
3. Configure OLLAMA accordingly
4. Pull recommended models

### Manual Setup by Hardware Type

#### 🍎 Mac M-series (Apple Silicon) - Metal Acceleration

**Recommended: Native OLLAMA** (best Metal performance)

```bash
# 1. Install OLLAMA natively (uses Metal acceleration)
brew install ollama

# 2. Start OLLAMA natively
ollama serve

# 3. Pull models
ollama pull mistral
ollama pull llama3

# 4. Start app (connects to native OLLAMA)
docker-compose -f docker-compose.mac-metal.yml up --build
```

**Alternative: Docker OLLAMA** (limited Metal support)

```bash
docker-compose up --build
docker exec -it llm-chat-ollama ollama pull mistral
```

#### 🎮 Linux with NVIDIA GPU

```bash
# 1. Ensure NVIDIA Container Toolkit is installed
# See: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/

# 2. Start with GPU support
docker-compose -f docker-compose.nvidia-gpu.yml up --build

# 3. Pull models
docker exec -it llm-chat-ollama ollama pull mistral
docker exec -it llm-chat-ollama ollama pull llama3
```

#### 💻 CPU-only (Linux/Mac/Windows)

```bash
# 1. Start services
docker-compose up --build

# 2. Pull models (slower on CPU)
docker exec -it llm-chat-ollama ollama pull mistral
docker exec -it llm-chat-ollama ollama pull llama3
```

**Note**: Model downloads can be large (several GB). The first pull may take time.

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- OLLAMA API: http://localhost:11434

### 4. Use OLLAMA in the Chat Interface

1. Open the chat interface
2. Select "OLLAMA (Local)" from the provider dropdown
3. Start chatting!

## Available OLLAMA Models

Popular models you can use:

- **llama2** - Meta's Llama 2 (default, ~4GB)
- **mistral** - Mistral 7B (fast, efficient)
- **codellama** - Code-focused Llama model
- **phi** - Microsoft's Phi model (small, fast)
- **neural-chat** - Intel's fine-tuned model
- **starling-lm** - Open source chat model

See all available models: https://ollama.com/library

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# OLLAMA Configuration
OLLAMA_BASE_URL=http://ollama:11434  # Use 'ollama' hostname in Docker, 'localhost' for local dev
OLLAMA_DEFAULT_MODEL=llama2
```

### Changing the Default Model

Edit `.env`:
```env
OLLAMA_DEFAULT_MODEL=mistral
```

Or specify the model in the chat request.

## Hardware-Specific Configurations

### Mac M-series (Apple Silicon)

**Best Performance: Native OLLAMA with Metal**

Metal acceleration works best when OLLAMA runs natively on macOS:

```bash
# Install and run natively
brew install ollama
ollama serve

# Use the Mac-specific docker-compose
docker-compose -f docker-compose.mac-metal.yml up
```

The backend will connect to native OLLAMA via `host.docker.internal:11434`.

### Linux with NVIDIA GPU

Use the GPU-enabled configuration:

```bash
docker-compose -f docker-compose.nvidia-gpu.yml up
```

**Prerequisites:**
- NVIDIA drivers installed
- NVIDIA Container Toolkit installed
- Docker configured for GPU access

### CPU-only Systems

Use the standard configuration:

```bash
docker-compose up
```

Note: CPU-only will be slower, especially for larger models.

## Troubleshooting

### OLLAMA Not Available in Provider List

1. Check if OLLAMA container is running:
   ```bash
   docker ps | grep ollama
   ```

2. Check OLLAMA logs:
   ```bash
   docker logs llm-chat-ollama
   ```

3. Test OLLAMA API directly:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Model Not Found Error

Make sure you've pulled the model:
```bash
docker exec -it llm-chat-ollama ollama pull <model-name>
```

### Connection Refused

- Ensure OLLAMA container is on the same Docker network
- Check that `OLLAMA_BASE_URL` in backend matches the service name (`http://ollama:11434`)

## Using Multiple Providers

This branch supports all providers simultaneously:
- **OLLAMA** - Local, private, no API keys
- **OpenAI** - Cloud-based (requires API key)
- **Anthropic** - Cloud-based (requires API key)
- **Gemini** - Cloud-based (requires API key)

You can switch between providers in the UI at any time!

## Differences from Main Branch

| Feature | Main Branch | Local Branch |
|---------|-------------|--------------|
| OLLAMA Support | ❌ | ✅ |
| Cloud Providers | ✅ | ✅ |
| Docker Compose | Backend + Frontend | Backend + Frontend + OLLAMA |
| API Keys Required | Yes (for cloud) | Optional (only for cloud) |
| Privacy | Depends on provider | Full privacy with OLLAMA |

## Development

For local development (outside Docker):

1. Start OLLAMA separately:
   ```bash
   docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
   ```

2. Set in `.env`:
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   ```

3. Run backend and frontend as usual:
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

## Next Steps

- Pull different models and compare performance
- Experiment with model parameters
- Consider GPU acceleration for faster responses
- Use OLLAMA for sensitive/private conversations

