# DigitalOcean Deployment Guide

Enterprise Documentation Platform

## Overview

This guide provides comprehensive instructions for deploying the Enterprise Documentation Platform on DigitalOcean, with integration options for Microsoft Azure services, Google Cloud Platform, and automation platforms like n8n.io.

## Architecture Options

### 1. DigitalOcean Native Deployment

- **App Platform**: Managed container deployment with auto-scaling
- **Kubernetes**: Full control with DigitalOcean Kubernetes (DOKS)
- **Droplets**: Traditional VPS deployment with Docker Compose

### 2. Hybrid Cloud Integration

- **DigitalOcean + Azure AD**: Authentication via Azure Active Directory
- **DigitalOcean + Google Workspace**: SSO with Google Workspace
- **DigitalOcean + Microsoft 365**: Integration with SharePoint and Teams
- **Multi-Cloud Storage**: DigitalOcean Spaces + Azure Blob + Google Cloud Storage

### 3. Automation & Workflow Integration

- **n8n.io Integration**: Workflow automation and document triggers
- **Microsoft Power Automate**: Enterprise workflow integration
- **Google Apps Script**: Custom automation workflows
- **Zapier**: No-code automation platform integration

## Pre-Deployment Requirements

### DigitalOcean Account Setup

```bash
# Install DigitalOcean CLI
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate with your DigitalOcean account
doctl auth init
```

### Domain and SSL Configuration

1. **Domain Setup**
   - Register domain or configure DNS to point to DigitalOcean
   - Set up subdomain structure:
     - `api.yourdomain.com` - API endpoints
     - `app.yourdomain.com` - Frontend application
     - `admin.yourdomain.com` - Administrative interface

2. **SSL Certificate**
   - Use DigitalOcean's managed certificates
   - Or integrate with Let's Encrypt for custom certificates

## Deployment Option 1: DigitalOcean App Platform (Recommended)

### Step 1: Prepare the Application

Create `.do/app.yaml` configuration:

```yaml
name: enterprise-docs-platform
services:
- name: api
  source_dir: src/core/api
  github:
    repo: your-org/enterprise-docs-platform
    branch: main
    deploy_on_push: true
  run_command: dotnet EnterpriseDocsCore.API.dll
  environment_slug: dotnet
  instance_count: 2
  instance_size_slug: professional-xs
  http_port: 5000
  health_check:
    http_path: /health
  envs:
  - key: ASPNETCORE_ENVIRONMENT
    value: Production
  - key: ConnectionStrings__DefaultConnection
    type: SECRET
    value: postgresql://username:password@db-cluster-name/dbname
  - key: Redis__ConnectionString
    type: SECRET
    value: redis://redis-cluster:6379
  - key: JWT__SecretKey
    type: SECRET
  - key: AzureAD__TenantId
    type: SECRET
  - key: AzureAD__ClientId
    type: SECRET

- name: frontend
  source_dir: src/frontend
  github:
    repo: your-org/enterprise-docs-platform
    branch: main
    deploy_on_push: true
  build_command: npm run build
  run_command: npm start
  environment_slug: node-js
  instance_count: 2
  instance_size_slug: basic-xxs
  http_port: 3000
  routes:
  - path: /
  envs:
  - key: VITE_API_BASE_URL
    value: https://api.yourdomain.com/api
  - key: VITE_ENVIRONMENT
    value: production

databases:
- name: postgres-db
  engine: PG
  version: "14"
  size: db-s-1vcpu-1gb
  num_nodes: 1

- name: redis-cache
  engine: REDIS
  version: "6"
  size: db-s-1vcpu-1gb
```

### Step 2: Deploy to App Platform

```bash
# Create the app
doctl apps create --spec .do/app.yaml

# Monitor deployment
doctl apps list
doctl apps get <app-id>

# View logs
doctl apps logs <app-id> --type=deploy
doctl apps logs <app-id> --type=run
```

### Step 3: Configure Custom Domains

```bash
# Add custom domains
doctl apps update <app-id> --spec .do/app.yaml

# Configure DNS records
# A record: api.yourdomain.com -> App Platform IP
# A record: app.yourdomain.com -> App Platform IP
```

## Deployment Option 2: Kubernetes (DOKS)

### Step 1: Create Kubernetes Cluster

```bash
# Create DOKS cluster
doctl kubernetes cluster create enterprise-docs \
  --region nyc3 \
  --version 1.28 \
  --node-pool "name=worker-pool;size=s-2vcpu-2gb;count=3;auto-scale=true;min-nodes=2;max-nodes=10"

# Configure kubectl
doctl kubernetes cluster kubeconfig save enterprise-docs
```

### Step 2: Deploy with Helm

Create `helm/values.yaml`:

