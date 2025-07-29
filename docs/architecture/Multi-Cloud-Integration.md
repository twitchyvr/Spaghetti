# Multi-Cloud Integration Architecture

Enterprise Documentation Platform

## Overview

The Enterprise Documentation Platform is designed as a cloud-agnostic solution that can seamlessly integrate with multiple cloud providers and automation platforms, enabling customers to choose their preferred infrastructure while maintaining full functionality.

## Supported Cloud Platforms

### Primary Hosting Options

1. **DigitalOcean**
   - App Platform (managed containers)
   - Kubernetes (DOKS)
   - Traditional Droplets with Docker
   - Managed databases (PostgreSQL, Redis)
   - DigitalOcean Spaces (object storage)

2. **Microsoft Azure**
   - Azure Container Apps
   - Azure Kubernetes Service (AKS)
   - Azure App Service
   - Azure SQL Database / PostgreSQL
   - Azure Blob Storage
   - Azure Active Directory integration

3. **Google Cloud Platform**
   - Google Kubernetes Engine (GKE)
   - Cloud Run
   - Cloud SQL (PostgreSQL)
   - Google Cloud Storage
   - Google Workspace integration

4. **Amazon Web Services (AWS)**
   - Amazon EKS
   - AWS Fargate
   - Amazon RDS (PostgreSQL)
   - Amazon S3
   - AWS Cognito

## Authentication & Identity Integration

### Enterprise Identity Providers

```yaml
# Configuration supports multiple identity providers
Authentication:
  Providers:
    AzureAD:
      TenantId: "${AZURE_TENANT_ID}"
      ClientId: "${AZURE_CLIENT_ID}"
      ClientSecret: "${AZURE_CLIENT_SECRET}"
      
    GoogleWorkspace:
      ClientId: "${GOOGLE_CLIENT_ID}"
      ClientSecret: "${GOOGLE_CLIENT_SECRET}"
      Domain: "${GOOGLE_WORKSPACE_DOMAIN}"
      
    Auth0:
      Domain: "${AUTH0_DOMAIN}"
      ClientId: "${AUTH0_CLIENT_ID}"
      ClientSecret: "${AUTH0_CLIENT_SECRET}"
      
    SAML:
      EntityId: "${SAML_ENTITY_ID}"
      SignOnUrl: "${SAML_SIGN_ON_URL}"
      Certificate: "${SAML_CERTIFICATE}"
      
    LDAP:
      Server: "${LDAP_SERVER}"
      BaseDn: "${LDAP_BASE_DN}"
      BindDn: "${LDAP_BIND_DN}"
      BindPassword: "${LDAP_BIND_PASSWORD}"
```

### Single Sign-On (SSO) Integration

**Azure Active Directory**

```csharp
// Program.cs configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration, "AzureAd")
    .EnableTokenAcquisitionToCallDownstreamApi()
    .AddMicrosoftGraph(builder.Configuration.GetSection("MicrosoftGraph"))
    .AddInMemoryTokenCaches();
```

**Google Workspace**

```csharp
// Google authentication configuration
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Google:ClientId"];
        options.ClientSecret = builder.Configuration["Google:ClientSecret"];
        options.Scope.Add("https://www.googleapis.com/auth/admin.directory.user.readonly");
    });
```

## Automation Platform Integration

### n8n.io Workflow Automation

**Document Processing Workflows**

