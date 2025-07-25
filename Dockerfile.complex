# Simplified Dockerfile for React Frontend with nginx
# This serves the React app at root with placeholder API responses

# -- Stage 1: Build React Frontend -- #
FROM node:18-alpine as frontend-builder
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm ci --include=dev
COPY src/frontend/ ./
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=/api
ENV VITE_ENVIRONMENT=production
RUN npm run build

# -- Stage 2: Production nginx server -- #
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built React application
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY src/frontend/nginx.conf /etc/nginx/nginx.conf

# Create nginx directories and set permissions
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/log/nginx /var/cache/nginx /var/run/nginx

# Health check on port 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port 8080 for DigitalOcean App Platform
EXPOSE 8080

# Debugging and start nginx
CMD echo "=== REACT FRONTEND DEPLOYMENT ===" && \
    echo "React files:" && ls -la /usr/share/nginx/html/ && \
    echo "Starting nginx..." && \
    nginx -t && \
    exec nginx -g "daemon off;"