```yaml
global:
  domain: yourdomain.com
  environment: production

api:
  replicaCount: 3
  image:
    repository: your-registry/enterprise-docs-api
    tag: latest
  service:
    type: LoadBalancer
    port: 80
  ingress:
    enabled: true
    hosts:
      - host: api.yourdomain.com
        paths:
          - path: /
            pathType: Prefix

frontend:
  replicaCount: 2
  image:
    repository: your-registry/enterprise-docs-frontend
    tag: latest
  service:
    type: LoadBalancer
    port: 80
  ingress:
    enabled: true
    hosts:
      - host: app.yourdomain.com
        paths:
          - path: /
            pathType: Prefix

postgresql:
  enabled: true
  auth:
    username: enterprisedocs
    database: enterprisedocs
  primary:
    persistence:
      size: 100Gi

redis:
  enabled: true
  auth:
    enabled: true
  master:
    persistence:
      size: 20Gi
```

```bash
# Deploy with Helm
helm install enterprise-docs ./helm \
  --values helm/values.yaml \
  --namespace enterprise-docs \
  --create-namespace
```

## Authentication & SSO Integration

### Azure Active Directory Integration

1. **Register Application in Azure AD**

```bash
# Azure CLI setup
az login
az ad app create --display-name "Enterprise Docs Platform" \
  --reply-urls "https://app.yourdomain.com/auth/callback"
```

2. **Configure Environment Variables**

```bash
# In DigitalOcean App Platform or Kubernetes secrets
AZUREAD_TENANT_ID=your-tenant-id
AZUREAD_CLIENT_ID=your-client-id
AZUREAD_CLIENT_SECRET=your-client-secret
AZUREAD_REDIRECT_URI=https://app.yourdomain.com/auth/callback
```

### Google Workspace Integration

1. **Google Cloud Console Setup**

```bash
# Enable APIs
gcloud services enable admin.googleapis.com
gcloud services enable drive.googleapis.com
gcloud services enable calendar.googleapis.com
```

2. **OAuth Configuration**

```bash
# Environment variables
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_WORKSPACE_DOMAIN=yourcompany.com
```

### Microsoft 365 Integration

1. **SharePoint Integration**

```bash
# Microsoft Graph API setup
MSGRAPH_CLIENT_ID=your-msgraph-client-id
MSGRAPH_CLIENT_SECRET=your-msgraph-client-secret
MSGRAPH_TENANT_ID=your-tenant-id
SHAREPOINT_SITE_URL=https://yourcompany.sharepoint.com
```

## API Exposure and Client Integration

### REST API Endpoints

The platform exposes comprehensive REST APIs for client integration:

```bash
# Base API URL
https://api.yourdomain.com/api/v1

# Authentication endpoints
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/profile

# Document management
GET    /documents
POST   /documents
GET    /documents/{id}
PUT    /documents/{id}
DELETE /documents/{id}
POST   /documents/{id}/generate

# Tenant management
GET    /tenants
POST   /tenants
GET    /tenants/{id}
PUT    /tenants/{id}

# User management
GET    /users
POST   /users
GET    /users/{id}
PUT    /users/{id}
```

### API Client Examples

**C# Client**

```csharp
// Install NuGet package
Install-Package EnterpriseDocsCore.Client

// Usage
var client = new EnterpriseDocsClient("https://api.yourdomain.com");
await client.AuthenticateAsync(token);
var documents = await client.Documents.GetAllAsync();
```

**JavaScript/Node.js Client**

```javascript
// npm install enterprise-docs-client
const { EnterpriseDocsClient } = require('enterprise-docs-client');

const client = new EnterpriseDocsClient('https://api.yourdomain.com');
await client.authenticate(token);
const documents = await client.documents.getAll();
```

**Python Client**

```python
# pip install enterprise-docs-python
from enterprise_docs import EnterpriseDocsClient

client = EnterpriseDocsClient('https://api.yourdomain.com')
client.authenticate(token)
documents = client.documents.get_all()
```

## Automation Platform Integration

### n8n.io Integration

1. **Deploy n8n alongside the platform**

```yaml
# Add to docker-compose.yml or Kubernetes
n8n:
  image: n8nio/n8n:latest
  environment:
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=admin
    - N8N_BASIC_AUTH_PASSWORD=secure_password
    - WEBHOOK_URL=https://n8n.yourdomain.com
  ports:
    - "5678:5678"
  volumes:
    - n8n_data:/home/node/.n8n
```

2. **Create Custom n8n Nodes**

```javascript
// Enterprise Docs Platform n8n node
export class EnterpriseDocsNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Enterprise Docs Platform',
    name: 'enterpriseDocs',
    group: ['output'],
    version: 1,
    description: 'Interact with Enterprise Docs Platform API',
    defaults: {
      name: 'Enterprise Docs Platform',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'enterpriseDocsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'Create Document',
            value: 'createDocument',
          },
          {
            name: 'Generate Document',
            value: 'generateDocument',
          },
        ],
        default: 'createDocument',
      },
    ],
  };
}
```

### Microsoft Power Automate Integration

1. **Custom Connector Configuration**

