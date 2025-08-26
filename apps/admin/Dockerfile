FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV PORT=5480
ENV VITE_DOCKER_MODE=true

EXPOSE 5480
CMD ["npm", "run", "start"]