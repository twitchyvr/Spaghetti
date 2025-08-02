# Multi-stage build for React frontend deployment
FROM node:18-alpine AS builder

WORKDIR /app

# Install Python and build dependencies for native npm packages
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY src/frontend/package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/frontend/ ./

# Set build arguments for environment variables
ARG VITE_API_BASE_URL=/api
ARG VITE_ENVIRONMENT=production
ARG VITE_DEPLOYMENT_TYPE=digitalocean
ARG VITE_DEMO_MODE=false

# Build React app with production environment
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_DEPLOYMENT_TYPE=$VITE_DEPLOYMENT_TYPE
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built React assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY src/frontend/nginx.conf /etc/nginx/nginx.conf


EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]