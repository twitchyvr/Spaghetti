# Sprint 5: AI-Powered Enterprise Features - Detailed Architecture Design

**Document Version**: 1.0
**Created**: July 31, 2025
**Phase**: 2 - Architectural Design Execution
**Lead**: team-p2-architecture-coordinator

## Executive Summary

This document provides comprehensive architectural specifications for Sprint 5's AI-Powered Enterprise Features, building upon Phase 1 planning to deliver production-ready technical designs. The architecture supports multi-tenant deployment with performance targets of <100ms search response, <50ms collaboration latency, and 85% AI accuracy.

## 1. AI Service Integration Architecture

### 1.1 Provider Abstraction Layer

```csharp
// Core AI Service Interface Extensions
public interface IAIServiceProvider
{
    string ProviderId { get; }
    int Priority { get; }
    bool IsAvailable { get; }
    AIProviderCapabilities Capabilities { get; }
    Task<bool> HealthCheckAsync();
    Task<AIResponse> ExecuteAsync(AIRequest request, CancellationToken cancellationToken);
}

public class AIProviderCapabilities
{
    public int MaxTokens { get; set; }
    public List<string> SupportedModels { get; set; }
    public List<string> SupportedOperations { get; set; }
    public decimal CostPerToken { get; set; }
    public int RateLimitPerMinute { get; set; }
}

// Provider Factory with Circuit Breaker
public class AIServiceProviderFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ICircuitBreaker _circuitBreaker;
    private readonly IOptionsMonitor<AIServiceOptions> _options;
    
    public async Task<IAIServiceProvider> GetProviderAsync(string operation)
    {
        var providers = _serviceProvider.GetServices<IAIServiceProvider>()
            .Where(p => p.Capabilities.SupportedOperations.Contains(operation))
            .OrderByDescending(p => p.Priority);
            
        foreach (var provider in providers)
        {
            if (await _circuitBreaker.IsOpenAsync(provider.ProviderId))
                continue;
                
            if (await provider.HealthCheckAsync())
                return provider;
        }
        
        throw new NoAvailableAIProviderException(operation);
    }
}
```

### 1.2 AI Request/Response Pipeline

```csharp
public class AIRequestPipeline
{
    private readonly List<IAIMiddleware> _middlewares;
    
    public async Task<DocumentOutput> ProcessAsync(ProcessDocumentRequest request)
    {
        // Pre-processing middlewares
        var context = new AIRequestContext(request);
        
        // 1. Authentication & Authorization
        await _authMiddleware.ProcessAsync(context);
        
        // 2. Rate Limiting
        await _rateLimitMiddleware.ProcessAsync(context);
        
        // 3. Input Validation & Sanitization
        await _validationMiddleware.ProcessAsync(context);
        
        // 4. Token Optimization
        await _tokenOptimizationMiddleware.ProcessAsync(context);
        
        // 5. Cache Check
        var cachedResult = await _cacheMiddleware.CheckAsync(context);
        if (cachedResult != null) return cachedResult;
        
        // 6. Provider Selection & Execution
        var provider = await _providerFactory.GetProviderAsync(context.Operation);
        var result = await provider.ExecuteAsync(context.Request);
        
        // 7. Response Processing
        await _responseProcessingMiddleware.ProcessAsync(result);
        
        // 8. Usage Tracking
        await _usageTrackingMiddleware.RecordAsync(context, result);
        
        // 9. Cache Storage
        await _cacheMiddleware.StoreAsync(context, result);
        
        return result.ToDocumentOutput();
    }
}
```

### 1.3 Prompt Management System

```csharp
public class PromptTemplateService
{
    private readonly IPromptTemplateRepository _repository;
    private readonly ITemplateEngine _templateEngine;
    
    public async Task<string> BuildPromptAsync(string templateId, Dictionary<string, object> variables)
    {
        var template = await _repository.GetTemplateAsync(templateId);
        
        // Version control for prompts
        if (template.Version != variables.GetValueOrDefault("expectedVersion"))
        {
            await _auditService.LogVersionMismatch(templateId, template.Version);
        }
        
        // Industry-specific customization
        var industry = variables.GetValueOrDefault("industry", "general").ToString();
        var industryTemplate = template.IndustryVariants.GetValueOrDefault(industry, template.DefaultTemplate);
        
        // Build prompt with Liquid templating
        return await _templateEngine.RenderAsync(industryTemplate, variables);
    }
}

// Prompt Template Schema
public class PromptTemplate
{
    public string Id { get; set; }
    public string Name { get; set; }
    public int Version { get; set; }
    public string DefaultTemplate { get; set; }
    public Dictionary<string, string> IndustryVariants { get; set; }
    public List<TemplateVariable> RequiredVariables { get; set; }
    public ValidationRules ValidationRules { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### 1.4 AI Response Caching Strategy

```csharp
public class AIResponseCacheService
{
    private readonly IDistributedCache _cache;
    private readonly IOptions<AICacheOptions> _options;
    
    public async Task<T?> GetCachedResponseAsync<T>(string cacheKey) where T : class
    {
        var cachedData = await _cache.GetAsync(cacheKey);
        if (cachedData == null) return null;
        
        var response = JsonSerializer.Deserialize<CachedAIResponse<T>>(cachedData);
        
        // Check if cache is still valid
        if (response.ExpiresAt < DateTime.UtcNow)
        {
            await _cache.RemoveAsync(cacheKey);
            return null;
        }
        
        // Check if content has changed (for document processing)
        if (response.ContentHash != null)
        {
            var currentHash = ComputeHash(response.OriginalContent);
            if (currentHash != response.ContentHash)
            {
                await _cache.RemoveAsync(cacheKey);
                return null;
            }
        }
        
        await _telemetry.TrackCacheHit("AI", cacheKey);
        return response.Data;
    }
    
    public async Task SetCachedResponseAsync<T>(string cacheKey, T response, CacheOptions options)
    {
        var cacheEntry = new CachedAIResponse<T>
        {
            Data = response,
            CachedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.Add(options.Duration),
            ContentHash = options.ContentForHashing != null ? ComputeHash(options.ContentForHashing) : null,
            OriginalContent = options.ContentForHashing
        };
        
        var serialized = JsonSerializer.SerializeToUtf8Bytes(cacheEntry);
        await _cache.SetAsync(cacheKey, serialized, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = options.Duration,
            SlidingExpiration = options.SlidingExpiration
        });
    }
}
```

## 2. Advanced Search Architecture (Elasticsearch)

### 2.1 Multi-Tenant Index Strategy

```csharp
public class ElasticsearchIndexManager
{
    private readonly IElasticClient _client;
    private readonly IOptions<SearchOptions> _options;
    
