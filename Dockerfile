# Stage 1: Build shared types
FROM node:20-alpine AS shared-builder
WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm ci
COPY shared/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
COPY --from=shared-builder /app/shared /app/shared
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
COPY --from=shared-builder /app/shared /app/shared
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 4: Production runtime
FROM node:20-alpine
WORKDIR /app

# Copy backend dependencies and built code
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=shared-builder /app/shared /app/shared

# Copy frontend built assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/server.js"]
