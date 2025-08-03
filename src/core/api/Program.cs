using EnterpriseDocsCore.API;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Add minimal services for a working API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure forwarded headers for reverse proxy support (DigitalOcean)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | 
                               Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "http://localhost:3001", 
                "https://localhost:3001",
                "https://spaghetti-platform-drgev.ondigitalocean.app"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure minimal pipeline
if (app.Environment.IsProduction())
{
    // In production (DigitalOcean), trust the proxy for HTTPS
    app.UseForwardedHeaders();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");
app.MapControllers();

// Health endpoints
app.MapGet("/health", () => Results.Ok(new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow, 
    service = "enterprise-docs-api-sprint7",
    version = "0.0.16-alpha",
    phase = "Sprint 7 - Deployment Architecture Optimization",
    database = "connection-pending",
    deployment = "simplified-architecture"
})).AllowAnonymous();

app.MapGet("/api/health", () => Results.Ok(new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow, 
    service = "enterprise-docs-api-sprint7",
    version = "0.0.16-alpha",
    phase = "Sprint 7 - Deployment Architecture Optimization",
    database = "connection-pending",
    deployment = "simplified-architecture"
})).AllowAnonymous();

// Basic API endpoints for frontend compatibility
app.MapGet("/api/admin/database-stats", () => Results.Ok(new { 
    totalDocuments = 7,
    totalUsers = 8,
    totalTenants = 3,
    totalCollections = 5,
    systemHealth = "optimal",
    lastBackup = DateTime.UtcNow.AddHours(-12),
    storageUsed = "245 MB",
    storageLimit = "10 GB"
})).AllowAnonymous();

app.MapGet("/api/admin/sample-data-status", () => Results.Ok(new { 
    hasSampleData = true,
    lastSeeded = DateTime.UtcNow.AddDays(-1),
    recordCount = new {
        tenants = 3,
        users = 8,
        documents = 7,
        tags = 20
    }
})).AllowAnonymous();

app.MapGet("/api/status", () => Results.Ok(new { 
    service = "Enterprise Documentation Platform API",
    version = "0.0.16-alpha",
    status = "operational",
    uptime = TimeSpan.FromMilliseconds(Environment.TickCount64),
    sprint = "Sprint 7 - Deployment Architecture Optimization",
    features = new {
        collaboration = "feature-flagged",
        workflowAutomation = "feature-flagged",
        basicOperations = "active"
    }
})).AllowAnonymous();

// Platform monitoring endpoints
app.MapGet("/api/platform/metrics", () => Results.Ok(new {
    cpu = new { usage = 35, trend = "stable" },
    memory = new { usage = 62, available = 38 },
    requests = new { total = 1250, perMinute = 42 },
    errors = new { count = 0, rate = 0 },
    activeUsers = 3,
    timestamp = DateTime.UtcNow
})).AllowAnonymous();

// Client management endpoints
app.MapGet("/api/clients", () => Results.Ok(new[] {
    new {
        id = "1",
        name = "Acme Legal",
        industry = "Legal",
        status = "active",
        userCount = 3,
        documentCount = 4,
        subscription = "Professional"
    },
    new {
        id = "2",
        name = "TechStart Inc",
        industry = "Technology",
        status = "trial",
        userCount = 2,
        documentCount = 2,
        subscription = "Trial"
    },
    new {
        id = "3",
        name = "Global Consulting Group",
        industry = "Consulting",
        status = "active",
        userCount = 3,
        documentCount = 1,
        subscription = "Enterprise"
    }
})).AllowAnonymous();

// Documents endpoint
app.MapGet("/api/documents", () => Results.Ok(new[] {
    new {
        id = "1",
        title = "Q4 2024 Strategic Plan",
        type = "Strategic Document",
        status = "published",
        lastModified = DateTime.UtcNow.AddDays(-2),
        author = "John Smith"
    },
    new {
        id = "2",
        title = "Product Requirements Document",
        type = "Technical Document",
        status = "draft",
        lastModified = DateTime.UtcNow.AddHours(-6),
        author = "Alice Johnson"
    }
})).AllowAnonymous();

