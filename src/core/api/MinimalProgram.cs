// Minimal API for Sprint 7 - DigitalOcean Deployment Testing
using EnterpriseDocsCore.API;

var builder = WebApplication.CreateBuilder(args);

// Basic configuration for DigitalOcean
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Minimal services
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Basic middleware
app.UseCors();

// Simple health check endpoint
app.MapGet("/", () => "Enterprise Docs API - Sprint 7");
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Basic API endpoints for frontend
app.MapGet("/api/status", () => Results.Ok(new 
{ 
    service = "Enterprise Docs API",
    version = "0.0.16-alpha",
    sprint = "Sprint 7",
    status = "operational"
}));

app.MapGet("/api/admin/database-stats", () => Results.Ok(new 
{ 
    totalDocuments = 7,
    totalUsers = 8,
    totalTenants = 3,
    systemHealth = "optimal"
}));

app.MapGet("/api/features", () => Results.Ok(FeatureFlags.GetFlagsByCategory()));

Console.WriteLine($"Starting Minimal API on port {port}...");
app.Run();