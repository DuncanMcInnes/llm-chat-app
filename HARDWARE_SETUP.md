# Hardware-Specific OLLAMA Setup Guide

This guide explains how to configure OLLAMA based on your hardware for optimal performance.

## Hardware Detection

Run the detection script to see what hardware you have:

```bash
./detect-hardware.sh
```

This will identify:
- **Apple Silicon (M-series)**: Mac M1/M2/M3/M4
- **NVIDIA GPU**: Linux systems with NVIDIA graphics
- **CPU-only**: Systems without GPU acceleration

## Setup Options by Hardware

### 🍎 Mac M-series (Apple Silicon)

**Best Option: Native OLLAMA with Metal Acceleration**

Metal is Apple's GPU framework and provides excellent acceleration on M-series chips.

#### Setup Steps:

1. **Install OLLAMA natively** (not in Docker):
   ```bash
   brew install ollama
   ```

2. **Start OLLAMA natively**:
   ```bash
   ollama serve
   ```
   This runs OLLAMA with full Metal acceleration.

3. **Pull models**:
   ```bash
   ollama pull mistral      # Mistral 7B (~4GB)
   ollama pull llama3       # LLaMA3 8B (~4.7GB)
   ```

4. **Start your app** (connects to native OLLAMA):
   ```bash
   docker-compose -f docker-compose.mac-metal.yml up --build
   ```

**Why Native?**
- Full Metal GPU acceleration
- Better performance than Docker on Mac
- Lower overhead
- Direct hardware access

**Alternative: Docker OLLAMA**
If you prefer everything in Docker:
```bash
docker-compose up --build
```
Note: Metal acceleration in Docker on Mac is limited.

---

### 🎮 Linux with NVIDIA GPU

**Best Option: Docker with GPU Support**

NVIDIA GPUs work great in Docker with proper configuration.

#### Prerequisites:

1. **Install NVIDIA drivers**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install nvidia-driver-xxx
   ```

2. **Install NVIDIA Container Toolkit**:
   ```bash
   # Add repository
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

   # Install
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

3. **Verify GPU access**:
   ```bash
   docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
   ```

#### Setup Steps:

1. **Start services with GPU**:
   ```bash
   docker-compose -f docker-compose.nvidia-gpu.yml up --build
   ```

2. **Pull models**:
   ```bash
   docker exec -it llm-chat-ollama ollama pull mistral
   docker exec -it llm-chat-ollama ollama pull llama3
   ```

**Performance:**
- GPU acceleration provides 5-10x speedup
- Can run larger models efficiently
- Multiple models can share GPU memory

---

### 💻 CPU-only Systems

**Option: Standard Docker Setup**

Works on any system but will be slower, especially for larger models.

#### Setup Steps:

1. **Start services**:
   ```bash
   docker-compose up --build
   ```

2. **Pull models** (this will be slow):
   ```bash
   docker exec -it llm-chat-ollama ollama pull mistral
   docker exec -it llm-chat-ollama ollama pull llama3
   ```

**Recommendations for CPU-only:**
- Use smaller models (mistral, phi, tinyllama)
- Consider cloud providers for better performance
- Be patient with model downloads and inference

---

## Automated Setup

Use the setup script for guided installation:

```bash
./setup-ollama.sh
```

This script will:
1. Detect your hardware
2. Recommend the best setup
3. Guide you through installation
4. Pull recommended models

---

## Performance Comparison

| Hardware | Setup | Speed | Notes |
|----------|-------|-------|-------|
| Mac M4 | Native + Metal | ⚡⚡⚡⚡⚡ | Best for Mac |
| Mac M4 | Docker | ⚡⚡⚡ | Limited Metal |
| NVIDIA GPU | Docker + GPU | ⚡⚡⚡⚡⚡ | Best for Linux |
| CPU-only | Docker | ⚡⚡ | Slow but works |

---

## Troubleshooting

### Mac: OLLAMA not connecting from Docker

If using native OLLAMA, ensure:
- OLLAMA is running: `ollama serve`
- Backend uses `host.docker.internal:11434`
- Use `docker-compose.mac-metal.yml`

### Linux: GPU not detected in Docker

1. Verify NVIDIA Container Toolkit:
   ```bash
   docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
   ```

2. Check Docker GPU support:
   ```bash
   docker info | grep -i runtime
   ```

3. Restart Docker:
   ```bash
   sudo systemctl restart docker
   ```

### Model not found

Always pull models after OLLAMA starts:
```bash
# Native
ollama pull <model-name>

# Docker
docker exec -it llm-chat-ollama ollama pull <model-name>
```

---

## Switching Between Setups

You can switch between setups by using different docker-compose files:

```bash
# Mac native OLLAMA
docker-compose -f docker-compose.mac-metal.yml up

# NVIDIA GPU
docker-compose -f docker-compose.nvidia-gpu.yml up

# CPU-only / Standard
docker-compose up
```

The backend automatically connects to the correct OLLAMA instance based on the `OLLAMA_BASE_URL` environment variable.