```json
{
  "swagger": "2.0",
  "info": {
    "title": "Enterprise Docs Platform",
    "description": "Connector for Enterprise Documentation Platform",
    "version": "1.0"
  },
  "host": "api.yourdomain.com",
  "basePath": "/api/v1",
  "schemes": ["https"],
  "consumes": ["application/json"],
  "produces": ["application/json"],
  "paths": {
    "/documents": {
      "post": {
        "summary": "Create Document",
        "operationId": "CreateDocument",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/Document"
            }
          }
        ]
      }
    }
  }
}
```

## Security Configuration

### Firewall Rules

```bash
# Configure DigitalOcean Cloud Firewall
doctl compute firewall create enterprise-docs-fw \
  --inbound-rules "protocol:tcp,ports:80,source_addresses:0.0.0.0/0,source_droplet_ids:" \
  --inbound-rules "protocol:tcp,ports:443,source_addresses:0.0.0.0/0,source_droplet_ids:" \
  --inbound-rules "protocol:tcp,ports:22,source_addresses:your.management.ip/32,source_droplet_ids:" \
  --outbound-rules "protocol:tcp,ports:all,destination_addresses:0.0.0.0/0,destination_droplet_ids:"
```

### SSL/TLS Configuration

```bash
# Let's Encrypt with certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### Environment Variables Security

```bash
# Use DigitalOcean App Platform encrypted environment variables
doctl apps update <app-id> --spec app-config.yaml

# Or use Kubernetes secrets
kubectl create secret generic enterprise-docs-secrets \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=db-password=your-db-password \
  --namespace=enterprise-docs
```

## Monitoring and Alerting

### DigitalOcean Monitoring

```bash
# Enable monitoring
doctl monitoring alert policy create \
  --type=v1/insights/droplet/cpu \
  --description="High CPU Usage" \
  --compare=GreaterThan \
  --value=80 \
  --window=5m \
  --entities=<droplet-id>
```

### Application Performance Monitoring

```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  volumes:
    - grafana-storage:/var/lib/grafana
```

## Backup and Disaster Recovery

### Database Backups

```bash
# Automated PostgreSQL backups to DigitalOcean Spaces
#!/bin/bash
DB_NAME="enterprisedocs"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup
pg_dump $DB_NAME > $BACKUP_FILE

# Upload to DigitalOcean Spaces
s3cmd put $BACKUP_FILE s3://your-backup-bucket/database/

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### Application State Backup

```bash
# Backup configuration and user data
kubectl create backup enterprise-docs-backup \
  --include-namespaces enterprise-docs \
  --storage-location default

# Schedule regular backups
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: enterprise-docs-daily-backup
spec:
  schedule: "0 2 * * *"
  template:
    includedNamespaces:
    - enterprise-docs
```

## Scaling Configuration

### Horizontal Pod Autoscaler (Kubernetes)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: enterprise-docs-api
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

```bash
# Scale DigitalOcean Managed Database
doctl databases resize <database-id> --size db-s-2vcpu-4gb --num-nodes 2

# Configure read replicas
doctl databases replica create <database-id> \
  --name enterprise-docs-read-replica \
  --region nyc3 \
  --size db-s-1vcpu-2gb
```

## Cost Optimization

### Resource Right-Sizing

```bash
# Monitor resource usage
doctl monitoring metrics droplet cpu <droplet-id>
doctl monitoring metrics droplet memory <droplet-id>

# Optimize instance sizes based on usage
doctl droplets actions resize <droplet-id> --size s-1vcpu-2gb
```

### Reserved Instances

```bash
# Use DigitalOcean Reserved Instances for predictable workloads
# Contact DigitalOcean sales for enterprise pricing
```

## Support and Maintenance

### Log Aggregation

```yaml
# Centralized logging with ELK stack
elasticsearch:
  image: elasticsearch:7.14.0
  environment:
    - discovery.type=single-node
  ports:
    - "9200:9200"

logstash:
  image: logstash:7.14.0
  volumes:
    - ./logstash/pipeline:/usr/share/logstash/pipeline
  ports:
    - "5044:5044"

kibana:
  image: kibana:7.14.0
  ports:
    - "5601:5601"
  environment:
    - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

### Health Checks and Uptime Monitoring

```bash
# Configure uptime monitoring
curl -X POST https://api.digitalocean.com/v2/uptime/checks \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Docs API",
    "type": "https",
    "target": "https://api.yourdomain.com/health",
    "regions": ["us_east", "us_west", "eu_west"],
    "enabled": true
  }'
```

## Next Steps

1. **Development Setup**: Follow the quick start guide to set up your development environment
2. **Domain Configuration**: Register your domain and configure DNS
3. **Choose Deployment Method**: Select between App Platform or Kubernetes based on your needs
4. **Configure Authentication**: Set up Azure AD, Google Workspace, or custom authentication
5. **Deploy Applications**: Use the provided configurations to deploy your applications
6. **Set Up Monitoring**: Configure monitoring and alerting for production readiness
7. **Client Integration**: Use the API clients to integrate with existing systems
8. **Automation Setup**: Configure n8n.io or other automation platforms for workflow integration

For additional support, refer to the main documentation or contact the development team.