// Feature Flag Management Endpoints
app.MapGet("/api/features", () => Results.Ok(FeatureFlags.GetFlagsByCategory())).AllowAnonymous();

app.MapGet("/api/features/all", () => Results.Ok(new {
    flags = FeatureFlags.GetAllFlags(),
    timestamp = DateTime.UtcNow,
    sprint = "Sprint 7 - Deployment Architecture Optimization"
})).AllowAnonymous();

app.MapPost("/api/features/{featureName}/enable", (string featureName) => {
    FeatureFlags.Enable(featureName);
    return Results.Ok(new {
        feature = featureName,
        enabled = true,
        timestamp = DateTime.UtcNow,
        message = $"Feature '{featureName}' has been enabled"
    });
}).AllowAnonymous();

app.MapPost("/api/features/{featureName}/disable", (string featureName) => {
    FeatureFlags.Disable(featureName);
    return Results.Ok(new {
        feature = featureName,
        enabled = false,
        timestamp = DateTime.UtcNow,
        message = $"Feature '{featureName}' has been disabled"
    });
}).AllowAnonymous();

app.MapPost("/api/features/rollout/phase1", () => {
    FeatureFlags.EnablePhase1Features();
    return Results.Ok(new {
        phase = "Phase 1",
        message = "Basic collaboration features enabled",
        features = new[] { "DocumentLocking", "PresenceAwareness" },
        timestamp = DateTime.UtcNow
    });
}).AllowAnonymous();

app.MapPost("/api/features/rollout/phase2", () => {
    FeatureFlags.EnablePhase2Features();
    return Results.Ok(new {
        phase = "Phase 2",
        message = "Real-time collaboration features enabled",
        features = new[] { "DocumentLocking", "PresenceAwareness", "RealTimeCollaboration", "CollaborativeEditing" },
        timestamp = DateTime.UtcNow
    });
}).AllowAnonymous();

app.MapPost("/api/features/rollout/phase3", () => {
    FeatureFlags.EnablePhase3Features();
    return Results.Ok(new {
        phase = "Phase 3",
        message = "Full workflow automation features enabled",
        features = new[] { "All Sprint 6 features" },
        timestamp = DateTime.UtcNow
    });
}).AllowAnonymous();

try
{
    Console.WriteLine("=== Enterprise Docs API - Sprint 7 Deployment Architecture Optimization ===");
    Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");
    Console.WriteLine($"Startup Time: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
    Console.WriteLine($"Process ID: {Environment.ProcessId}");
    Console.WriteLine($"Working Directory: {Environment.CurrentDirectory}");
    
    // Log the configured URLs
    var urls = builder.Configuration["ASPNETCORE_URLS"] ?? "http://0.0.0.0:8080";
    Console.WriteLine($"Configured URLs: {urls}");
    
    // Add startup delay for DigitalOcean initialization
    if (app.Environment.IsProduction())
    {
        Console.WriteLine("Production environment detected - applying startup delay...");
        await Task.Delay(5000); // 5 second delay
    }
    
    Console.WriteLine("Available endpoints:");
    Console.WriteLine("- GET /health (Health check endpoint)");
    Console.WriteLine("- GET /api/health (API Health check endpoint)");
    Console.WriteLine("- GET /api/status (API Status endpoint)");
    Console.WriteLine("- GET /api/features (Feature flags endpoint)");
    Console.WriteLine("- GET /api/admin/database-stats (Database stats endpoint)");
    Console.WriteLine("- GET /api/clients (Client management endpoint)");
    Console.WriteLine("- GET /api/documents (Documents endpoint)");
    Console.WriteLine("=== API STARTUP COMPLETE ===");
    
    // Force flush console output
    Console.Out.Flush();
    
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"=== CRITICAL STARTUP FAILURE ===");
    Console.WriteLine($"Error: {ex.Message}");
    Console.WriteLine($"Stack Trace: {ex.StackTrace}");
    Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
    Console.WriteLine("=== END CRITICAL FAILURE ===");
    
    // Re-throw to ensure the process exits with non-zero code
    throw;
}