# Docker Sandbox Environment for AI-Generated Code Loop
FROM node:20-slim

# Install necessary build tools, git, and rsync for fast copying
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    rsync \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm and typescript globally
RUN npm install -g pnpm typescript ts-node \
    && pnpm config set store-dir /tmp/.pnpm-store

WORKDIR /workspace

# This container is designed to be run Ephemerally per AI execution
# Usage: docker run --rm -v $(pwd):/workspace --memory="1g" --cpus="1.0" ai-sandbox:latest sh -c "pnpm install && pnpm test"