```json
{
  "name": "Enterprise Docs - Document Processing",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "/webhook/document-created",
        "responseMode": "responseNode"
      },
      "name": "Document Created Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "generateDocument",
        "documentId": "={{$node['Document Created Webhook'].json['documentId']}}",
        "templateType": "legal-memo"
      },
      "name": "Generate Legal Memo",
      "type": "enterprise-docs-platform",
      "position": [460, 300]
    },
    {
      "parameters": {
        "channel": "#legal-team",
        "text": "New legal memo generated: {{$node['Generate Legal Memo'].json['documentUrl']}}"
      },
      "name": "Notify Slack",
      "type": "n8n-nodes-base.slack",
      "position": [680, 300]
    }
  ],
  "connections": {
    "Document Created Webhook": {
      "main": [
        [
          {
            "node": "Generate Legal Memo",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Legal Memo": {
      "main": [
        [
          {
            "node": "Notify Slack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Microsoft Power Automate Integration

**SharePoint Document Synchronization**

```json
{
  "definition": {
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "actions": {
      "When_a_file_is_created_in_SharePoint": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connectionName": "shared_sharepointonline",
            "operationId": "OnNewFile"
          },
          "parameters": {
            "dataset": "https://yourcompany.sharepoint.com/sites/legal",
            "table": "Documents"
          }
        }
      },
      "Create_Enterprise_Docs_Document": {
        "type": "Http",
        "inputs": {
          "method": "POST",
          "uri": "https://api.yourdomain.com/api/v1/documents",
          "headers": {
            "Authorization": "Bearer @{variables('ApiToken')}",
            "Content-Type": "application/json"
          },
          "body": {
            "title": "@{triggerOutputs()['body']['Name']}",
            "content": "@{body('Get_file_content')}",
            "sourceType": "SharePoint",
            "sourceUrl": "@{triggerOutputs()['body']['Path']}"
          }
        }
      }
    }
  }
}
```

### Zapier Integration

**Custom Zapier App Configuration**

```javascript
// zapier/creates/document.js
const createDocument = {
  key: 'createDocument',
  noun: 'Document',
  display: {
    label: 'Create Document',
    description: 'Creates a new document in Enterprise Docs Platform'
  },
  operation: {
    inputFields: [
      {
        key: 'title',
        label: 'Document Title',
        type: 'string',
        required: true
      },
      {
        key: 'content',
        label: 'Document Content',
        type: 'text',
        required: false
      },
      {
        key: 'templateType',
        label: 'Template Type',
        type: 'string',
        choices: {
          'legal-memo': 'Legal Memo',
          'contract-review': 'Contract Review',
          'client-summary': 'Client Summary'
        }
      }
    ],
    perform: async (z, bundle) => {
      const response = await z.request({
        method: 'POST',
        url: 'https://api.yourdomain.com/api/v1/documents',
        headers: {
          'Authorization': `Bearer ${bundle.authData.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          title: bundle.inputData.title,
          content: bundle.inputData.content,
          templateType: bundle.inputData.templateType
        }
      });
      return response.data;
    }
  }
};

module.exports = createDocument;
```

## Storage Integration

### Multi-Cloud File Storage

```csharp
// Storage abstraction layer
public interface ICloudStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string containerName);
    Task<Stream> DownloadFileAsync(string fileName, string containerName);
    Task<bool> DeleteFileAsync(string fileName, string containerName);
    Task<IEnumerable<string>> ListFilesAsync(string containerName);
}

// Azure Blob Storage implementation
public class AzureBlobStorageService : ICloudStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    
    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string containerName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(fileName);
        await blobClient.UploadAsync(fileStream);
        return blobClient.Uri.ToString();
    }
}

// DigitalOcean Spaces implementation
public class DigitalOceanSpacesService : ICloudStorageService
{
    private readonly AmazonS3Client _s3Client;
    
    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string containerName)
    {
        var request = new PutObjectRequest
        {
            BucketName = containerName,
            Key = fileName,
            InputStream = fileStream,
            ContentType = "application/octet-stream"
        };
        
        await _s3Client.PutObjectAsync(request);
        return $"https://{containerName}.{_endpoint}/{fileName}";
    }
}

// Google Cloud Storage implementation
public class GoogleCloudStorageService : ICloudStorageService
{
    private readonly StorageClient _storageClient;
    
    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string containerName)
    {
        var objectName = fileName;
        await _storageClient.UploadObjectAsync(containerName, objectName, null, fileStream);
        return $"https://storage.googleapis.com/{containerName}/{objectName}";
    }
}
```

### Database Multi-Cloud Support

```yaml
# Database configuration for different providers
Database:
  Provider: "PostgreSQL"  # PostgreSQL, SQLServer, MySQL
  
  # DigitalOcean Managed Database
  DigitalOcean:
    ConnectionString: "Host=db-postgresql-nyc3-12345-do-user-123456-0.b.db.ondigitalocean.com;Database=enterprisedocs;Username=doadmin;Password=password;Port=25060;SSL Mode=Require"
    
  # Azure SQL Database
  Azure:
    ConnectionString: "Server=tcp:enterprisedocs.database.windows.net,1433;Initial Catalog=enterprisedocs;Persist Security Info=False;User ID=admin;Password=password;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
    
  # Google Cloud SQL
  Google:
    ConnectionString: "Host=/cloudsql/project:region:instance;Database=enterprisedocs;Username=postgres;Password=password"
    
  # AWS RDS
  AWS:
    ConnectionString: "Host=enterprisedocs.cluster-abc123def456.us-east-1.rds.amazonaws.com;Database=enterprisedocs;Username=postgres;Password=password;Port=5432"
```

## API Gateway and Load Balancing

### Multi-Region Deployment

```yaml
# Global load balancer configuration
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: enterprise-docs-ssl
spec:
  domains:
    - api.yourdomain.com
    - app.yourdomain.com
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: enterprise-docs-ingress
  annotations:
    kubernetes.io/ingress.global-static-ip-name: "enterprise-docs-ip"
    networking.gke.io/managed-certificates: "enterprise-docs-ssl"
    kubernetes.io/ingress.class: "gce"
spec:
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /*
        pathType: ImplementationSpecific
        backend:
          service:
            name: api-service
            port:
              number: 80
  - host: app.yourdomain.com
    http:
      paths:
      - path: /*
        pathType: ImplementationSpecific
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### CDN Integration

```yaml
# CloudFlare CDN configuration
CDN:
  Provider: "CloudFlare"  # CloudFlare, Azure CDN, AWS CloudFront, Google Cloud CDN
  
  CloudFlare:
    ZoneId: "${CLOUDFLARE_ZONE_ID}"
    ApiToken: "${CLOUDFLARE_API_TOKEN}"
    CacheRules:
      - Pattern: "*.js"
        CacheTTL: 31536000  # 1 year
      - Pattern: "*.css"
        CacheTTL: 31536000  # 1 year
      - Pattern: "/api/*"
        CacheTTL: 0  # No cache for API calls
        
  Azure:
    ProfileName: "enterprise-docs-cdn"
    EndpointName: "enterprise-docs"
    ResourceGroupName: "enterprise-docs-rg"
    
  AWS:
    DistributionId: "${AWS_CLOUDFRONT_DISTRIBUTION_ID}"
    OriginDomainName: "api.yourdomain.com"
```

## Monitoring and Observability

### Multi-Cloud Monitoring Stack

```yaml
# Prometheus configuration for multi-cloud monitoring
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  environment:
    - DIGITAL_OCEAN_TOKEN=${DIGITAL_OCEAN_TOKEN}
    - AZURE_SUBSCRIPTION_ID=${AZURE_SUBSCRIPTION_ID}
    - GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
    - GF_INSTALL_PLUGINS=grafana-azure-monitor-datasource,grafana-googlecloud-monitoring-datasource
  volumes:
    - grafana-storage:/var/lib/grafana
    - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
```

### Application Performance Monitoring

```csharp
// Multi-provider APM configuration
public static class ApplicationInsightsExtensions
{
    public static IServiceCollection AddMultiProviderAPM(this IServiceCollection services, IConfiguration configuration)
    {
        var apmProvider = configuration["APM:Provider"];
        
        switch (apmProvider?.ToLower())
        {
            case "applicationinsights":
                services.AddApplicationInsightsTelemetry(configuration["APM:ApplicationInsights:InstrumentationKey"]);
                break;
                
            case "datadog":
                services.AddDatadog(configuration.GetSection("APM:Datadog"));
                break;
                
            case "newrelic":
                services.AddNewRelic(configuration.GetSection("APM:NewRelic"));
                break;
                
            case "elastic":
                services.AddElasticApm(configuration.GetSection("APM:Elastic"));
                break;
                
            default:
                // Default to OpenTelemetry for cloud-agnostic monitoring
                services.AddOpenTelemetryTracing(builder =>
                {
                    builder.AddAspNetCoreInstrumentation()
                           .AddEntityFrameworkCoreInstrumentation()
                           .AddRedisInstrumentation()
                           .AddJaegerExporter();
                });
                break;
        }
        
        return services;
    }
}
```

## Deployment Templates

### Terraform Multi-Cloud Deployment

```hcl
# main.tf - Multi-cloud deployment
variable "cloud_provider" {
  description = "Cloud provider to deploy to"
  type        = string
  default     = "digitalocean"
  validation {
    condition = contains(["digitalocean", "azure", "gcp", "aws"], var.cloud_provider)
    error_message = "Cloud provider must be one of: digitalocean, azure, gcp, aws."
  }
}

module "digitalocean" {
  count  = var.cloud_provider == "digitalocean" ? 1 : 0
  source = "./modules/digitalocean"
  
  app_name        = var.app_name
  environment     = var.environment
  database_size   = var.database_size
  app_instance_count = var.app_instance_count
}

module "azure" {
  count  = var.cloud_provider == "azure" ? 1 : 0
  source = "./modules/azure"
  
  app_name           = var.app_name
  environment        = var.environment
  location          = var.azure_location
  sku_name          = var.azure_sku_name
}

module "gcp" {
  count  = var.cloud_provider == "gcp" ? 1 : 0
  source = "./modules/gcp"
  
  app_name    = var.app_name
  environment = var.environment
  project_id  = var.gcp_project_id
  region      = var.gcp_region
}
```

### Docker Compose for Development

```yaml
# docker-compose.override.yml - Environment-specific overrides
version: '3.8'

services:
  api:
    environment:
      # Cloud provider specific configurations
      - CLOUD_PROVIDER=${CLOUD_PROVIDER:-digitalocean}
      
      # Storage configurations
      - STORAGE__DIGITALOCEAN__ENDPOINT=${DO_SPACES_ENDPOINT}
      - STORAGE__DIGITALOCEAN__ACCESSKEY=${DO_SPACES_ACCESS_KEY}
      - STORAGE__DIGITALOCEAN__SECRETKEY=${DO_SPACES_SECRET_KEY}
      
      - STORAGE__AZURE__CONNECTIONSTRING=${AZURE_STORAGE_CONNECTION_STRING}
      
      - STORAGE__GOOGLE__PROJECTID=${GOOGLE_CLOUD_PROJECT_ID}
      - STORAGE__GOOGLE__KEYFILE=${GOOGLE_CLOUD_KEY_FILE}
      
      # Authentication providers
      - AUTH__AZUREAD__TENANTID=${AZURE_TENANT_ID}
      - AUTH__AZUREAD__CLIENTID=${AZURE_CLIENT_ID}
      - AUTH__AZUREAD__CLIENTSECRET=${AZURE_CLIENT_SECRET}
      
      - AUTH__GOOGLE__CLIENTID=${GOOGLE_CLIENT_ID}
      - AUTH__GOOGLE__CLIENTSECRET=${GOOGLE_CLIENT_SECRET}
      
      # Automation platforms
      - AUTOMATION__N8N__WEBHOOK_URL=${N8N_WEBHOOK_URL}
      - AUTOMATION__N8N__API_KEY=${N8N_API_KEY}
      
      - AUTOMATION__POWERAUTOMATE__TENANT_ID=${POWER_AUTOMATE_TENANT_ID}
      - AUTOMATION__POWERAUTOMATE__CLIENT_ID=${POWER_AUTOMATE_CLIENT_ID}
      
      - AUTOMATION__ZAPIER__WEBHOOK_URL=${ZAPIER_WEBHOOK_URL}

  # Optional: n8n service for workflow automation
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USERNAME:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - WEBHOOK_URL=http://localhost:5678
      - GENERIC_TIMEZONE=America/New_York
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres
      - redis

volumes:
  n8n_data:
```

## Client SDK Development

### Multi-Platform SDK Support

```csharp
// .NET SDK
public class EnterpriseDocsClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    
    public EnterpriseDocsClient(string baseUrl, string apiKey, CloudProvider provider = CloudProvider.Auto)
    {
        _httpClient = new HttpClient();
        _httpClient.BaseAddress = new Uri(baseUrl);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        
        // Configure for specific cloud provider optimizations
        ConfigureForCloudProvider(provider);
    }
    
    private void ConfigureForCloudProvider(CloudProvider provider)
    {
        switch (provider)
        {
            case CloudProvider.DigitalOcean:
                _httpClient.DefaultRequestHeaders.Add("X-Cloud-Provider", "digitalocean");
                break;
            case CloudProvider.Azure:
                _httpClient.DefaultRequestHeaders.Add("X-Cloud-Provider", "azure");
                break;
            case CloudProvider.GoogleCloud:
                _httpClient.DefaultRequestHeaders.Add("X-Cloud-Provider", "gcp");
                break;
        }
    }
}
```

```javascript
// Node.js SDK
class EnterpriseDocsClient {
  constructor(baseUrl, apiKey, options = {}) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.cloudProvider = options.cloudProvider || 'auto';
    
    // Configure axios instance with cloud-specific optimizations
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Cloud-Provider': this.cloudProvider
      },
      timeout: options.timeout || 30000
    });
    
    // Add retry logic for multi-cloud resilience
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status >= 500 && error.config.retryCount < 3) {
          error.config.retryCount = (error.config.retryCount || 0) + 1;
          await new Promise(resolve => setTimeout(resolve, 1000 * error.config.retryCount));
          return this.client(error.config);
        }
        return Promise.reject(error);
      }
    );
  }
}
```

```python
# Python SDK
class EnterpriseDocsClient:
    def __init__(self, base_url: str, api_key: str, cloud_provider: str = 'auto'):
        self.base_url = base_url
        self.api_key = api_key
        self.cloud_provider = cloud_provider
        
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'X-Cloud-Provider': cloud_provider
        })
        
        # Configure retry strategy with exponential backoff
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
```

## Migration and Portability

### Cloud Migration Scripts

```bash
#!/bin/bash
# migrate-to-cloud.sh - Migrate between cloud providers