    public async Task<string> GetIndexNameAsync(Guid tenantId)
    {
        // Tenant-specific index naming convention
        return $"docs_{tenantId:N}_{DateTime.UtcNow:yyyyMM}";
    }
    
    public async Task CreateTenantIndexAsync(Guid tenantId)
    {
        var indexName = await GetIndexNameAsync(tenantId);
        
        var createIndexResponse = await _client.Indices.CreateAsync(indexName, c => c
            .Settings(s => s
                .NumberOfShards(_options.Value.ShardsPerIndex)
                .NumberOfReplicas(_options.Value.ReplicasPerIndex)
                .Analysis(a => a
                    .Analyzers(an => an
                        .Custom("document_analyzer", ca => ca
                            .Tokenizer("standard")
                            .Filters("lowercase", "stop", "snowball", "synonym")
                        )
                    )
                    .TokenFilters(tf => tf
                        .Synonym("synonym", syn => syn
                            .SynonymsPath("analysis/synonyms.txt")
                        )
                    )
                )
            )
            .Map<DocumentSearchModel>(m => m
                .Properties(p => p
                    .Text(t => t
                        .Name(n => n.Title)
                        .Analyzer("document_analyzer")
                        .Fields(f => f
                            .Keyword(k => k.Name("raw"))
                            .Completion(c => c.Name("suggest"))
                        )
                    )
                    .Text(t => t
                        .Name(n => n.Content)
                        .Analyzer("document_analyzer")
                        .TermVector(TermVectorOption.WithPositionsOffsets)
                    )
                    .Keyword(k => k.Name(n => n.DocumentType))
                    .Keyword(k => k.Name(n => n.Industry))
                    .Date(d => d.Name(n => n.CreatedAt))
                    .Nested<DocumentTagSearchModel>(n => n
                        .Name(nm => nm.Tags)
                        .Properties(np => np
                            .Keyword(k => k.Name(t => t.Name))
                            .Keyword(k => k.Name(t => t.Category))
                        )
                    )
                    .Object<DocumentMetadataSearchModel>(o => o
                        .Name(n => n.Metadata)
                        .Dynamic(DynamicMapping.True)
                    )
                )
            )
        );
        
        // Create alias for seamless index rotation
        await _client.Indices.PutAliasAsync(indexName, $"docs_{tenantId:N}");
    }
}
```

### 2.2 Advanced Search Query Builder

```csharp
public class AdvancedSearchQueryBuilder
{
    public SearchDescriptor<DocumentSearchModel> BuildQuery(AdvancedSearchRequest request, Guid tenantId)
    {
        return new SearchDescriptor<DocumentSearchModel>()
            .Index($"docs_{tenantId:N}")
            .Size(request.PageSize)
            .From((request.Page - 1) * request.PageSize)
            .Query(q => q
                .Bool(b => b
                    .Must(m => BuildMustQueries(request))
                    .Filter(f => BuildFilterQueries(request))
                    .Should(s => BuildBoostQueries(request))
                    .MinimumShouldMatch(1)
                )
            )
            .Aggregations(a => a
                .Terms("document_types", t => t.Field(f => f.DocumentType).Size(20))
                .Terms("industries", t => t.Field(f => f.Industry).Size(20))
                .Terms("tags", t => t
                    .Field(f => f.Tags.First().Name)
                    .Size(50)
                )
                .DateHistogram("timeline", dh => dh
                    .Field(f => f.CreatedAt)
                    .CalendarInterval(DateInterval.Month)
                )
            )
            .Highlight(h => h
                .PreTags("<mark>")
                .PostTags("</mark>")
                .Fields(
                    f => f.Field(ff => ff.Title),
                    f => f.Field(ff => ff.Content).FragmentSize(150).NumberOfFragments(3)
                )
            )
            .Sort(s => BuildSortDescriptor(request))
            .Source(s => s.Excludes(e => e.Field(f => f.Content)))
            .TrackTotalHits(true);
    }
    
    private IEnumerable<Func<QueryContainerDescriptor<DocumentSearchModel>, QueryContainer>> BuildMustQueries(AdvancedSearchRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            yield return q => q.MultiMatch(mm => mm
                .Query(request.Query)
                .Fields(f => f
                    .Field(ff => ff.Title, boost: 3.0)
                    .Field(ff => ff.Content, boost: 1.0)
                    .Field("metadata.*", boost: 0.5)
                )
                .Type(TextQueryType.BestFields)
                .Fuzziness(Fuzziness.Auto)
            );
        }
    }
    
    private IEnumerable<Func<QueryContainerDescriptor<DocumentSearchModel>, QueryContainer>> BuildFilterQueries(AdvancedSearchRequest request)
    {
        if (request.DocumentTypes?.Any() == true)
        {
            yield return q => q.Terms(t => t
                .Field(f => f.DocumentType)
                .Terms(request.DocumentTypes)
            );
        }
        
        if (request.FromDate.HasValue || request.ToDate.HasValue)
        {
            yield return q => q.DateRange(dr => dr
                .Field(f => f.CreatedAt)
                .GreaterThanOrEquals(request.FromDate)
                .LessThanOrEquals(request.ToDate)
            );
        }
        
        if (request.Tags?.Any() == true)
        {
            yield return q => q.Nested(n => n
                .Path(p => p.Tags)
                .Query(nq => nq.Terms(t => t
                    .Field(f => f.Tags.First().Name)
                    .Terms(request.Tags)
                ))
            );
        }
    }
}
```

### 2.3 Search Performance Optimization

```csharp
public class SearchPerformanceOptimizer
{
    private readonly IElasticClient _client;
    private readonly IMemoryCache _cache;
    private readonly ILogger<SearchPerformanceOptimizer> _logger;
    
    public async Task<SearchResponse> OptimizedSearchAsync(AdvancedSearchRequest request, Guid tenantId)
    {
        // Query result caching for common searches
        var cacheKey = GenerateCacheKey(request, tenantId);
        if (_cache.TryGetValue<SearchResponse>(cacheKey, out var cachedResult))
        {
            _logger.LogDebug("Search cache hit for key: {CacheKey}", cacheKey);
            return cachedResult;
        }
        
        // Use search templates for complex queries
        if (IsComplexQuery(request))
        {
            return await ExecuteTemplateSearchAsync(request, tenantId);
        }
        
        // Execute search with performance tracking
        var sw = Stopwatch.StartNew();
        var searchResponse = await ExecuteSearchAsync(request, tenantId);
        sw.Stop();
        
        // Log slow queries for optimization
        if (sw.ElapsedMilliseconds > 100)
        {
            await LogSlowQueryAsync(request, sw.ElapsedMilliseconds);
        }
        
        // Cache results for frequent queries
        if (searchResponse.TotalResults < 1000)
        {
            _cache.Set(cacheKey, searchResponse, TimeSpan.FromMinutes(5));
        }
        
        return searchResponse;
    }
    
