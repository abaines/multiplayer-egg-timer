# Stage 1: Install all dependencies and build all packages
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace configuration and all package.json files
COPY package*.json ./
COPY tsconfig.json ./
COPY shared/package*.json ./shared/
COPY shared/tsconfig.json ./shared/
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY frontend/package*.json ./frontend/
COPY frontend/tsconfig.json ./frontend/

# Configure npm to handle SSL certificates (needed in some environments)
RUN npm config set strict-ssl false

# Install all dependencies at workspace root
RUN npm ci

# Copy all source code
COPY scripts/ ./scripts/
COPY shared/ ./shared/
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build all packages in dependency order
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Configure npm to handle SSL certificates (needed in some environments)
RUN npm config set strict-ssl false

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Copy backend source (app.ts, server.ts imports)
COPY --from=builder /app/backend/src ./backend/src

# Expose port
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "backend/dist/server.js"]
