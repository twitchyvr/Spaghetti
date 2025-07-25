# Optimized React Deployment - Single stage with pre-built assets
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy pre-built React assets (we'll build them locally first)
COPY src/frontend/dist /usr/share/nginx/html

# Simple nginx configuration for React SPA
RUN echo 'events { worker_connections 1024; } \
http { \
    include /etc/nginx/mime.types; \
    default_type application/octet-stream; \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    \
    server { \
        listen 8080; \
        server_name localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        \
        # React Router support \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
        \
        # API placeholder responses \
        location /api/ { \
            add_header Content-Type application/json; \
            return 200 "{\"message\": \"API ready for backend integration\", \"status\": \"frontend_deployed\", \"database\": \"configured\"}"; \
        } \
        \
        # Health check \
        location /health { \
            access_log off; \
            return 200 "healthy"; \
            add_header Content-Type text/plain; \
        } \
        \
        # Static assets with caching \
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
            expires 1y; \
            add_header Cache-Control "public, immutable"; \
        } \
    } \
}' > /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]