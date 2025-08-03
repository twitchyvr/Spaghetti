using Microsoft.EntityFrameworkCore;
using EnterpriseDocsCore.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add minimal services for a working API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add database context with minimal configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}

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
    service = "enterprise-docs-api-minimal",
    version = "sprint6-deployment-test"
})).AllowAnonymous();

app.MapGet("/api/health", () => Results.Ok(new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow, 
    service = "enterprise-docs-api-minimal",
    version = "sprint6-deployment-test"
})).AllowAnonymous();

// Test endpoint to verify API is working
app.MapGet("/api/test", () => Results.Ok(new { 
    message = "Sprint 6 API deployment successful", 
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
})).AllowAnonymous();

Console.WriteLine("Starting minimal Enterprise Docs API...");
app.Run();