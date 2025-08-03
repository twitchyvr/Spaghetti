var builder = WebApplication.CreateBuilder(args);

// Add minimal services for a working API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

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
app.UseHttpsRedirection();
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

Console.WriteLine("Starting Enterprise Docs API - Sprint 7 Deployment Architecture Optimization...");
app.Run();