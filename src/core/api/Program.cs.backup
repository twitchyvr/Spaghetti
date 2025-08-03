using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Infrastructure.Services;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.API.Extensions;
using EnterpriseDocsCore.API.Middleware;
using EnterpriseDocsCore.API.Authorization;
using EnterpriseDocsCore.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Enterprise Documentation Platform API", 
        Version = "v1",
        Description = "Comprehensive AI-powered enterprise documentation platform with JWT authentication",
        Contact = new OpenApiContact
        {
            Name = "Enterprise Docs Support",
            Email = "support@enterprisedocs.com"
        }
    });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme. 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Database configuration - abstracted for multiple providers
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var dbProvider = builder.Configuration.GetValue<string>("Database:Provider", "PostgreSQL");

switch (dbProvider.ToLower())
{
    case "postgresql":
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));
        break;
    case "sqlserver":
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));
        break;
    case "sqlite":
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(connectionString));
        break;
    default:
        throw new ArgumentException($"Unsupported database provider: {dbProvider}");
}

// Configure authentication - abstracted for multiple providers
builder.Services.ConfigureAuthentication(builder.Configuration);

// TODO: Temporarily disable tenant resolution until implementation is fixed
// builder.Services.AddTenantResolution(builder.Configuration);

// TODO: Temporarily disable custom authorization until implementation is fixed  
// builder.Services.AddCustomAuthorization();

// Configure enterprise services
builder.Services.ConfigureStorage(builder.Configuration);
// TODO: Temporarily disable AI services due to compilation errors
// builder.Services.ConfigureAIServices(builder.Configuration);
// TODO: Re-enable module system after fixing remaining interface implementations
// builder.Services.ConfigureModuleSystem(builder.Configuration);

// Add core services
builder.Services.AddUnitOfWork();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<DatabaseSeedingService>();

// Sprint 6: Add Workflow Services
builder.Services.AddScoped<IWorkflowService, WorkflowService>();
builder.Services.AddScoped<ICollaborationService, CollaborationService>();

// Health Monitoring Services
builder.Services.AddScoped<IHealthMonitoringService, HealthMonitoringService>();
builder.Services.AddScoped<IIncidentManagementService, IncidentManagementService>();
builder.Services.AddScoped<IMaintenanceService, MaintenanceService>();

// Add memory cache (always needed for local caching)
builder.Services.AddMemoryCache();

// Add Redis caching if configured (for distributed caching)
var redisConnection = builder.Configuration.GetConnectionString("Redis");

// Sprint 2: Add SignalR for real-time collaboration
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// Add Redis backplane for SignalR if configured and available
if (!string.IsNullOrEmpty(redisConnection))
{
    try 
    {
        builder.Services.AddSignalR().AddStackExchangeRedis(redisConnection);
        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnection;
        });
    }
    catch (Exception ex)
    {
        // Log the error but continue without Redis
        Console.WriteLine($"Warning: Could not connect to Redis: {ex.Message}. Continuing without Redis.");
    }
}
else
{
    // Fallback to in-memory cache when Redis is not available
    builder.Services.AddDistributedMemoryCache();
}

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Allow multiple frontend origins for development and production
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

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Enterprise Documentation Platform API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at the app's root
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();

// TODO: Temporarily disable tenant resolution middleware  
// app.UseTenantResolution();

app.UseAuthorization();

// Custom middleware
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapControllers();

// Add health endpoints for monitoring and DigitalOcean health checks
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow, service = "enterprise-docs-api" }))
   .AllowAnonymous();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow, service = "enterprise-docs-api" }))
   .AllowAnonymous();

// Add detailed health endpoint for monitoring
app.MapGet("/health/detailed", async (ApplicationDbContext context) => 
{
    try 
    {
        var canConnect = await context.Database.CanConnectAsync();
        return Results.Ok(new { 
            status = canConnect ? "healthy" : "unhealthy", 
            timestamp = DateTime.UtcNow,
            service = "enterprise-docs-api",
            database = canConnect ? "connected" : "disconnected"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, title: "Health check failed");
    }
}).AllowAnonymous();

// Sprint 6: Map SignalR hubs for real-time collaboration
app.MapHub<DocumentCollaborationHub>("/hubs/collaboration");

// Temporarily disable module initialization
// TODO: Re-enable after fixing module system
// await app.Services.InitializeModulesAsync();

// Enable automatic migrations for production deployment
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Check if database exists and is accessible
        var canConnect = await context.Database.CanConnectAsync();
        if (canConnect)
        {
            await context.Database.MigrateAsync();
            Console.WriteLine("Database migrations completed successfully.");
        }
        else
        {
            Console.WriteLine("Warning: Cannot connect to database. Check connection string and database availability.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Database initialization failed: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        // Continue startup even if migrations fail to allow debugging in development
        // In production, this might need to fail the startup depending on requirements
    }
}

app.Run();