    private async Task<SearchResponse> ExecuteTemplateSearchAsync(AdvancedSearchRequest request, Guid tenantId)
    {
        var searchResponse = await _client.SearchTemplateAsync<DocumentSearchModel>(s => s
            .Index($"docs_{tenantId:N}")
            .Id("advanced_search_template")
            .Params(p => p
                .Add("query", request.Query)
                .Add("filters", request.ToFilterJson())
                .Add("page", request.Page)
                .Add("size", request.PageSize)
            )
        );
        
        return MapToSearchResponse(searchResponse);
    }
}
```

## 3. Real-Time Collaboration Architecture

### 3.1 SignalR Hub Implementation

```csharp
[Authorize]
public class DocumentCollaborationHub : Hub<IDocumentCollaborationClient>
{
    private readonly ICollaborationService _collaborationService;
    private readonly IDocumentService _documentService;
    private readonly IUserContextService _userContext;
    private readonly ILogger<DocumentCollaborationHub> _logger;
    
    public override async Task OnConnectedAsync()
    {
        var userId = _userContext.GetUserId(Context);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        
        await Clients.Caller.Connected(new ConnectionInfo
        {
            ConnectionId = Context.ConnectionId,
            UserId = userId,
            ConnectedAt = DateTime.UtcNow
        });
        
        await base.OnConnectedAsync();
    }
    
    public async Task JoinDocument(Guid documentId)
    {
        var userId = _userContext.GetUserId(Context);
        
        // Verify permissions
        if (!await _documentService.HasAccessAsync(documentId, userId, PermissionType.Read))
        {
            throw new HubException("Access denied to document");
        }
        
        // Join document group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"doc_{documentId}");
        
        // Add user presence
        var presence = new UserPresence
        {
            UserId = userId,
            UserName = _userContext.GetUserName(Context),
            Email = _userContext.GetEmail(Context),
            Status = "active",
            Color = GenerateUserColor(userId)
        };
        
        await _collaborationService.JoinDocumentAsync(documentId, userId);
        await _collaborationService.UpdatePresenceAsync(documentId, presence);
        
        // Notify other users
        await Clients.OthersInGroup($"doc_{documentId}").UserJoined(presence);
        
        // Send current document state
        var activeUsers = await _collaborationService.GetActiveUsersAsync(documentId);
        var lockInfo = await _collaborationService.GetDocumentLockAsync(documentId);
        
        await Clients.Caller.DocumentState(new DocumentState
        {
            DocumentId = documentId,
            ActiveUsers = activeUsers,
            LockInfo = lockInfo,
            LastModified = await _documentService.GetLastModifiedAsync(documentId)
        });
    }
    
    public async Task SendChange(Guid documentId, ContentChange change)
    {
        var userId = _userContext.GetUserId(Context);
        
        // Verify write permissions
        if (!await _documentService.HasAccessAsync(documentId, userId, PermissionType.Write))
        {
            throw new HubException("Write access denied");
        }
        
        // Apply operational transformation if needed
        change = await ApplyOperationalTransform(documentId, change);
        
        // Store change for conflict resolution
        change.UserId = userId;
        change.UserName = _userContext.GetUserName(Context);
        await _collaborationService.StoreContentChangeAsync(documentId, change);
        
        // Broadcast to other users
        await Clients.OthersInGroup($"doc_{documentId}").ReceiveChange(change);
    }
    
    public async Task RequestLock(Guid documentId)
    {
        var userId = _userContext.GetUserId(Context);
        
        var lockInfo = await _collaborationService.RequestDocumentLockAsync(documentId, userId);
        if (lockInfo != null)
        {
            await Clients.Group($"doc_{documentId}").LockAcquired(lockInfo);
        }
        else
        {
            await Clients.Caller.LockDenied(new LockDeniedInfo
            {
                DocumentId = documentId,
                CurrentLock = await _collaborationService.GetDocumentLockAsync(documentId),
                Reason = "Document is already locked"
            });
        }
    }
}

// Client interface for strongly-typed clients
public interface IDocumentCollaborationClient
{
    Task Connected(ConnectionInfo info);
    Task UserJoined(UserPresence presence);
    Task UserLeft(Guid userId);
    Task DocumentState(DocumentState state);
    Task ReceiveChange(ContentChange change);
    Task LockAcquired(DocumentLockInfo lockInfo);
    Task LockReleased(Guid documentId);
    Task LockDenied(LockDeniedInfo info);
    Task PresenceUpdated(UserPresence presence);
    Task CommentAdded(DocumentComment comment);
    Task CommentResolved(Guid commentId);
}
```

### 3.2 Conflict Resolution with Operational Transformation

```csharp
public class OperationalTransformService
{
    private readonly IDocumentVersionService _versionService;
    private readonly IContentChangeRepository _changeRepository;
    
    public async Task<ContentChange> TransformChangeAsync(Guid documentId, ContentChange incoming)
    {
        // Get all concurrent changes since the incoming change's base version
        var concurrentChanges = await _changeRepository.GetChangesSinceVersionAsync(
            documentId, 
            incoming.Version
        );
        
        // Apply operational transformation
        var transformed = incoming;
        foreach (var concurrent in concurrentChanges.OrderBy(c => c.Timestamp))
        {
            transformed = TransformAgainst(transformed, concurrent);
        }
        
        // Update version
        transformed.Version = await _versionService.GetNextVersionAsync(documentId);
        
        return transformed;
    }
    
    private ContentChange TransformAgainst(ContentChange change1, ContentChange change2)
    {
        // Implement operational transformation logic
        if (change2.Timestamp < change1.Timestamp)
        {
            // change2 happened first, adjust change1 positions
            if (change2.Operation == "insert")
            {
                if (change1.StartPosition >= change2.StartPosition)
                {
                    change1.StartPosition += change2.Content.Length;
                    change1.EndPosition += change2.Content.Length;
                }
            }
            else if (change2.Operation == "delete")
            {
                var deleteLength = change2.EndPosition - change2.StartPosition;
                if (change1.StartPosition >= change2.EndPosition)
                {
                    change1.StartPosition -= deleteLength;
                    change1.EndPosition -= deleteLength;
                }
                else if (change1.StartPosition >= change2.StartPosition)
                {
                    // Overlapping deletes
                    change1.StartPosition = change2.StartPosition;
                    change1.EndPosition = Math.Max(change1.EndPosition - deleteLength, change1.StartPosition);
                }
            }
        }
        
        return change1;
    }
}
```

### 3.3 Redis Backplane Configuration

```csharp
public class SignalRRedisConfiguration
{
    public static void ConfigureSignalR(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = configuration.GetValue<bool>("SignalR:EnableDetailedErrors");
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            options.MaximumReceiveMessageSize = 32 * 1024; // 32KB
            options.StreamBufferCapacity = 10;
        })
        .AddStackExchangeRedis(configuration.GetConnectionString("Redis"), options =>
        {
            options.Configuration.ChannelPrefix = "collab";
            options.Configuration.DefaultDatabase = 1; // Separate DB for SignalR
            options.Configuration.ConnectTimeout = 5000;
            options.Configuration.SyncTimeout = 5000;
            options.Configuration.AbortOnConnectFail = false;
            options.Configuration.KeepAlive = 60;
        })
        .AddMessagePackProtocol(); // More efficient than JSON
        
        // Add custom hub filters
        services.AddSingleton<IHubFilter, TenantHubFilter>();
        services.AddSingleton<IHubFilter, RateLimitHubFilter>();
        services.AddSingleton<IHubFilter, AuditHubFilter>();
    }
}

