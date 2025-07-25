# Multi-stage Dockerfile for Enterprise Documentation Platform Frontend

# Base Node.js image
FROM node:18-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat curl

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY src/frontend/package.json src/frontend/package-lock.json* ./
RUN npm ci --include=dev && npm cache clean --force

# Development stage
FROM base AS development
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src/frontend/ .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactjs -u 1001
RUN chown -R reactjs:nodejs /app
USER reactjs

# Expose port
EXPOSE 3000

# Development server with hot reload
ENV NODE_ENV=development
ENV VITE_API_BASE_URL=http://localhost:5000/api
ENV VITE_ENVIRONMENT=development

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src/frontend/ .

# Build application with production environment
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=/api
ENV VITE_ENVIRONMENT=production

# Build the application
RUN npm run build

# Verify build output
RUN ls -la /app/dist && \
    test -f /app/dist/index.html || (echo "Build failed: index.html not found" && exit 1)

# Production stage - simple static file server
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Ensure index.html exists
RUN test -f /usr/share/nginx/html/index.html || (echo "Production build failed: index.html not found" && exit 1)

# Copy optimized nginx configuration for static serving
COPY src/frontend/nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]