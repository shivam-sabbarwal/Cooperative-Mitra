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

# Build the ignored Chroma artifacts from the tracked sources. Keep these
# inputs in their own layers so dependency/model/index work remains cached
# until the ingestion script or knowledge sources change.
COPY nlp-rag/ingestion.py /app/nlp-rag/ingestion.py
COPY nlp-rag/knowledge_base/raw/ /app/nlp-rag/knowledge_base/raw/
RUN python /app/nlp-rag/ingestion.py \
    && python -c "import chromadb; c = chromadb.PersistentClient(path='/app/nlp-rag/knowledge_base/chroma_db').get_collection('cooperative_knowledge'); count = c.count(); print(f'cooperative_knowledge records: {count}'); assert count > 0, 'cooperative_knowledge is empty after ingestion'"

COPY backend/ /app/backend/

ENV PYTHONPATH=/app
ENV PORT=8000
ENV DATABASE_URL=sqlite:////app/data/cooperative_mitra.db
ENV AUDIO_STORAGE_DIR=/app/data/audio

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]