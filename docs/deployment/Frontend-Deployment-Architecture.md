# Frontend Deployment Architecture

## Overview

This document explains the React frontend deployment architecture for the Enterprise Documentation Platform on DigitalOcean App Platform.

## Current Architecture

### Deployment Method
- **Platform**: DigitalOcean App Platform
- **Build Method**: Dockerfile-based deployment
- **Primary URL**: https://spaghetti-platform-drgev.ondigitalocean.app/

### File Structure
```
/
├── Dockerfile                    # Main deployment configuration
├── src/frontend/                 # React application source
│   ├── nginx.conf               # Nginx configuration for serving React
│   ├── package.json             # Dependencies and build scripts
│   ├── src/                     # React source code
│   │   ├── App.tsx             # Main app component with routing
│   │   ├── main.tsx            # Application entry point
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── contexts/           # React context providers
│   │   └── services/           # API service layer
│   └── dist/                   # Build output (generated)
└── docs/deployment/            # This documentation
```

## Build Process

### Stage 1: React Frontend Build
```dockerfile
FROM node:18-alpine as frontend-builder
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm ci --include=dev           # Include TypeScript for build
COPY src/frontend/ ./
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=/api
ENV VITE_ENVIRONMENT=production
RUN npm run build                  # Outputs to /app/dist
```

### Stage 2: Nginx Production Server
```dockerfile
FROM nginx:alpine
# Copy built React app to nginx html directory
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
# Use existing nginx configuration
COPY src/frontend/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080                        # DigitalOcean App Platform port
```

## Key Configuration Details

### Port Configuration
- **Listen Port**: 8080 (required by DigitalOcean App Platform)
- **Nginx Server**: Listens on 8080, serves React app
- **Health Check**: `GET /health` returns "healthy"

### Routing Configuration
- **Root Path (`/`)**: Serves React application
- **React Router**: All routes fallback to `index.html` for SPA routing
- **API Routes (`/api/*`)**: Proxied to backend (placeholder responses currently)
- **Static Assets**: Cached for 1 year with proper headers

### Environment Variables
- `NODE_ENV=production`: Production build optimizations
- `VITE_API_BASE_URL=/api`: API endpoint configuration
- `VITE_ENVIRONMENT=production`: Application environment

## Build Timeline

### Typical Build Process (~30-45 seconds)
1. **Git Clone** (5s): Fetch source code from repository
2. **Dependencies Install** (20-25s): `npm ci --include=dev`
3. **TypeScript Compilation** (5-10s): `tsc` validates types
4. **Vite Build** (5-10s): Bundles and optimizes React app
5. **Nginx Setup** (2-5s): Copy files and configure server

### Build Optimization Features
- **Multi-stage Build**: Separates build dependencies from runtime
- **Layer Caching**: Docker layers cached for faster subsequent builds
- **Production Bundle**: Minified, tree-shaken, optimized assets

## Troubleshooting Guide

### Common Issues

#### 1. "tsc: not found" Error
**Cause**: Using `--only=production` excludes TypeScript from devDependencies
**Solution**: Use `--include=dev` to include build-time dependencies

#### 2. "Hello! you've requested /" Instead of React App
**Cause**: Wrong port configuration or old deployment cached
**Solution**: Ensure nginx listens on port 8080, not 3000

#### 3. Build Takes >60 Seconds
**Cause**: Build process failing and retrying
**Solution**: Check build logs for specific error messages

#### 4. 404 Errors on React Routes
**Cause**: Missing fallback configuration for SPA routing
**Solution**: Ensure `try_files $uri $uri/ /index.html;` in nginx config

### Debugging Commands

```bash
# Test deployment locally
docker build -t test-frontend .
docker run -p 8080:8080 test-frontend

# Check nginx configuration
nginx -t

# Verify React build output
ls -la /usr/share/nginx/html/
cat /usr/share/nginx/html/index.html
```

## Integration Points

### Database Integration
- **PostgreSQL**: Database ID `90bf4db8-c9e4-4eec-ba8d-91a27be9dcc5`
- **Database Name**: `dbdocumentspaghetti`
- **Connection**: Managed by DigitalOcean, accessible via environment variables

### API Integration
- **Current State**: Placeholder JSON responses at `/api/*`
- **Future**: Will proxy to .NET Core backend service
- **Authentication**: JWT tokens managed by AuthContext

### Static Asset Handling
- **Build Output**: Optimized chunks with content hashing
- **Caching Strategy**: Long-term caching with cache busting
- **CDN**: Served through DigitalOcean's CDN automatically

## Deployment Workflow

### Automated Deployment
1. **Push to GitHub**: Any push to `master` branch triggers deployment
2. **DigitalOcean Detection**: Automatically detects Dockerfile changes
3. **Build Process**: Runs multi-stage Docker build
4. **Health Check**: Verifies `/health` endpoint responds
5. **Traffic Switch**: Updates load balancer to new deployment

### Manual Deployment
1. **DigitalOcean Dashboard**: Force rebuild option available
2. **GitHub Actions**: Could be configured for more complex workflows
3. **CLI Deployment**: `doctl apps create-deployment <app-id>`

## Performance Characteristics

### Bundle Analysis
- **Main Bundle**: ~61kB (17.5kB gzipped)
- **Vendor Bundle**: ~141kB (45kB gzipped)
- **Total**: ~203kB (~63kB gzipped)

### Loading Performance
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s
- **Bundle Chunks**: Lazy-loaded for optimal performance

### Scaling Configuration
- **Instance Count**: 1 (can be increased)
- **Instance Size**: Basic tier (sufficient for frontend)
- **Auto-scaling**: Available based on CPU/memory usage

## Security Configuration

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' [domain]
```

### Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Monitoring & Logging

### Health Monitoring
- **Endpoint**: `GET /health`
- **Response**: `200 "healthy"`
- **Frequency**: Every 30 seconds

### Application Logging
- **Nginx Access Logs**: Request/response logging
- **Nginx Error Logs**: Server error tracking
- **Browser Console**: Client-side error reporting

## Future Improvements

### Planned Enhancements
1. **Backend Integration**: Connect `/api/*` to .NET Core service
2. **SSL Configuration**: Enable HTTPS with custom domain
3. **CDN Optimization**: Implement advanced caching strategies
4. **Monitoring**: Add application performance monitoring
5. **Error Tracking**: Integrate error reporting service

### Scaling Considerations
1. **Multi-region Deployment**: For global performance
2. **Container Orchestration**: Kubernetes for complex deployments
3. **Microservices**: Separate frontend/backend deployments
4. **CI/CD Pipeline**: Automated testing and deployment

---

*Last Updated: 2025-07-25*
*Author: Claude Code Assistant*