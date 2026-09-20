# Cloud deployment checklist

Cooperative Mitra is deployed as the existing two-service Docker Compose stack: Next.js frontend and FastAPI backend. The backend owns the SQLite data volume and the persistent ChromaDB volume; the Chroma collection remains `cooperative_knowledge` and uses `paraphrase-multilingual-MiniLM-L12-v2`.

## Required production configuration

- Set a strong, unique `SECRET_KEY` outside source control.
- Set `GEMINI_API_KEY` only on the backend service. Never expose it through a `NEXT_PUBLIC_` variable.
- Set `CORS_ORIGINS` to the exact HTTPS frontend origin(s); do not leave development origins enabled in a public deployment.
- Terminate TLS at the hosting platform or reverse proxy and expose only HTTPS publicly.
- Keep `backend_data` and `chroma_data` on provider-backed persistent storage. Do not use an ephemeral filesystem for either volume.
- Leave Ollama private. Gemini is the primary provider; if Ollama is not hosted, the backend's grounded deterministic response remains available when it cannot be reached.

## Smoke test after deployment

1. Visit the HTTPS frontend and confirm `/manifest.json` and the app icon load.
2. Confirm `GET /health` reports a healthy database and available vector store.
3. Register/sign in, send a PMFBY question and a financial-literacy question, and check citations/disclaimers.
4. Check schemes, legal information, grievance submission/tracking and voice controls on a mobile viewport.
5. Restart the backend service and confirm the Chroma collection still contains its indexed records.

The hosting provider is intentionally not prescribed: it must support HTTPS, private secrets, persistent volumes and Docker workloads.
