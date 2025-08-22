# bhts-app

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Hono, ORPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Email & password authentication with Better Auth
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```
## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:
```bash
bun db:push
```


Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).



## Project Structure

```
bhts-app/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
│   └── server/      # Backend API (Hono, ORPC)
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun start`: Start all application builds in production mode
- `bun dev:web`: Start only the web application
- `bun dev:server`: Start only the server
- `bun check-types`: Check TypeScript types across all apps
- `bun db:push`: Push schema changes to database
- `bun db:studio`: Open database studio UI
- `bun check`: Run Biome formatting and linting
Here’s a clean and concise section you can drop into your **`README.md`** to explain the deployment flow for your setup:
Here’s an updated **Deployment** section for your `README.md` that covers both scenarios (external DB and local Postgres):

## 🚀 Deployment

We use **Docker Compose** to run the stack (`server + web`) with flexibility for database setup.

### 1. Using External Database

If you already have a database (e.g., cloud-hosted), just provide its URL via `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/app-db
CORS_ORIGIN=http://localhost:3001
BETTER_AUTH_SECRET=your_secret
PORT=3000
```

Run:

```bash
docker compose -f docker-compose.yml up --build -d
```

This starts:

* `server` (backend on port `3000`)
* `web` (frontend on port `3001`)

---

### 2. Using Local Postgres

If no external DB is provided, you can spin up a local Postgres along with the app.

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.localdb.yml up --build -d
```

This starts:

* `postgres` (local DB on port `5432`)
* `server` (backend on port `3000`, waits until Postgres is healthy)
* `web` (frontend on port `3001`)

---

### 3. Stopping Services

To stop and remove containers:

```bash
docker compose down
```

To also remove volumes (clean DB data):

```bash
docker compose down -v
```

## bts config

```
{
  "$schema": "https://r2.better-t-stack.dev/schema.json",
  "version": "2.33.8",
  "createdAt": "2025-08-15T19:08:45.024Z",
  "database": "postgres",
  "orm": "drizzle",
  "backend": "hono",
  "runtime": "bun",
  "frontend": [
    "tanstack-start"
  ],
  "addons": [
    "biome",
    "husky",
    "turborepo"
  ],
  "examples": [],
  "auth": true,
  "packageManager": "bun",
  "dbSetup": "docker",
  "api": "orpc",
  "webDeploy": "none"
}
```