SOURCE_PROVIDER=$1
TARGET_PROVIDER=$2
MIGRATION_TYPE=$3  # data-only, full, config-only

echo "Migrating from $SOURCE_PROVIDER to $TARGET_PROVIDER"

case $MIGRATION_TYPE in
  "data-only")
    echo "Migrating data only..."
    # Export database
    kubectl exec deployment/postgres -- pg_dump enterprisedocs > backup.sql
    
    # Export file storage
    case $SOURCE_PROVIDER in
      "digitalocean")
        s3cmd sync s3://do-spaces-bucket/ ./backup/files/
        ;;
      "azure")
        azcopy sync "https://storage.blob.core.windows.net/container" "./backup/files/"
        ;;
      "gcp")
        gsutil -m cp -r gs://gcp-bucket/ ./backup/files/
        ;;
    esac
    ;;
    
  "full")
    echo "Full migration including infrastructure..."
    # Export Kubernetes manifests
    kubectl get all -o yaml > k8s-backup.yaml
    
    # Export Helm values
    helm get values enterprise-docs > helm-values.yaml
    
    # Run data migration
    ./migrate-to-cloud.sh $SOURCE_PROVIDER $TARGET_PROVIDER data-only
    
    # Deploy to target provider
    case $TARGET_PROVIDER in
      "digitalocean")
        doctl kubernetes cluster create enterprise-docs-new
        ;;
      "azure")
        az aks create --resource-group enterprise-docs --name enterprise-docs-new
        ;;
      "gcp")
        gcloud container clusters create enterprise-docs-new
        ;;
    esac
    ;;
