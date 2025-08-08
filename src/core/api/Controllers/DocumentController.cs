using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.API.DTOs;
using Microsoft.Extensions.Logging;

namespace EnterpriseDocsCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DocumentController> _logger;

    public DocumentController(IUnitOfWork unitOfWork, ILogger<DocumentController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<DocumentDto>>> GetDocuments(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        try
        {            
            var result = await _unitOfWork.Documents.GetPagedAsync(
                page, pageSize, cancellationToken);
                
            var dtos = result.Items.Select(MapToDto).ToList();
            
            return Ok(PagedResult<DocumentDto>.Create(dtos, page, pageSize, result.TotalItems));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving documents for page {Page}, size {PageSize}", page, pageSize);
            return StatusCode(500, new { message = "An error occurred while retrieving documents" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetDocument(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var document = await _unitOfWork.Documents.GetByIdAsync(id, cancellationToken);
            
            if (document == null)
            {
                return NotFound(new { message = $"Document with ID {id} not found" });
            }
            
            return Ok(MapToDto(document));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving document with ID {DocumentId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the document" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<DocumentDto>> CreateDocument(
        [FromBody] CreateDocumentDto createDto, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var document = new Document
            {
                Id = Guid.NewGuid(),
                Title = createDto.Title,
                Content = createDto.Content,
                DocumentType = createDto.DocumentType,
                Status = DocumentStatus.Draft,
                TenantId = GetCurrentTenantId(), // Multi-tenant context
                CreatedBy = GetCurrentUserId(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdDocument = await _unitOfWork.Documents.AddAsync(document, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation("Document created with ID {DocumentId} by user {UserId}", 
                createdDocument.Id, GetCurrentUserId());
                
            return CreatedAtAction(
                nameof(GetDocument), 
                new { id = createdDocument.Id }, 
                MapToDto(createdDocument));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating document");
            return StatusCode(500, new { message = "An error occurred while creating the document" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DocumentDto>> UpdateDocument(
        Guid id, 
        [FromBody] UpdateDocumentDto updateDto, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var document = await _unitOfWork.Documents.GetByIdAsync(id, cancellationToken);
            
            if (document == null)
            {
                return NotFound(new { message = $"Document with ID {id} not found" });
            }

            // Update properties
            document.Title = updateDto.Title ?? document.Title;
            document.Content = updateDto.Content ?? document.Content;
            document.Status = updateDto.Status ?? document.Status;
            document.UpdatedAt = DateTime.UtcNow;

            var updatedDocument = await _unitOfWork.Documents.UpdateAsync(document, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation("Document {DocumentId} updated by user {UserId}", 
                id, GetCurrentUserId());
                
            return Ok(MapToDto(updatedDocument));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating document with ID {DocumentId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the document" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var deleted = await _unitOfWork.Documents.DeleteAsync(id, cancellationToken);
            
            if (!deleted)
            {
                return NotFound(new { message = $"Document with ID {id} not found" });
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation("Document {DocumentId} deleted by user {UserId}", 
                id, GetCurrentUserId());
                
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document with ID {DocumentId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the document" });
        }
    }

    private static DocumentDto MapToDto(Document document)
    {
        return new DocumentDto
        {
            Id = document.Id,
            Title = document.Title,
            Content = document.Content,
            DocumentType = document.DocumentType,
            Status = document.Status?.ToString(),
            CreatedAt = document.CreatedAt,
            UpdatedAt = document.UpdatedAt,
            CreatedBy = document.CreatedBy,
            TenantId = document.TenantId
        };
    }

    private Guid GetCurrentTenantId()
    {
        // TODO: Implement from multi-tenant context middleware
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }

    private Guid GetCurrentUserId()
    {
        // TODO: Implement from authentication context
        return Guid.Parse("22222222-2222-2222-2222-222222222222");
    }
}
