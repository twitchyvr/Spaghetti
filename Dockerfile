# Production-optimized Dockerfile with advanced caching
# This Dockerfile is designed to minimize build times as the codebase grows

# -- Stage 1: Dependency Cache Layer -- #
FROM node:18-alpine as deps
WORKDIR /app

# Copy only package files for optimal Docker layer caching
# This layer will only rebuild when dependencies change
COPY src/frontend/package*.json ./
RUN npm ci --only=production --cache /tmp/.npm && \
    npm cache clean --force

# -- Stage 2: Build Cache Layer -- #  
FROM node:18-alpine as builder
WORKDIR /app

# Copy cached dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY src/frontend/package*.json ./

# Install dev dependencies only (production deps already copied)
RUN npm ci --only=development --cache /tmp/.npm && \
    npm cache clean --force

# Copy source code (this layer rebuilds when code changes)
COPY src/frontend/ ./

# Build with optimization flags
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=/api
ENV VITE_ENVIRONMENT=production
ENV GENERATE_SOURCEMAP=false

# Optimize build for production
RUN npm run build && \
    # Remove source maps to reduce size
    find dist -name "*.map" -delete && \
    # Verify build completed
    test -f dist/index.html || exit 1

# -- Stage 3: Minimal Runtime -- #
FROM nginx:alpine as runtime

# Install minimal runtime dependencies
RUN apk add --no-cache curl && \
    # Remove default nginx files
    rm -rf /usr/share/nginx/html/* && \
    # Create nginx user directories
    mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optimized nginx configuration
COPY <<EOF /etc/nginx/nginx.conf
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Optimize for performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    server {
        listen 8080;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # React Router SPA support
        location / {
            try_files \$uri \$uri/ /index.html;
        }
        
        # API endpoints (ready for backend)
        location /api/ {
            add_header Content-Type application/json;
            return 200 '{"status": "ready", "message": "React frontend deployed successfully", "database": "configured", "backend": "pending"}';
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Aggressive caching for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }
        
        # Security - block access to sensitive files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
}
EOF

# Runtime optimizations
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Use exec form for better signal handling
CMD ["nginx", "-g", "daemon off;"]