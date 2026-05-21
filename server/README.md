# Server

Go REST API for buckets, transactions, and goals. Uses Gin, GORM, and SQLite.

## Project structure

```
├── handlers/         # HTTP handlers, request validation, response DTOs
├── routes/           # Gin route registration
├── repositories/     # Data access and domain rules (transfers, goal completion)
├── models/           # GORM models
├── database/         # DB connection and migrations
├── query/            # Shared list/pagination params
├── initializers/     # Env loading
└── internal/testutil/ # Test DB helpers
```

Request flow: `routes` → `handlers` → `repositories` → SQLite.

## Dependencies

- [Go](https://go.dev/dl/) 1.26+
- SQLite (embedded via `mattn/go-sqlite3`; no separate DB server)

## Environment

Copy the example and adjust paths if needed:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE` | Yes | Path to the SQLite file (e.g. `savings.db`) |
| `SERVER_ADDR` | No | Bind address (default `0.0.0.0:8080`) |

## Run without Docker

From this directory:

```bash
go run .
```

API listens on `http://localhost:8080` (or `SERVER_ADDR`).

## Run with Docker

From the **repo root**:

```bash
docker compose up --build server
```

Compose sets `DATABASE=/data/savings.db` and mounts a named volume for persistence. Port `8080` is exposed on the host.

To run the full stack (API + UI), use `docker compose up --build` from the root — see the [root README](../README.md).

## Tests

```bash
go test ./...
```
