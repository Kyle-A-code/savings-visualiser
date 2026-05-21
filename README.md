# Savings Visualiser

A personal savings bucket tracker: allocate money across buckets, log transactions, set goals, and see progress over time.

## Project goals

- Build a practical full-stack app (Go API + React UI) for personal use on local/LAN only
- Learn Go with Gin/GORM, SQLite, and repository-style domain logic
- Get some experience with Tanstack Router as I enjoy Query
- Ship a v1 that is usable and explainable — not a long-lived product roadmap

Intentional scope and trade-offs are documented in [DECISIONS.md](./DECISIONS.md).

## Structure

| Path | Role |
|------|------|
| [`server/`](./server/) | Go REST API, SQLite persistence |
| [`frontend/`](./frontend/) | React + Vite SPA |
| [`compose.yml`](./compose.yml) | Docker Compose for both services |

## Quick start (Docker)

From the repo root:

```bash
docker compose up --build
```

- App: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:8080](http://localhost:8080)

## App READMEs

- [Server](./server/README.md) — API dependencies, env vars, native and Docker run
- [Frontend](./frontend/README.md) — UI dependencies, native and Docker run