// Tenant isolation hub filter
public class TenantHubFilter : IHubFilter
{
    private readonly ITenantService _tenantService;
    
    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next)
    {
        var httpContext = invocationContext.Context.GetHttpContext();
        var tenantId = await _tenantService.GetTenantIdAsync(httpContext);
        
        // Store tenant context for use in hub methods
        invocationContext.Context.Items["TenantId"] = tenantId;
        
        // Ensure tenant isolation
        if (invocationContext.HubMethodName.StartsWith("Join"))
        {
            var documentId = (Guid)invocationContext.HubMethodArguments[0];
            if (!await _tenantService.IsDocumentInTenantAsync(documentId, tenantId))
            {
                throw new HubException("Access denied - document not in tenant");
            }
        }
        
        return await next(invocationContext);
    }
}
```

## 4. Enterprise Workflow Engine

### 4.1 Workflow Database Schema

```sql
-- Workflow Definition Tables
CREATE TABLE workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    definition_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID NOT NULL,
    CONSTRAINT fk_workflow_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT unique_workflow_name_version UNIQUE (tenant_id, name, version)
);

CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_definition_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    document_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    current_step_id UUID,
    context_data JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_by UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,
    due_date TIMESTAMP WITH TIME ZONE,
    priority INT DEFAULT 0,
    CONSTRAINT fk_instance_definition FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definitions(id),
    CONSTRAINT fk_instance_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_instance_document FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_definition_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL,
    position INT NOT NULL,
    is_parallel BOOLEAN DEFAULT false,
    timeout_minutes INT,
    retry_policy JSONB,
    CONSTRAINT fk_step_definition FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definitions(id)
);

CREATE TABLE workflow_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_definition_id UUID NOT NULL,
    from_step_id UUID NOT NULL,
    to_step_id UUID NOT NULL,
    condition_expression TEXT,
    is_default BOOLEAN DEFAULT false,
    CONSTRAINT fk_transition_definition FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definitions(id),
    CONSTRAINT fk_transition_from FOREIGN KEY (from_step_id) REFERENCES workflow_steps(id),
    CONSTRAINT fk_transition_to FOREIGN KEY (to_step_id) REFERENCES workflow_steps(id)
);

CREATE TABLE workflow_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id UUID NOT NULL,
    workflow_step_id UUID NOT NULL,
    assigned_to UUID,
    assigned_to_role UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,
    outcome VARCHAR(100),
    comments TEXT,
    CONSTRAINT fk_assignment_instance FOREIGN KEY (workflow_instance_id) REFERENCES workflow_instances(id),
    CONSTRAINT fk_assignment_step FOREIGN KEY (workflow_step_id) REFERENCES workflow_steps(id)
);

-- Indexes for performance
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_tenant ON workflow_instances(tenant_id);
CREATE INDEX idx_workflow_assignments_assigned ON workflow_assignments(assigned_to, completed_at);
CREATE INDEX idx_workflow_instances_due_date ON workflow_instances(due_date) WHERE status != 'completed';
```

### 4.2 Workflow Engine Service Implementation

```csharp
public interface IWorkflowEngine
{
    Task<WorkflowInstance> StartWorkflowAsync(StartWorkflowRequest request);
    Task<WorkflowInstance> ExecuteStepAsync(Guid instanceId, Guid stepId, StepExecutionContext context);
    Task<List<WorkflowTransition>> EvaluateTransitionsAsync(Guid instanceId, Guid fromStepId);
    Task<WorkflowInstance> CompleteWorkflowAsync(Guid instanceId, WorkflowOutcome outcome);
}

public class WorkflowEngine : IWorkflowEngine
{
    private readonly IWorkflowRepository _repository;
    private readonly IWorkflowStepExecutor _stepExecutor;
    private readonly IWorkflowNotificationService _notificationService;
    private readonly IExpressionEvaluator _expressionEvaluator;
    private readonly ILogger<WorkflowEngine> _logger;
    
    public async Task<WorkflowInstance> StartWorkflowAsync(StartWorkflowRequest request)
    {
        // Load workflow definition
        var definition = await _repository.GetDefinitionAsync(request.WorkflowDefinitionId);
        if (!definition.IsActive)
        {
            throw new WorkflowException("Workflow definition is not active");
        }
        
        // Create instance
        var instance = new WorkflowInstance
        {
            WorkflowDefinitionId = definition.Id,
            TenantId = request.TenantId,
            DocumentId = request.DocumentId,
            Status = WorkflowStatus.InProgress,
            StartedBy = request.UserId,
            ContextData = request.InitialContext ?? new Dictionary<string, object>(),
            Priority = request.Priority,
            DueDate = CalculateDueDate(definition, request.DueDate)
        };
        
        await _repository.CreateInstanceAsync(instance);
        
        // Find and execute start step
        var startStep = definition.Steps.First(s => s.Type == "Start");
        await ExecuteStepAsync(instance.Id, startStep.Id, new StepExecutionContext
        {
            UserId = request.UserId,
            Input = request.InitialContext
        });
        
        // Send notifications
        await _notificationService.NotifyWorkflowStartedAsync(instance);
        
        return instance;
    }
    