esac
```

### Configuration Portability

```yaml
# config/cloud-agnostic.yml - Cloud-agnostic configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: enterprise-docs-config
data:
  appsettings.json: |
    {
      "CloudProvider": "${CLOUD_PROVIDER}",
      "Database": {
        "Provider": "PostgreSQL",
        "ConnectionString": "${DATABASE_CONNECTION_STRING}"
      },
      "Storage": {
        "Provider": "${STORAGE_PROVIDER}",
        "ConnectionString": "${STORAGE_CONNECTION_STRING}",
        "ContainerName": "${STORAGE_CONTAINER_NAME}"
      },
      "Authentication": {
        "Providers": {
          "AzureAD": {
            "Enabled": "${AUTH_AZUREAD_ENABLED}",
            "TenantId": "${AUTH_AZUREAD_TENANT_ID}",
            "ClientId": "${AUTH_AZUREAD_CLIENT_ID}"
          },
          "Google": {
            "Enabled": "${AUTH_GOOGLE_ENABLED}",
            "ClientId": "${AUTH_GOOGLE_CLIENT_ID}"
          }
        }
      },
      "Integrations": {
        "n8n": {
          "Enabled": "${INTEGRATION_N8N_ENABLED}",
          "WebhookUrl": "${INTEGRATION_N8N_WEBHOOK_URL}"
        },
        "PowerAutomate": {
          "Enabled": "${INTEGRATION_POWERAUTOMATE_ENABLED}",
          "TenantId": "${INTEGRATION_POWERAUTOMATE_TENANT_ID}"
        }
      }
    }
```

This multi-cloud architecture ensures that customers can deploy the Enterprise Documentation Platform on their preferred infrastructure while maintaining full functionality and seamless integration with their existing tools and workflows.
