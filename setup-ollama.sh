#!/bin/bash

# OLLAMA Setup Script
# Detects hardware and sets up OLLAMA accordingly

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 OLLAMA Setup for LLM Chat App${NC}"
echo ""

# Source hardware detection
HARDWARE_INFO=$(./detect-hardware.sh)
HARDWARE_TYPE=$(echo "$HARDWARE_INFO" | grep "HARDWARE_TYPE=" | cut -d'=' -f2)
RECOMMENDED_MODE=$(echo "$HARDWARE_INFO" | grep "RECOMMENDED_MODE=" | cut -d'=' -f2)

echo -e "${GREEN}Detected hardware: $HARDWARE_TYPE${NC}"
echo -e "${GREEN}Recommended mode: $RECOMMENDED_MODE${NC}"
echo ""

case "$HARDWARE_TYPE" in
  apple_silicon)
    echo -e "${YELLOW}🍎 Apple Silicon (M-series) Detected${NC}"
    echo ""
    echo "For best Metal acceleration performance, OLLAMA should run natively (not in Docker)."
    echo ""
    echo "Option 1: Native OLLAMA (Recommended for Metal acceleration)"
    echo "  1. Install OLLAMA: brew install ollama"
    echo "  2. Start OLLAMA: ollama serve"
    echo "  3. Use docker-compose.mac-metal.yml (connects to native OLLAMA)"
    echo ""
    echo "Option 2: Docker OLLAMA (Limited Metal support)"
    echo "  1. Use standard docker-compose.yml"
    echo "  2. OLLAMA will run in Docker (slower on Mac)"
    echo ""
    read -p "Do you want to install OLLAMA natively? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if ! command -v ollama &> /dev/null; then
            echo "Installing OLLAMA via Homebrew..."
            brew install ollama
        else
            echo "OLLAMA is already installed."
        fi
        
        echo ""
        echo "Starting OLLAMA natively..."
        echo "Note: This will run in the background. To stop: ollama stop"
        
        # Check if OLLAMA is already running
        if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            ollama serve &
            sleep 3
            echo "OLLAMA started!"
        else
            echo "OLLAMA is already running."
        fi
        
        echo ""
        echo "Pulling recommended models..."
        ollama pull mistral
        ollama pull llama3
        
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo "Use: docker-compose -f docker-compose.mac-metal.yml up"
    else
        echo "Using Docker setup instead."
        echo "Use: docker-compose up"
    fi
    ;;
    
  nvidia_gpu)
    echo -e "${YELLOW}🎮 NVIDIA GPU Detected${NC}"
    echo ""
    echo "Setting up OLLAMA with GPU acceleration..."
    echo ""
    echo "Make sure NVIDIA Container Toolkit is installed:"
    echo "  https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html"
    echo ""
    read -p "Continue with GPU setup? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting services with GPU support..."
        docker-compose -f docker-compose.nvidia-gpu.yml up -d ollama
        
        echo "Waiting for OLLAMA to be ready..."
        sleep 10
        
        echo "Pulling models..."
        docker exec -it llm-chat-ollama ollama pull mistral
        docker exec -it llm-chat-ollama ollama pull llama3
        
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo "Start all services: docker-compose -f docker-compose.nvidia-gpu.yml up"
    fi
    ;;
    
  cpu_only)
    echo -e "${YELLOW}💻 CPU-only Setup${NC}"
    echo ""
    echo "Setting up OLLAMA for CPU-only operation..."
    echo "Note: This will be slower than GPU-accelerated setups."
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting services..."
        docker-compose up -d ollama
        
        echo "Waiting for OLLAMA to be ready..."
        sleep 10
        
        echo "Pulling models (this may take a while on CPU)..."
        docker exec -it llm-chat-ollama ollama pull mistral
        docker exec -it llm-chat-ollama ollama pull llama3
        
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo "Start all services: docker-compose up"
    fi
    ;;
    
  *)
    echo "Unknown hardware type. Using default CPU setup."
    docker-compose up -d ollama
    ;;
esac