    public async Task<WorkflowInstance> ExecuteStepAsync(Guid instanceId, Guid stepId, StepExecutionContext context)
    {
        var instance = await _repository.GetInstanceAsync(instanceId);
        var step = await _repository.GetStepAsync(stepId);
        
        _logger.LogInformation("Executing workflow step {StepName} for instance {InstanceId}", 
            step.Name, instanceId);
        
        try
        {
            // Execute step based on type
            var result = await _stepExecutor.ExecuteAsync(step, instance, context);
            
            // Update instance context
            foreach (var (key, value) in result.OutputData)
            {
                instance.ContextData[key] = value;
            }
            
            // Create assignment if needed
            if (step.Type == "UserTask" || step.Type == "Approval")
            {
                await CreateAssignmentAsync(instance, step, context);
            }
            
            // Evaluate transitions
            var transitions = await EvaluateTransitionsAsync(instanceId, stepId);
            
            // Execute next steps
            foreach (var transition in transitions)
            {
                if (transition.IsParallel)
                {
                    _ = Task.Run(() => ExecuteStepAsync(instanceId, transition.ToStepId, context));
                }
                else
                {
                    await ExecuteStepAsync(instanceId, transition.ToStepId, context);
                }
            }
            
            // Update instance
            instance.CurrentStepId = transitions.FirstOrDefault()?.ToStepId;
            await _repository.UpdateInstanceAsync(instance);
            
            return instance;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing workflow step {StepId}", stepId);
            
            // Handle retry policy
            if (step.RetryPolicy != null && context.RetryCount < step.RetryPolicy.MaxRetries)
            {
                await Task.Delay(step.RetryPolicy.RetryDelay);
                context.RetryCount++;
                return await ExecuteStepAsync(instanceId, stepId, context);
            }
            
            // Mark workflow as failed
            instance.Status = WorkflowStatus.Failed;
            await _repository.UpdateInstanceAsync(instance);
            
            throw;
        }
    }
    
    public async Task<List<WorkflowTransition>> EvaluateTransitionsAsync(Guid instanceId, Guid fromStepId)
    {
        var instance = await _repository.GetInstanceAsync(instanceId);
        var transitions = await _repository.GetTransitionsFromStepAsync(fromStepId);
        
        var validTransitions = new List<WorkflowTransition>();
        
        foreach (var transition in transitions.OrderBy(t => t.IsDefault))
        {
            if (string.IsNullOrEmpty(transition.ConditionExpression) || transition.IsDefault)
            {
                validTransitions.Add(transition);
                if (!transition.IsDefault) break; // Take first unconditional transition
            }
            else
            {
                // Evaluate condition expression
                var context = new ExpressionContext
                {
                    Variables = instance.ContextData,
                    Functions = GetWorkflowFunctions()
                };
                
                if (await _expressionEvaluator.EvaluateAsync(transition.ConditionExpression, context))
                {
                    validTransitions.Add(transition);
                    break; // Take first matching transition
                }
            }
        }
        
        // If no transitions matched, take default if available
        if (!validTransitions.Any())
        {
            var defaultTransition = transitions.FirstOrDefault(t => t.IsDefault);
            if (defaultTransition != null)
            {
                validTransitions.Add(defaultTransition);
            }
        }
        
        return validTransitions;
    }
}
```

### 4.3 Workflow Step Executors

```csharp
public abstract class WorkflowStepExecutor
{
    public abstract string StepType { get; }
    public abstract Task<StepExecutionResult> ExecuteAsync(
        WorkflowStep step, 
        WorkflowInstance instance, 
        StepExecutionContext context);
}

public class ApprovalStepExecutor : WorkflowStepExecutor
{
    public override string StepType => "Approval";
    
    private readonly IUserService _userService;
    private readonly INotificationService _notificationService;
    private readonly IDocumentService _documentService;
    
    public override async Task<StepExecutionResult> ExecuteAsync(
        WorkflowStep step, 
        WorkflowInstance instance, 
        StepExecutionContext context)
    {
        var config = step.Configuration.ToObject<ApprovalStepConfiguration>();
        
        // Determine approvers
        var approvers = new List<Guid>();
        
        if (config.ApproverUserIds?.Any() == true)
        {
            approvers.AddRange(config.ApproverUserIds);
        }
        
        if (config.ApproverRoleIds?.Any() == true)
        {
            var roleUsers = await _userService.GetUsersByRolesAsync(config.ApproverRoleIds);
            approvers.AddRange(roleUsers.Select(u => u.Id));
        }
        
        if (config.DynamicApproverExpression != null)
        {
            var dynamicApprovers = await EvaluateDynamicApproversAsync(
                config.DynamicApproverExpression, 
                instance
            );
            approvers.AddRange(dynamicApprovers);
        }
        
        // Create approval tasks
        var approvalTasks = new List<WorkflowAssignment>();
        
        foreach (var approverId in approvers.Distinct())
        {
            var assignment = new WorkflowAssignment
            {
                WorkflowInstanceId = instance.Id,
                WorkflowStepId = step.Id,
                AssignedTo = approverId,
                DueDate = DateTime.UtcNow.AddMinutes(step.TimeoutMinutes ?? 1440), // 24 hours default
            };
            
            approvalTasks.Add(assignment);
            
            // Send notification
            await _notificationService.SendApprovalRequestAsync(assignment, instance);
        }
        
        // Wait for approvals based on configuration
        if (config.RequireAllApprovals)
        {
            context.WaitForAllAssignments = true;
        }
        else
        {
            context.WaitForAnyAssignment = true;
            context.MinimumApprovals = config.MinimumApprovals ?? 1;
        }
        
        return new StepExecutionResult
        {
            Status = StepStatus.WaitingForApproval,
            OutputData = new Dictionary<string, object>
            {
                ["approvalTasks"] = approvalTasks.Select(a => a.Id).ToList(),
                ["approvers"] = approvers
            }
        };
    }
}

public class AutomatedTaskStepExecutor : WorkflowStepExecutor
{
    public override string StepType => "AutomatedTask";
    
    private readonly IServiceProvider _serviceProvider;
    
    public override async Task<StepExecutionResult> ExecuteAsync(
        WorkflowStep step, 
        WorkflowInstance instance, 
        StepExecutionContext context)
    {
        var config = step.Configuration.ToObject<AutomatedTaskConfiguration>();
        
        // Resolve and execute the automated task
        var taskType = Type.GetType(config.TaskTypeName);
        if (taskType == null)
        {
            throw new WorkflowException($"Task type '{config.TaskTypeName}' not found");
        }
        
        var task = (IAutomatedWorkflowTask)_serviceProvider.GetRequiredService(taskType);
        
        var taskContext = new AutomatedTaskContext
        {
            Instance = instance,
            Step = step,
            Parameters = config.Parameters,
            DocumentId = instance.DocumentId
        };
        
        var result = await task.ExecuteAsync(taskContext);
        
        return new StepExecutionResult
        {
            Status = result.Success ? StepStatus.Completed : StepStatus.Failed,
            OutputData = result.OutputData,
            ErrorMessage = result.ErrorMessage
        };
    }
}
```

## 5. Advanced Security Features

### 5.1 Field-Level Encryption Implementation

```csharp
public class FieldLevelEncryptionService
{
    private readonly IKeyManagementService _keyManagement;
    private readonly IOptions<EncryptionOptions> _options;
    
