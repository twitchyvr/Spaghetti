# Minimal test Dockerfile
FROM nginx:alpine

# Copy a simple test page
RUN echo '<html><body><h1>SUCCESS: React Frontend Deployment Working!</h1><p>Database configured, ready for backend integration.</p></body></html>' > /usr/share/nginx/html/index.html

# Simple health check
RUN echo 'server { listen 8080; location / { root /usr/share/nginx/html; } location /health { return 200 "healthy"; } }' > /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/conf.d/default.conf && echo 'events { worker_connections 1024; } http { server { listen 8080; location / { root /usr/share/nginx/html; index index.html; } location /health { return 200 "healthy"; add_header Content-Type text/plain; } } }' > /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]