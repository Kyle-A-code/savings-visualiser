# Frontend

React SPA for the savings bucket UI. Vite dev server proxies `/api` to the Go backend.

Structure is inspired by [Bulletproof React](https://github.com/alan2207/bulletproof-react) — feature-based folders, a thin API layer, and shared UI kept separate from feature code. Routing uses TanStack Router instead of the guide’s React Router setup.

## Project structure

```
src/
├── app/              # Router, route tree, file-based routes
├── features/         # Domain features (buckets, transactions)
│   └── <feature>/
│       ├── api/      # Fetch functions, query options, mutation hooks
│       ├── components/
│       └── types.ts
├── components/       # Shared UI (dialog, layout, icons, …)
├── lib/              # apiClient and other cross-cutting utilities
├── providers/        # App-wide providers (theme)
└── index.css         # Design tokens and global utilities
```

## Dependencies

- [Node.js](https://nodejs.org/) 20+ (Docker image uses Node 24)
- npm

## Run without Docker

1. Start the [API](../server/README.md) on port `8080`.
2. From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). API requests go to `/api`, proxied to `http://localhost:8080` by default.

To point the proxy elsewhere:

```bash
VITE_API_PROXY_TARGET=http://localhost:8080 npm run dev
```

## Run with Docker

From the **repo root**:

```bash
docker compose up --build frontend
```

Requires the `server` service (Compose starts it automatically). UI: [http://localhost:5173](http://localhost:5173).

For both services together:

```bash
docker compose up --build
```

## Other scripts

```bash
npm run build   # production build to dist/
npm run lint    # ESLint
npm run preview # preview production build
```