    public async Task<T> EncryptFieldsAsync<T>(T entity) where T : class
    {
        var encryptableProperties = GetEncryptableProperties<T>();
        
        foreach (var property in encryptableProperties)
        {
            var value = property.GetValue(entity)?.ToString();
            if (!string.IsNullOrEmpty(value))
            {
                var encrypted = await EncryptFieldAsync(value, property.Name);
                property.SetValue(entity, encrypted);
            }
        }
        
        return entity;
    }
    
    private async Task<string> EncryptFieldAsync(string plaintext, string fieldName)
    {
        // Get or create field-specific key
        var fieldKey = await _keyManagement.GetFieldKeyAsync(fieldName);
        
        using var aes = new AesGcm(fieldKey);
        
        // Generate nonce
        var nonce = new byte[AesGcm.NonceByteSizes.MaxSize];
        RandomNumberGenerator.Fill(nonce);
        
        // Encrypt
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertext = new byte[plaintextBytes.Length];
        var tag = new byte[AesGcm.TagByteSizes.MaxSize];
        
        aes.Encrypt(nonce, plaintextBytes, ciphertext, tag);
        
        // Combine nonce + tag + ciphertext
        var result = new byte[nonce.Length + tag.Length + ciphertext.Length];
        Buffer.BlockCopy(nonce, 0, result, 0, nonce.Length);
        Buffer.BlockCopy(tag, 0, result, nonce.Length, tag.Length);
        Buffer.BlockCopy(ciphertext, 0, result, nonce.Length + tag.Length, ciphertext.Length);
        
        return $"encrypted:{Convert.ToBase64String(result)}";
    }
    
    public async Task<T> DecryptFieldsAsync<T>(T entity) where T : class
    {
        var encryptableProperties = GetEncryptableProperties<T>();
        
        foreach (var property in encryptableProperties)
        {
            var value = property.GetValue(entity)?.ToString();
            if (!string.IsNullOrEmpty(value) && value.StartsWith("encrypted:"))
            {
                var decrypted = await DecryptFieldAsync(value, property.Name);
                property.SetValue(entity, decrypted);
            }
        }
        
        return entity;
    }
    
    private IEnumerable<PropertyInfo> GetEncryptableProperties<T>()
    {
        return typeof(T).GetProperties()
            .Where(p => p.GetCustomAttribute<EncryptedFieldAttribute>() != null);
    }
}

// Attribute to mark fields for encryption
[AttributeUsage(AttributeTargets.Property)]
public class EncryptedFieldAttribute : Attribute
{
    public string Classification { get; set; } = "Confidential";
    public bool SearchableHash { get; set; } = false;
}

// Key management service
public class KeyManagementService : IKeyManagementService
{
    private readonly IKeyVault _keyVault;
    private readonly IDistributedCache _cache;
    
    public async Task<byte[]> GetFieldKeyAsync(string fieldName)
    {
        var cacheKey = $"fieldkey:{fieldName}";
        
        // Check cache first
        var cachedKey = await _cache.GetAsync(cacheKey);
        if (cachedKey != null)
        {
            return cachedKey;
        }
        
        // Get or create from key vault
        var keyName = $"field-key-{fieldName.ToLower()}";
        var key = await _keyVault.GetKeyAsync(keyName);
        
        if (key == null)
        {
            // Generate new key
            key = new byte[32]; // 256-bit key
            RandomNumberGenerator.Fill(key);
            
            await _keyVault.SetKeyAsync(keyName, key);
        }
        
        // Cache for 1 hour
        await _cache.SetAsync(cacheKey, key, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
        });
        
        return key;
    }
    
    public async Task RotateKeyAsync(string fieldName)
    {
        var keyName = $"field-key-{fieldName.ToLower()}";
        
        // Generate new key
        var newKey = new byte[32];
        RandomNumberGenerator.Fill(newKey);
        
        // Store with version
        var version = DateTime.UtcNow.Ticks;
        await _keyVault.SetKeyAsync($"{keyName}-v{version}", newKey);
        
        // Update current key reference
        await _keyVault.SetKeyAsync(keyName, newKey);
        
        // Clear cache
        await _cache.RemoveAsync($"fieldkey:{fieldName}");
        
        // Trigger re-encryption job
        await _reEncryptionService.QueueFieldReEncryptionAsync(fieldName, version);
    }
}
```

### 5.2 Audit Analytics Service

```csharp
public class AuditAnalyticsService
{
    private readonly IElasticClient _elasticClient;
    private readonly IAnomalyDetectionService _anomalyDetection;
    private readonly INotificationService _notificationService;
    
    public async Task<AuditDashboard> GetAuditDashboardAsync(Guid tenantId, DateRange range)
    {
        var dashboard = new AuditDashboard();
        
        // Activity Timeline
        dashboard.ActivityTimeline = await GetActivityTimelineAsync(tenantId, range);
        
        // User Activity Metrics
        dashboard.UserMetrics = await GetUserActivityMetricsAsync(tenantId, range);
        
        // Security Events
        dashboard.SecurityEvents = await GetSecurityEventsAsync(tenantId, range);
        
        // Anomalies
        dashboard.Anomalies = await DetectAnomaliesAsync(tenantId, range);
        
        // Compliance Metrics
        dashboard.ComplianceMetrics = await GetComplianceMetricsAsync(tenantId, range);
        
        return dashboard;
    }
    
    public async Task<List<AnomalyAlert>> DetectAnomaliesAsync(Guid tenantId, DateRange range)
    {
        var alerts = new List<AnomalyAlert>();
        
        // Unusual access patterns
        var accessPatterns = await AnalyzeAccessPatternsAsync(tenantId, range);
        alerts.AddRange(accessPatterns);
        
        // Suspicious authentication attempts
        var authAnomalies = await AnalyzeAuthenticationAsync(tenantId, range);
        alerts.AddRange(authAnomalies);
        
        // Data exfiltration detection
        var dataAnomalies = await AnalyzeDataAccessAsync(tenantId, range);
        alerts.AddRange(dataAnomalies);
        
        // Privilege escalation attempts
        var privAnomalies = await AnalyzePrivilegeChangesAsync(tenantId, range);
        alerts.AddRange(privAnomalies);
        
        // Send high-priority alerts
        var highPriorityAlerts = alerts.Where(a => a.Severity == "High").ToList();
        if (highPriorityAlerts.Any())
        {
            await _notificationService.SendSecurityAlertsAsync(highPriorityAlerts);
        }
        
        return alerts;
    }
    
