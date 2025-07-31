using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using FluentAssertions;
using Moq;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Infrastructure.Data.Repositories;

namespace EnterpriseDocsCore.Tests.Unit.Repositories;

public class RefreshTokenRepositorySimpleTests : IDisposable
{
    private readonly DbContext _context;
    private readonly RefreshTokenRepository _repository;
    private readonly ILogger<RefreshTokenRepository> _logger;

    public RefreshTokenRepositorySimpleTests()
    {
        var options = new DbContextOptionsBuilder()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TestDbContext(options);
        _logger = Mock.Of<ILogger<RefreshTokenRepository>>();
        _repository = new RefreshTokenRepository((ApplicationDbContext)_context, _logger);
    }

    [Fact]
    public async Task GetByTokenAsync_ShouldReturnToken_WhenTokenExists()
    {
        // Arrange
        var refreshToken = CreateTestRefreshToken();
        
        await _context.Set<RefreshToken>().AddAsync(refreshToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByTokenAsync(refreshToken.Token);

        // Assert
        result.Should().NotBeNull();
        result!.Token.Should().Be(refreshToken.Token);
        result.UserId.Should().Be(refreshToken.UserId);
    }

    [Fact]
    public async Task IsTokenValidAsync_ShouldReturnTrue_ForActiveToken()
    {
        // Arrange
        var activeToken = CreateTestRefreshToken(expiresAt: DateTime.UtcNow.AddDays(30));
        
        await _context.Set<RefreshToken>().AddAsync(activeToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.IsTokenValidAsync(activeToken.Token);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsTokenValidAsync_ShouldReturnFalse_ForExpiredToken()
    {
        // Arrange
        var expiredToken = CreateTestRefreshToken(expiresAt: DateTime.UtcNow.AddDays(-1));
        
        await _context.Set<RefreshToken>().AddAsync(expiredToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.IsTokenValidAsync(expiredToken.Token);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeTokenAsync_ShouldRevokeToken_WhenTokenExists()
    {
        // Arrange
        var activeToken = CreateTestRefreshToken(expiresAt: DateTime.UtcNow.AddDays(30));
        var ipAddress = "192.168.1.1";
        var reason = "User logout";
        
        await _context.Set<RefreshToken>().AddAsync(activeToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.RevokeTokenAsync(activeToken.Token, ipAddress, reason);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().BeTrue();
        
        var revokedToken = await _context.Set<RefreshToken>().FindAsync(activeToken.Id);
        revokedToken!.RevokedAt.Should().NotBeNull();
        revokedToken.RevokedByIp.Should().Be(ipAddress);
        revokedToken.RevokedReason.Should().Be(reason);
    }

    private static RefreshToken CreateTestRefreshToken(DateTime? expiresAt = null)
    {
        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = Guid.NewGuid().ToString(),
            UserId = Guid.NewGuid(),
            ExpiresAt = expiresAt ?? DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = "192.168.1.100",
            UserAgent = "Test User Agent"
        };
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

// Simple test DbContext that only supports RefreshToken
public class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(512);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.RevokedByIp).HasMaxLength(45);
            entity.Property(e => e.RevokedReason).HasMaxLength(200);
            entity.Property(e => e.CreatedByIp).HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ExpiresAt);
        });
    }
}