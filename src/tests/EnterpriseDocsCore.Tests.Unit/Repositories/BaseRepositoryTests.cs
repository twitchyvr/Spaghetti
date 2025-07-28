using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Infrastructure.Data.Repositories;

namespace EnterpriseDocsCore.Tests.Unit.Repositories;

public class BaseRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly TestRepository _repository;
    private readonly ILogger<TestRepository> _logger;

    public BaseRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _logger = Mock.Of<ILogger<TestRepository>>();
        _repository = new TestRepository(_context, _logger);
    }

    [Fact]
    public async Task AddAsync_ShouldAddEntityToDatabase()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var result = await _repository.AddAsync(user);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(user.Id);
        
        var savedUser = await _context.Users.FindAsync(user.Id);
        savedUser.Should().NotBeNull();
        savedUser!.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnEntity_WhenEntityExists()
    {
        // Arrange
        var user = CreateTestUser();
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(user.Id);
        result.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenEntityDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllEntities()
    {
        // Arrange
        var users = new[]
        {
            CreateTestUser("user1@test.com"),
            CreateTestUser("user2@test.com"),
            CreateTestUser("user3@test.com")
        };
        
        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(3);
        result.Select(u => u.Email).Should().Contain(users.Select(u => u.Email));
    }

    [Fact]
    public async Task FindAsync_ShouldReturnMatchingEntities()
    {
        // Arrange
        var users = new[]
        {
            CreateTestUser("active1@test.com", true),
            CreateTestUser("active2@test.com", true),
            CreateTestUser("inactive@test.com", false)
        };
        
        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.FindAsync(u => u.IsActive);

        // Assert
        result.Should().HaveCount(2);
        result.All(u => u.IsActive).Should().BeTrue();
    }

    [Fact]
    public async Task FirstOrDefaultAsync_ShouldReturnFirstMatch()
    {
        // Arrange
        var users = new[]
        {
            CreateTestUser("user1@test.com"),
            CreateTestUser("user2@test.com")
        };
        
        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.FirstOrDefaultAsync(u => u.Email.Contains("user"));

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().BeOneOf(users.Select(u => u.Email));
    }

    [Fact]
    public async Task ExistsAsync_ShouldReturnTrue_WhenEntityExists()
    {
        // Arrange
        var user = CreateTestUser();
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.ExistsAsync(u => u.Email == user.Email);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_ShouldReturnFalse_WhenEntityDoesNotExist()
    {
        // Act
        var result = await _repository.ExistsAsync(u => u.Email == "nonexistent@test.com");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task CountAsync_ShouldReturnCorrectCount()
    {
        // Arrange
        var users = new[]
        {
            CreateTestUser("user1@test.com"),
            CreateTestUser("user2@test.com"),
            CreateTestUser("user3@test.com")
        };
        
        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        // Act
        var totalCount = await _repository.CountAsync();
        var filteredCount = await _repository.CountAsync(u => u.Email.Contains("user1"));

        // Assert
        totalCount.Should().Be(3);
        filteredCount.Should().Be(1);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateEntity()
    {
        // Arrange
        var user = CreateTestUser();
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Detach to simulate update scenario
        _context.Entry(user).State = EntityState.Detached;

        // Modify the user
        user.FirstName = "UpdatedName";

        // Act
        var result = await _repository.UpdateAsync(user);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be("UpdatedName");
        
        var updatedUser = await _context.Users.FindAsync(user.Id);
        updatedUser!.FirstName.Should().Be("UpdatedName");
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveEntity()
    {
        // Arrange
        var user = CreateTestUser();
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteAsync(user.Id);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().BeTrue();
        
        var deletedUser = await _context.Users.FindAsync(user.Id);
        deletedUser.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnFalse_WhenEntityDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.DeleteAsync(nonExistentId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetPagedAsync_ShouldReturnCorrectPage()
    {
        // Arrange
        var users = Enumerable.Range(1, 25)
            .Select(i => CreateTestUser($"user{i:D2}@test.com"))
            .ToArray();
        
        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetPagedAsync(page: 2, pageSize: 10, cancellationToken: CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(10);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(10);
        result.TotalItems.Should().Be(25);
        result.TotalPages.Should().Be(3);
        result.HasPreviousPage.Should().BeTrue();
        result.HasNextPage.Should().BeTrue();
    }

    [Theory]
    [InlineData(0, 10)]
    [InlineData(1, 0)]
    [InlineData(1, 1001)]
    public async Task GetPagedAsync_ShouldThrowArgumentException_ForInvalidParameters(int page, int pageSize)
    {
        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _repository.GetPagedAsync(page, pageSize, CancellationToken.None));
        
        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task AddRangeAsync_ShouldAddMultipleEntities()
    {
        // Arrange
        var users = new[]
        {
            CreateTestUser("user1@test.com"),
            CreateTestUser("user2@test.com"),
            CreateTestUser("user3@test.com")
        };

        // Act
        var result = await _repository.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().HaveCount(3);
        
        var savedCount = await _context.Users.CountAsync();
        savedCount.Should().Be(3);
    }

    [Fact]
    public async Task DeleteRangeAsync_ShouldRemoveMultipleEntities()
    {
        // Arrange
        var users = new[]
        {
            CreateTestUser("user1@test.com"),
            CreateTestUser("user2@test.com"),
            CreateTestUser("user3@test.com")
        };
        
        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        // Act
        var deletedCount = await _repository.DeleteRangeAsync(u => u.Email.Contains("user"));
        await _context.SaveChangesAsync();

        // Assert
        deletedCount.Should().Be(3);
        
        var remainingCount = await _context.Users.CountAsync();
        remainingCount.Should().Be(0);
    }

    private static User CreateTestUser(string email = "test@example.com", bool isActive = true)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Test",
            LastName = "User",
            Email = email,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Profile = new UserProfile
            {
                JobTitle = "Test Job",
                Department = "Test Department",
                Language = "en"
            },
            Settings = new UserSettings
            {
                Theme = "light",
                EnableAIAssistance = true
            }
        };
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

// Test implementation of BaseRepository for testing purposes
public class TestRepository : BaseRepository<User, Guid>
{
    public TestRepository(ApplicationDbContext context, ILogger<TestRepository> logger) 
        : base(context, logger)
    {
    }
}