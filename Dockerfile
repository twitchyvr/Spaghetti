# Multi-stage Dockerfile for React Frontend + nginx reverse proxy
# This serves the React app at root and proxies /api calls to the backend

# -- Stage 1 -- #
# Build React Frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm ci --include=dev
COPY src/frontend/ ./
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=/api
ENV VITE_ENVIRONMENT=production
RUN npm run build

# -- Stage 2 -- #
# Production server with nginx serving React app and proxying API
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Install curl, supervisor for health checks and process management
RUN apk add --no-cache curl supervisor

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built React application
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for serving React + API proxy
COPY nginx/nginx.prod.conf /etc/nginx/nginx.conf

# Create nginx directories and set permissions
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/log/nginx /var/cache/nginx /var/run/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose port 80 for web traffic
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]