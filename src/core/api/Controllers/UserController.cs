using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.API.DTOs;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.API.Services;

namespace EnterpriseDocsCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContextService _tenantContext;
    private readonly ILogger<UserController> _logger;

    public UserController(IUnitOfWork unitOfWork, ITenantContextService tenantContext, ILogger<UserController> logger)
    {
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _unitOfWork.Users.GetPagedAsync(
                page, pageSize, 
                u => u.TenantId == _tenantContext.CurrentTenantId,
                cancellationToken);
                
            var dtos = result.Items.Select(MapToDto).ToList();
            
            return Ok(PagedResult<UserDto>.Create(dtos, page, pageSize, result.TotalItems));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users for tenant {TenantId}", _tenantContext.CurrentTenantId);
            return StatusCode(500, new { message = "An error occurred while retrieving users" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _unitOfWork.Users.FirstOrDefaultAsync(
                u => u.Id == id && u.TenantId == _tenantContext.CurrentTenantId,
                cancellationToken);
            
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }
            
            return Ok(MapToDto(user));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user with ID {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the user" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(
        [FromBody] CreateUserDto createDto, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = createDto.Email,
                FirstName = createDto.FirstName,
                LastName = createDto.LastName,
                TenantId = _tenantContext.CurrentTenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdUser = await _unitOfWork.Users.AddAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation("User created with ID {UserId} in tenant {TenantId}", 
                createdUser.Id, _tenantContext.CurrentTenantId);
                
            return CreatedAtAction(
                nameof(GetUser), 
                new { id = createdUser.Id }, 
                MapToDto(createdUser));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { message = "An error occurred while creating the user" });
        }
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            TenantId = user.TenantId ?? Guid.Empty,
            LastLoginAt = user.LastLoginAt
        };
    }
}