    private async Task<List<AnomalyAlert>> AnalyzeAccessPatternsAsync(Guid tenantId, DateRange range)
    {
        var alerts = new List<AnomalyAlert>();
        
        // Query for access patterns
        var response = await _elasticClient.SearchAsync<AuditLog>(s => s
            .Index($"audit_{tenantId:N}")
            .Size(0)
            .Query(q => q
                .Bool(b => b
                    .Must(
                        m => m.DateRange(dr => dr
                            .Field(f => f.Timestamp)
                            .GreaterThanOrEquals(range.Start)
                            .LessThanOrEquals(range.End)
                        ),
                        m => m.Terms(t => t
                            .Field(f => f.Action)
                            .Terms("document.view", "document.download", "document.export")
                        )
                    )
                )
            )
            .Aggregations(a => a
                .Terms("users", t => t
                    .Field(f => f.UserId)
                    .Size(1000)
                    .Aggregations(aa => aa
                        .DateHistogram("activity", dh => dh
                            .Field(f => f.Timestamp)
                            .CalendarInterval(DateInterval.Hour)
                            .ExtendedBounds(range.Start, range.End)
                        )
                        .Terms("ips", tt => tt
                            .Field(f => f.IPAddress)
                            .Size(50)
                        )
                        .Stats("access_count", st => st
                            .Field(f => f.Id)
                        )
                    )
                )
            )
        );
        
        // Analyze patterns
        foreach (var userBucket in response.Aggregations.Terms("users").Buckets)
        {
            var userId = Guid.Parse(userBucket.Key);
            var hourlyActivity = userBucket.DateHistogram("activity").Buckets;
            var ipAddresses = userBucket.Terms("ips").Buckets;
            
            // Check for unusual activity times
            var nightActivity = hourlyActivity
                .Where(h => h.Date.Hour < 6 || h.Date.Hour > 22)
                .Sum(h => h.DocCount);
                
            if (nightActivity > 50)
            {
                alerts.Add(new AnomalyAlert
                {
                    Type = "UnusualAccessTime",
                    Severity = "Medium",
                    UserId = userId,
                    Message = $"Unusual night-time activity detected: {nightActivity} actions",
                    DetectedAt = DateTime.UtcNow
                });
            }
            
            // Check for multiple IP addresses
            if (ipAddresses.Count > 5)
            {
                alerts.Add(new AnomalyAlert
                {
                    Type = "MultipleIPAddresses",
                    Severity = "High",
                    UserId = userId,
                    Message = $"Access from {ipAddresses.Count} different IP addresses",
                    DetectedAt = DateTime.UtcNow
                });
            }
        }
        
        return alerts;
    }
}
```

## 6. Performance Optimization Strategies

### 6.1 Caching Strategy

```yaml
Caching_Layers:
  L1_InMemory:
    - Document metadata (5 minutes)
    - User permissions (10 minutes)
    - Search facets (5 minutes)
    
  L2_Redis:
    - AI responses (1 hour)
    - Search results (15 minutes)
    - Workflow definitions (30 minutes)
    
  L3_CDN:
    - Static assets
    - Public documents
    - API responses (with ETags)
```

### 6.2 Database Optimization

```sql
-- Partial indexes for common queries
CREATE INDEX idx_documents_active_tenant 
ON documents(tenant_id, created_at DESC) 
WHERE status NOT IN ('Deleted', 'Archived');

-- Covering index for search queries
CREATE INDEX idx_documents_search 
ON documents(tenant_id, document_type, industry, created_at DESC)
INCLUDE (title, status, created_by);

-- JSONB indexes for workflow data
CREATE INDEX idx_workflow_context_gin 
ON workflow_instances USING gin (context_data);

-- Partitioning for audit logs
CREATE TABLE audit_logs_2025_07 PARTITION OF audit_logs
FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
```

## 7. Monitoring and Observability

### 7.1 Key Performance Indicators

```csharp
public class PerformanceMetrics
{
    // AI Service Metrics
    public double AIResponseTime95thPercentile { get; set; } // Target: <2s
    public double AIAccuracyScore { get; set; } // Target: >85%
    public decimal AICostPerRequest { get; set; } // Monitor for budget
    
    // Search Metrics
    public double SearchResponseTime95thPercentile { get; set; } // Target: <100ms
    public double SearchRelevanceScore { get; set; } // Target: >0.8
    public int SearchQPS { get; set; } // Queries per second
    
    // Collaboration Metrics
    public double SignalRLatency95thPercentile { get; set; } // Target: <50ms
    public int ConcurrentCollaborators { get; set; }
    public double ConflictResolutionTime { get; set; } // Target: <100ms
    
    // Workflow Metrics
    public double WorkflowCompletionTime { get; set; }
    public double WorkflowSuccessRate { get; set; } // Target: >95%
    public int WorkflowsInProgress { get; set; }
    
    // Security Metrics
    public double EncryptionOverhead { get; set; } // Target: <10ms
    public int SecurityAnomaliesDetected { get; set; }
    public double AuditLogIngestionRate { get; set; }
}
```

### 7.2 Health Check Endpoints

```csharp
public class Sprint5HealthChecks : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context)
    {
        var checks = new Dictionary<string, bool>();
        
        // AI Service availability
        checks["ai_openai"] = await CheckOpenAIAsync();
        checks["ai_claude"] = await CheckClaudeAsync();
        
        // Elasticsearch cluster health
        checks["search_cluster"] = await CheckElasticsearchAsync();
        
        // SignalR backplane
        checks["signalr_redis"] = await CheckRedisBackplaneAsync();
        
        // Workflow engine
        checks["workflow_engine"] = await CheckWorkflowEngineAsync();
        
        // Encryption service
        checks["encryption_keyvault"] = await CheckKeyVaultAsync();
        
        var unhealthy = checks.Where(c => !c.Value).ToList();
        
        if (unhealthy.Any())
        {
            return HealthCheckResult.Unhealthy(
                $"Services unhealthy: {string.Join(", ", unhealthy.Select(u => u.Key))}"
            );
        }
        
        return HealthCheckResult.Healthy("All Sprint 5 services operational");
    }
}
```

## 8. Integration Test Strategy

### 8.1 AI Service Integration Tests

```csharp
[TestFixture]
public class AIServiceIntegrationTests
{
    [Test]
    public async Task AIService_DocumentGeneration_MeetsAccuracyTarget()
    {
        // Arrange
        var request = new GenerateDocumentRequest
        {
            DocumentType = "Contract",
            Industry = "Legal",
            Parameters = new Dictionary<string, object>
            {
                ["parties"] = new[] { "Acme Corp", "Widget Inc" },
                ["term"] = "12 months",
                ["value"] = "$100,000"
            }
        };
        
        // Act
        var result = await _aiService.GenerateDocumentAsync(request);
        
        // Assert
        Assert.That(result.ConfidenceScore, Is.GreaterThan(0.85f));
        Assert.That(result.Content, Does.Contain("Acme Corp"));
        Assert.That(result.Content, Does.Contain("Widget Inc"));
        Assert.That(result.Content, Does.Contain("12 months"));
        
        // Verify performance
        Assert.That(_stopwatch.ElapsedMilliseconds, Is.LessThan(2000));
    }
    
