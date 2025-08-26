# BHTS Admin App

This is the admin application for the BHTS (Business Health Tracking System) built with Kottster framework. The app provides two deployment methods:
- **Option 1:** Using Docker Compose (recommended)
- **Option 2:** Using Docker commands directly

## Prerequisites

- Docker and Docker Compose installed
- `.env` file configured (copy from `.env.example`)

## Option 1: Using Docker Compose (Recommended)

### 1. Setup environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
```

### 2. Build and start the application

```bash
# Build and start in production mode
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

The application will be available at `http://localhost:5480`

### 3. Container Management

**Stop the container:**
```bash
docker-compose down
```

**View container logs:**
```bash
docker-compose logs -f
```

**Rebuild after changes:**
```bash
docker-compose up --build
```

## Option 2: Using Docker Commands

### 1. Setup environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
```

### 2. Build the Docker image

```bash
docker build -t bhts-admin .
```

### 3. Run the container

```bash
docker run -d --name bhts-admin \
  -p 5480:5480 \
  --env-file .env \
  -e NODE_ENV=production \
  -e PORT=5480 \
  -e VITE_DOCKER_MODE=true \
  --restart unless-stopped \
  bhts-admin
```

> Here's what each flag does:
> - `-d` - Run the container in the background
> - `--name bhts-admin` - Assign a name to the container
> - `-p 5480:5480` - Map port 5480 from container to host
> - `--env-file .env` - Load environment variables from .env file
> - `-e` - Set additional environment variables
> - `--restart unless-stopped` - Restart policy for the container

The application will be available at `http://localhost:5480`

### 4. Container Management

**Stop the container:**
```bash
docker stop bhts-admin
```

**Remove the container:**
```bash
docker rm bhts-admin
```

**View container logs:**
```bash
docker logs -f bhts-admin
```

**Restart the container:**
```bash
docker restart bhts-admin
```

## Development

For development with live reloading, you can run the application locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will be available at `http://localhost:5480`

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Database configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bhts_admin

# Application settings
PORT=5480
NODE_ENV=production
VITE_DOCKER_MODE=true
```

### Customizing Ports

#### With Docker Compose:
Edit the `ports` section in your `docker-compose.yml` file:

```yaml
ports:
  - "<host-port>:5480"
```

#### With Docker commands:
Modify the `-p` flag in the Docker run command:

```bash
docker run -d --name bhts-admin \
  -p <host-port>:5480 \
  --env-file .env \
  bhts-admin
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the host port in docker-compose.yml or Docker run command
2. **Environment variables not loaded**: Ensure `.env` file exists and is properly formatted
3. **Build failures**: Check that all dependencies are properly installed

### Useful Commands

```bash
# Check container status
docker ps

# View detailed logs
docker-compose logs -f app

# Rebuild without cache
docker-compose build --no-cache

# Clean up Docker resources
docker system prune
```