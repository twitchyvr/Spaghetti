using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Infrastructure.Services;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.API.Extensions;
using EnterpriseDocsCore.API.Middleware;

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
        Description = "Modular enterprise documentation platform with AI-powered content generation"
    });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
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

// Temporarily disable complex services until DI issues are resolved
// TODO: Re-enable after fixing interface implementations
// builder.Services.ConfigureStorage(builder.Configuration);
// builder.Services.ConfigureAIServices(builder.Configuration);
// builder.Services.ConfigureModuleSystem(builder.Configuration);

// Add core services
builder.Services.AddUnitOfWork();
// Temporarily disable DocumentService until we fix dependency issues
// builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<DatabaseSeedingService>();

// Add memory cache (always needed for local caching)
builder.Services.AddMemoryCache();

// Add Redis caching if configured (for distributed caching)
var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnection;
    });
}

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Allow multiple frontend origins for development
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "https://localhost:3001")
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
app.UseAuthorization();

// Custom middleware
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapControllers();

// Temporarily disable module initialization
// TODO: Re-enable after fixing module system
// await app.Services.InitializeModulesAsync();

// Temporarily disable automatic migrations to test API startup
// TODO: Re-enable after fixing EF configuration issues
// using (var scope = app.Services.CreateScope())
// {
//     var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//     await context.Database.MigrateAsync();
// }

app.Run();