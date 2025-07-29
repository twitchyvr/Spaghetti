using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using FluentAssertions;
using Moq;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Infrastructure.Data.Repositories;

namespace EnterpriseDocsCore.Tests.Unit.Repositories;

public class RefreshTokenRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly RefreshTokenRepository _repository;
    private readonly ILogger<RefreshTokenRepository> _logger;

    public RefreshTokenRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _logger = Mock.Of<ILogger<RefreshTokenRepository>>();
        _repository = new RefreshTokenRepository(_context, _logger);
    }

    [Fact]
    public async Task GetByTokenAsync_ShouldReturnToken_WhenTokenExists()
    {
        // Arrange
        var user = CreateTestUser();
        var refreshToken = CreateTestRefreshToken(user.Id);
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByTokenAsync(refreshToken.Token);

        // Assert
        result.Should().NotBeNull();
        result!.Token.Should().Be(refreshToken.Token);
        result.UserId.Should().Be(user.Id);
        result.User.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByTokenAsync_ShouldReturnNull_WhenTokenDoesNotExist()
    {
        // Act
        var result = await _repository.GetByTokenAsync("non-existent-token");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetActiveByUserIdAsync_ShouldReturnOnlyActiveTokens()
    {
        // Arrange
        var user = CreateTestUser();
        var activeToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        var expiredToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(-1));
        var revokedToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        revokedToken.RevokedAt = DateTime.UtcNow.AddDays(-1);

        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddRangeAsync(activeToken, expiredToken, revokedToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveByUserIdAsync(user.Id);

        // Assert
        result.Should().HaveCount(1);
        result.First().Id.Should().Be(activeToken.Id);
    }

    [Fact]
    public async Task IsTokenValidAsync_ShouldReturnTrue_ForActiveToken()
    {
        // Arrange
        var user = CreateTestUser();
        var activeToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddAsync(activeToken);
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
        var user = CreateTestUser();
        var expiredToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(-1));
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddAsync(expiredToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.IsTokenValidAsync(expiredToken.Token);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsTokenValidAsync_ShouldReturnFalse_ForRevokedToken()
    {
        // Arrange
        var user = CreateTestUser();
        var revokedToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        revokedToken.RevokedAt = DateTime.UtcNow.AddDays(-1);
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddAsync(revokedToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.IsTokenValidAsync(revokedToken.Token);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeTokenAsync_ShouldRevokeToken_WhenTokenExists()
    {
        // Arrange
        var user = CreateTestUser();
        var activeToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        var ipAddress = "192.168.1.1";
        var reason = "User logout";
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddAsync(activeToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.RevokeTokenAsync(activeToken.Token, ipAddress, reason);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().BeTrue();
        
        var revokedToken = await _context.RefreshTokens.FindAsync(activeToken.Id);
        revokedToken!.RevokedAt.Should().NotBeNull();
        revokedToken.RevokedByIp.Should().Be(ipAddress);
        revokedToken.RevokedReason.Should().Be(reason);
        revokedToken.IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task RevokeTokenAsync_ShouldReturnFalse_WhenTokenDoesNotExist()
    {
        // Act
        var result = await _repository.RevokeTokenAsync("non-existent-token");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeTokenAsync_ShouldReturnFalse_WhenTokenAlreadyRevoked()
    {
        // Arrange
        var user = CreateTestUser();
        var revokedToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        revokedToken.RevokedAt = DateTime.UtcNow.AddDays(-1);
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddAsync(revokedToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.RevokeTokenAsync(revokedToken.Token);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeAllUserTokensAsync_ShouldRevokeAllActiveTokens()
    {
        // Arrange
        var user = CreateTestUser();
        var activeToken1 = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        var activeToken2 = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        var alreadyRevokedToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        alreadyRevokedToken.RevokedAt = DateTime.UtcNow.AddDays(-1);
        
        var ipAddress = "192.168.1.1";
        var reason = "Security logout";
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddRangeAsync(activeToken1, activeToken2, alreadyRevokedToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.RevokeAllUserTokensAsync(user.Id, ipAddress, reason);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().Be(2); // Only 2 active tokens should be revoked
        
        var tokens = await _context.RefreshTokens.Where(t => t.UserId == user.Id).ToListAsync();
        tokens.Where(t => t.Id == activeToken1.Id || t.Id == activeToken2.Id)
              .Should().AllSatisfy(t => 
              {
                  t.RevokedAt.Should().NotBeNull();
                  t.RevokedByIp.Should().Be(ipAddress);
                  t.RevokedReason.Should().Be(reason);
              });
    }

    [Fact]
    public async Task DeleteExpiredTokensAsync_ShouldDeleteOnlyExpiredTokens()
    {
        // Arrange
        var user = CreateTestUser();
        var activeToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        var expiredToken1 = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(-1));
        var expiredToken2 = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(-2));
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddRangeAsync(activeToken, expiredToken1, expiredToken2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteExpiredTokensAsync();
        await _context.SaveChangesAsync();

        // Assert
        result.Should().Be(2);
        
        var remainingTokens = await _context.RefreshTokens.ToListAsync();
        remainingTokens.Should().HaveCount(1);
        remainingTokens.First().Id.Should().Be(activeToken.Id);
    }

    [Fact]
    public async Task DeleteRevokedTokensOlderThanAsync_ShouldDeleteOldRevokedTokens()
    {
        // Arrange
        var user = CreateTestUser();
        var cutoffDate = DateTime.UtcNow.AddDays(-7);
        
        var activeToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        var recentRevokedToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        recentRevokedToken.RevokedAt = DateTime.UtcNow.AddDays(-3);
        
        var oldRevokedToken = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        oldRevokedToken.RevokedAt = DateTime.UtcNow.AddDays(-10);
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddRangeAsync(activeToken, recentRevokedToken, oldRevokedToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteRevokedTokensOlderThanAsync(cutoffDate);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().Be(1);
        
        var remainingTokens = await _context.RefreshTokens.ToListAsync();
        remainingTokens.Should().HaveCount(2);
        remainingTokens.Should().NotContain(t => t.Id == oldRevokedToken.Id);
    }

    [Fact]
    public async Task GetTokensByIpAsync_ShouldReturnTokensFromSpecifiedIp()
    {
        // Arrange
        var user = CreateTestUser();
        var ipAddress = "192.168.1.1";
        
        var tokenFromIp = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        tokenFromIp.CreatedByIp = ipAddress;
        
        var tokenFromOtherIp = CreateTestRefreshToken(user.Id, DateTime.UtcNow.AddDays(30));
        tokenFromOtherIp.CreatedByIp = "192.168.1.2";
        
        await _context.Users.AddAsync(user);
        await _context.RefreshTokens.AddRangeAsync(tokenFromIp, tokenFromOtherIp);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetTokensByIpAsync(ipAddress);

        // Assert
        result.Should().HaveCount(1);
        result.First().Id.Should().Be(tokenFromIp.Id);
    }

    private static User CreateTestUser()
    {
        return new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Test",
            LastName = "User",
            Email = $"test.user.{Guid.NewGuid()}@example.com",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static RefreshToken CreateTestRefreshToken(Guid userId, DateTime? expiresAt = null)
    {
        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = Guid.NewGuid().ToString(),
            UserId = userId,
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