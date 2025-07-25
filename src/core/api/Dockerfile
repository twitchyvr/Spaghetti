# Multi-stage Dockerfile for Enterprise Documentation Platform API

# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN mkdir -p /app/uploads /app/modules && chown -R appuser:appuser /app

# SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies (leverage Docker layer caching)
COPY src/core/api/*.csproj core/api/
COPY src/core/domain/*.csproj core/domain/
COPY src/core/infrastructure/*.csproj core/infrastructure/
RUN dotnet restore "core/api/EnterpriseDocsCore.API.csproj"

# Copy all source code
COPY src/ .

# Build the application
WORKDIR "/src/core/api"
RUN dotnet build "EnterpriseDocsCore.API.csproj" -c Release -o /app/build

# Development stage (for docker-compose development)
FROM build AS development
WORKDIR /src/core/api
EXPOSE 5000
ENV ASPNETCORE_ENVIRONMENT=Development
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV ASPNETCORE_LOGGING__CONSOLE__DISABLECOLORS=true

# Install development tools
RUN dotnet tool install --global dotnet-ef
RUN dotnet tool install --global dotnet-watch
ENV PATH="$PATH:/root/.dotnet/tools"

# Set up file watching for hot reload
ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:5000"]

# Publish stage
FROM build AS publish
WORKDIR "/src/core/api"
RUN dotnet publish "EnterpriseDocsCore.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Production stage
FROM base AS production
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=publish /app/publish .

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "EnterpriseDocsCore.API.dll"]

# Testing stage
FROM build AS testing
WORKDIR /src

# Install test dependencies
RUN dotnet restore "tests/*.csproj" || true

# Copy test files
COPY tests/ tests/

# Run tests
RUN dotnet test --logger trx --results-directory /app/test-results || true