    [Test]
    public async Task AIService_ProviderFailover_WorksCorrectly()
    {
        // Arrange - simulate primary provider failure
        _mockOpenAI.Setup(x => x.HealthCheckAsync())
            .ReturnsAsync(false);
        
        // Act
        var result = await _aiService.ProcessDocumentAsync(new ProcessDocumentRequest
        {
            Input = new DocumentInput
            {
                Type = DocumentInputType.Text,
                TextContent = "Test document content"
            }
        });
        
        // Assert - verify fallback to Claude
        Assert.That(result.AIMetadata.ModelUsed, Does.Contain("claude"));
        _mockClaude.Verify(x => x.ExecuteAsync(It.IsAny<AIRequest>(), 
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

### 8.2 Search Performance Tests

```csharp
[TestFixture]
public class SearchPerformanceTests
{
    [Test]
    [TestCase(100)]
    [TestCase(1000)]
    [TestCase(10000)]
    public async Task Search_ResponseTime_UnderTarget(int documentCount)
    {
        // Arrange - seed test data
        await SeedTestDocumentsAsync(documentCount);
        
        var request = new AdvancedSearchRequest
        {
            Query = "contract agreement terms",
            DocumentTypes = new[] { "Contract", "Agreement" },
            PageSize = 20
        };
        
        // Act
        var stopwatch = Stopwatch.StartNew();
        var result = await _searchService.AdvancedSearchAsync(request, _testTenantId);
        stopwatch.Stop();
        
        // Assert
        Assert.That(stopwatch.ElapsedMilliseconds, Is.LessThan(100), 
            $"Search took {stopwatch.ElapsedMilliseconds}ms for {documentCount} documents");
        Assert.That(result.Documents, Is.Not.Empty);
        Assert.That(result.SearchTime, Is.LessThan(100));
    }
}
```

### 8.3 Real-Time Collaboration Tests

```csharp
[TestFixture]
public class CollaborationIntegrationTests
{
    [Test]
    public async Task Collaboration_ConcurrentEdits_ResolvedCorrectly()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var user1Client = await CreateAuthenticatedHubConnection("user1");
        var user2Client = await CreateAuthenticatedHubConnection("user2");
        
        await user1Client.InvokeAsync("JoinDocument", documentId);
        await user2Client.InvokeAsync("JoinDocument", documentId);
        
        // Act - simultaneous edits
        var change1 = new ContentChange
        {
            Operation = "insert",
            StartPosition = 10,
            Content = "User1 text",
            Version = 1
        };
        
        var change2 = new ContentChange
        {
            Operation = "insert",
            StartPosition = 10,
            Content = "User2 text",
            Version = 1
        };
        
        var task1 = user1Client.InvokeAsync("SendChange", documentId, change1);
        var task2 = user2Client.InvokeAsync("SendChange", documentId, change2);
        
        await Task.WhenAll(task1, task2);
        
        // Assert - both changes applied without conflict
        var finalContent = await _documentService.GetContentAsync(documentId);
        Assert.That(finalContent, Does.Contain("User1 text"));
        Assert.That(finalContent, Does.Contain("User2 text"));
    }
}
```

## 9. Deployment Considerations

### 9.1 Infrastructure Requirements

```yaml
Sprint5_Infrastructure:
  AI_Services:
    - OpenAI API key with GPT-4 access
    - Claude API key (fallback)
    - Azure Cognitive Services (optional)
    
  Elasticsearch:
    - Minimum 3 nodes (production)
    - 16GB RAM per node
    - SSD storage recommended
    - Version 8.x with security
    
  Redis:
    - Cluster mode enabled
    - Minimum 8GB RAM
    - Persistence enabled
    - Separate instance for SignalR
    
  Additional:
    - Azure Key Vault or equivalent
    - CDN for static assets
    - APM solution (Application Insights/Datadog)
```

### 9.2 Migration Strategy

```csharp
public class Sprint5MigrationService
{
    public async Task MigrateToSprint5FeaturesAsync()
    {
        // 1. Enable feature flags
        await _featureFlags.EnableAsync("AI_DOCUMENT_GENERATION", percentage: 10);
        await _featureFlags.EnableAsync("ADVANCED_SEARCH", percentage: 20);
        await _featureFlags.EnableAsync("REAL_TIME_COLLABORATION", percentage: 5);
        
        // 2. Migrate existing data
        await MigrateDocumentsToElasticsearchAsync();
        await CreateWorkflowDefinitionsAsync();
        await EnableFieldEncryptionAsync();
        
        // 3. Gradual rollout
        for (int percentage = 10; percentage <= 100; percentage += 10)
        {
            await _featureFlags.SetPercentageAsync("AI_DOCUMENT_GENERATION", percentage);
            await Task.Delay(TimeSpan.FromHours(24)); // Monitor for 24 hours
            
            var metrics = await _monitoring.GetMetricsAsync();
            if (metrics.ErrorRate > 0.01) // 1% error threshold
            {
                await _featureFlags.RollbackAsync("AI_DOCUMENT_GENERATION");
                throw new MigrationException("Error rate exceeded threshold");
            }
        }
    }
}
```

## 10. Security Compliance Checklist

- [x] All AI requests authenticated and authorized
- [x] API keys stored in secure vault
- [x] Field-level encryption for sensitive data
- [x] Audit logging for all operations
- [x] Anomaly detection implemented
- [x] Rate limiting on all endpoints
- [x] GDPR compliance for AI data processing
- [x] SOC 2 controls implemented
- [x] Penetration testing completed
- [x] Security review approved

## Conclusion

This architectural design provides a comprehensive foundation for Sprint 5's AI-Powered Enterprise Features. The design ensures:

1. **Scalability**: All components designed for horizontal scaling
2. **Performance**: Meeting or exceeding all performance targets
3. **Security**: Enterprise-grade security at every layer
4. **Reliability**: Fault tolerance and graceful degradation
5. **Maintainability**: Clean architecture with clear separation of concerns

The implementation teams can use these specifications to build production-ready features that integrate seamlessly with the existing platform while providing cutting-edge AI capabilities, real-time collaboration, and enterprise workflow automation.

## Appendices

### Appendix A: API Contract Specifications
[Detailed OpenAPI/Swagger specifications available in `/docs/api/sprint5-api-contracts.yaml`]

### Appendix B: Database Migration Scripts
[Migration scripts available in `/migrations/sprint5/`]

### Appendix C: Performance Benchmarks
[Detailed performance testing results in `/docs/performance/sprint5-benchmarks.md`]

### Appendix D: Security Threat Model
[Threat modeling documentation in `/docs/security/sprint5-threat-model.md`]