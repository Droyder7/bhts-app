# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
bun install          # Install dependencies
bun dev              # Start all apps in development mode
bun dev:web          # Start only web app (localhost:3001)
bun dev:server       # Start only server (localhost:3000)
bun build            # Build all applications for production
bun start            # Start production builds
bun check            # Run Biome formatting and linting
bun check-types      # TypeScript type checking across all apps
```

### Database Operations
```bash
bun db:push          # Push schema changes to database
bun db:studio        # Open Drizzle Studio (database GUI)
bun db:generate      # Generate database migrations
bun db:migrate       # Run database migrations
bun db:start         # Start local database container
bun db:stop          # Stop local database container
```

### Docker Deployment
```bash
# With external database
docker compose -f docker-compose.yml up --build -d

# With local PostgreSQL
docker compose -f docker-compose.yml -f docker-compose.localdb.yml up --build -d

# Stop services
docker compose down
docker compose down -v  # Also remove volumes (clean DB data)
```

## Architecture Overview

This is a **Turbo monorepo** built with Better-T-Stack featuring:

### Backend (`/apps/server/`)
- **Runtime**: Bun.js
- **Framework**: Hono with oRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (email/password + phone OTP)
- **Key Files**: `src/index.ts`, `src/db/`, `src/routers/`

### Frontend (`/apps/web/`)
- **Framework**: TanStack Start (React 19 + SSR)
- **Routing**: File-based routing with TanStack Router
- **Styling**: TailwindCSS 4 + shadcn/ui components
- **State**: TanStack Query for server state
- **Key Files**: `src/routes/`, `src/components/`, `src/utils/orpc.ts`

### API Structure
- Base URL: `localhost:3000`
- Auth endpoints: `/api/auth/*` (Better Auth)
- RPC endpoints: `/rpc/*` (type-safe API calls)
- Key routers: `expert`, `category`, `specialization`

### Database Schema
Uses Drizzle ORM with these main tables:
- `user`, `session`, `account` - Authentication
- `expert` - Expert profiles with JSON fields for flexible data
- `category`, `specialization` - Content taxonomy
- Role-based access: customer, member, admin

### Authentication Flow
- Better Auth handles sessions via secure cookies
- Role-based access control (RBAC)
- CORS configuration for cross-origin requests
- JWT tokens with automatic expiration

## Development Patterns

### Type Safety
- End-to-end TypeScript with oRPC client
- Compile-time API validation
- Shared types between frontend and backend

### State Management
- TanStack Query for server state
- React state for UI state
- Optimistic updates for better UX

### Styling
- TailwindCSS 4 with component classes
- shadcn/ui for consistent design system
- Responsive design patterns

### Testing
- React Testing Library + JSDOM
- Test files follow `*.test.ts` pattern
- Run tests via `bun test` in individual apps

## Configuration Files

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection
- `CORS_ORIGIN` - Allowed frontend origins
- `BETTER_AUTH_SECRET` - JWT secret key
- `PORT` - Server port (default: 3000)

### Key Config Files
- `turbo.json` - Monorepo build configuration
- `biome.json` - Linting and formatting rules
- `docker-compose.yml` - Production deployment setup
- `drizzle.config.ts` - Database configuration

## Code Style

- Uses Biome for consistent formatting
- TypeScript strict mode enabled
- Husky pre-commit hooks for code quality
- Conventional commit messages preferred