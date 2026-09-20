FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend/ /app/backend/
COPY config/ /app/config/
# The retrieval service reads this persisted collection at runtime.
COPY nlp-rag/ /app/nlp-rag/

ENV PYTHONPATH=/app
ENV PORT=8000
ENV DATABASE_URL=sqlite:////app/data/cooperative_mitra.db
ENV AUDIO_STORAGE_DIR=/app/data/audio

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
