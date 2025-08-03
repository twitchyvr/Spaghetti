var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/health", () => "API is working!");
app.MapGet("/api/health", () => "API service is responding!");
app.MapGet("/", () => "Simple test API running on DigitalOcean");

app.Run();