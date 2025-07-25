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
RUN npm ci --only=production && npm cache clean --force

# Development dependencies
FROM base AS dev-deps
WORKDIR /app
COPY src/frontend/package.json src/frontend/package-lock.json* ./
RUN npm ci && npm cache clean --force

# Development stage
FROM base AS development
WORKDIR /app

# Copy dependencies
COPY --from=dev-deps /app/node_modules ./node_modules

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
COPY --from=dev-deps /app/node_modules ./node_modules

# Copy source code
COPY src/frontend/ .

# Build application
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Production stage
FROM nginx:alpine AS production
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY src/frontend/nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx
RUN adduser -S nginx -u 1001

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chown -R nginx:nginx /var/cache/nginx
RUN chown -R nginx:nginx /var/log/nginx
RUN chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["nginx", "-g", "daemon off;"]