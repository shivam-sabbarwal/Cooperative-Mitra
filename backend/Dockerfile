FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt

# Install CPU-only PyTorch to avoid unnecessary NVIDIA/CUDA packages
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch==2.2.2+cpu

RUN pip install --no-cache-dir \
    -r /app/backend/requirements.txt

RUN mkdir -p /app/data/audio

COPY backend/ /app/backend/

# Persisted RAG knowledge base
COPY nlp-rag/ /app/nlp-rag/

ENV PYTHONPATH=/app
ENV PORT=8000
ENV DATABASE_URL=sqlite:////app/data/cooperative_mitra.db
ENV AUDIO_STORAGE_DIR=/app/data/audio

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]