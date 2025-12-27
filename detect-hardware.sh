#!/bin/bash

# Hardware Detection Script for OLLAMA Configuration
# Detects hardware and recommends OLLAMA setup

detect_hardware() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"
    
    echo "🔍 Detecting hardware..."
    echo "OS: $OS"
    echo "Architecture: $ARCH"
    
    # Detect macOS Apple Silicon
    if [[ "$OS" == "Darwin" && "$ARCH" == "arm64" ]]; then
        # Check for Apple Silicon chip
        CHIP=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "")
        if [[ "$CHIP" == *"Apple"* ]]; then
            echo "✅ Detected: Apple Silicon (M-series)"
            echo "HARDWARE_TYPE=apple_silicon"
            echo "RECOMMENDED_MODE=native_metal"
            return 0
        fi
    fi
    
    # Detect NVIDIA GPU (Linux)
    if [[ "$OS" == "Linux" ]]; then
        if command -v nvidia-smi &> /dev/null; then
            GPU_INFO=$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | head -1)
            if [[ -n "$GPU_INFO" ]]; then
                echo "✅ Detected: NVIDIA GPU"
                echo "GPU: $GPU_INFO"
                echo "HARDWARE_TYPE=nvidia_gpu"
                echo "RECOMMENDED_MODE=docker_gpu"
                return 0
            fi
        fi
    fi
    
    # Default: CPU-only
    echo "ℹ️  Detected: CPU-only (no GPU acceleration)"
    echo "HARDWARE_TYPE=cpu_only"
    echo "RECOMMENDED_MODE=docker_cpu"
    return 0
}

# Run detection
detect_hardware

