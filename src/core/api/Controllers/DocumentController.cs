using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.API.DTOs;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;

namespace EnterpriseDocsCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStorageService _storageService;
    private readonly ILogger<DocumentController> _logger;

    public DocumentController(
        IUnitOfWork unitOfWork,
        IStorageService storageService,
        ILogger<DocumentController> logger)
    {
        _unitOfWork = unitOfWork;
        _storageService = storageService;
        _logger = logger;
    }

    /// <summary>
    /// Get all documents with optional filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<DocumentListResponse>>> GetDocuments(
        [FromQuery] DocumentSearchRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var tenantId = GetCurrentTenantId();

            // Get accessible documents for the user
            var allDocuments = await _unitOfWork.Documents.GetAccessibleDocumentsAsync(userId, tenantId);

            // Apply filters
            var filteredDocuments = allDocuments.AsQueryable();

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                filteredDocuments = filteredDocuments.Where(d => 
                    d.Title.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                    d.Content.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                    d.Tags.Any(t => t.Name.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase)));
            }

            if (request.Tags?.Any() == true)
            {
                filteredDocuments = filteredDocuments.Where(d => 
                    d.Tags.Any(t => request.Tags.Contains(t.Name)));
            }

            if (!string.IsNullOrEmpty(request.DocumentType))
            {
                filteredDocuments = filteredDocuments.Where(d => d.DocumentType == request.DocumentType);
            }

            if (!string.IsNullOrEmpty(request.Industry))
            {
                filteredDocuments = filteredDocuments.Where(d => d.Industry == request.Industry);
            }

            if (request.Status.HasValue)
            {
                filteredDocuments = filteredDocuments.Where(d => d.Status == request.Status.Value);
            }

            if (!string.IsNullOrEmpty(request.ContentType))
            {
                filteredDocuments = filteredDocuments.Where(d => d.ContentType == request.ContentType);
            }

            if (request.FromDate.HasValue)
            {
                filteredDocuments = filteredDocuments.Where(d => d.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                filteredDocuments = filteredDocuments.Where(d => d.CreatedAt <= request.ToDate.Value);
            }

            if (request.CreatedBy.HasValue)
            {
                filteredDocuments = filteredDocuments.Where(d => d.CreatedBy == request.CreatedBy.Value);
            }

            // Get total count before pagination
            var totalItems = filteredDocuments.Count();

            // Apply pagination
            var paginatedDocuments = filteredDocuments
                .OrderByDescending(d => d.UpdatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            // Map to DTOs
            var documentDtos = paginatedDocuments.Select(MapToListResponse).ToList();

            var response = new PaginatedResponse<DocumentListResponse>
            {
                Items = documentDtos,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / request.PageSize),
                HasNextPage = request.Page * request.PageSize < totalItems,
                HasPreviousPage = request.Page > 1
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving documents");
            return StatusCode(500, new { error = "Failed to retrieve documents", details = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific document by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentResponse>> GetDocument(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var document = await _unitOfWork.Documents.GetByIdAsync(id);

            if (document == null)
            {
                return NotFound(new { error = "Document not found" });
            }

            // Check user access
            var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(id, userId, PermissionType.Read);
            if (!hasAccess)
            {
                return Forbid("You don't have access to this document");
            }

            var documentDto = MapToDetailResponse(document);
            return Ok(documentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving document {DocumentId}", id);
            return StatusCode(500, new { error = "Failed to retrieve document", details = ex.Message });
        }
    }

    /// <summary>
    /// Create a new document
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<DocumentResponse>> CreateDocument([FromBody] EnterpriseDocsCore.API.DTOs.CreateDocumentRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var tenantId = GetCurrentTenantId();

            var document = new Document
            {
                Title = request.Title,
                Content = request.Content,
                DocumentType = request.DocumentType,
                Industry = request.Industry,
                Status = request.Status,
                PublicAccessLevel = request.PublicAccessLevel,
                PublicSlug = request.PublicSlug,
                MetaDescription = request.MetaDescription,
                MetaKeywords = request.MetaKeywords,
                IndexBySearchEngines = request.IndexBySearchEngines,
                FileName = request.FileName,
                ContentType = request.ContentType,
                FileSize = request.FileSize,
                VersionNotes = request.VersionNotes,
                CreatedBy = userId,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdDocument = await _unitOfWork.Documents.AddAsync(document);

            // Add tags if provided
            if (request.Tags?.Any() == true)
            {
                foreach (var tagName in request.Tags)
                {
                    var tag = new DocumentTag
                    {
                        DocumentId = createdDocument.Id,
                        Name = tagName,
                        Category = "User"
                    };
                    await _unitOfWork.DocumentTags.AddAsync(tag);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            // Reload document with related data
            var documentWithDetails = await _unitOfWork.Documents.GetByIdAsync(createdDocument.Id);
            var documentDto = MapToDetailResponse(documentWithDetails!);

            return CreatedAtAction(nameof(GetDocument), new { id = createdDocument.Id }, documentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating document");
            return StatusCode(500, new { error = "Failed to create document", details = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing document
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<DocumentResponse>> UpdateDocument(Guid id, [FromBody] EnterpriseDocsCore.API.DTOs.UpdateDocumentRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var document = await _unitOfWork.Documents.GetByIdAsync(id);

            if (document == null)
            {
                return NotFound(new { error = "Document not found" });
            }

            // Check user access
            var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(id, userId, PermissionType.Write);
            if (!hasAccess)
            {
                return Forbid("You don't have permission to update this document");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Title))
                document.Title = request.Title;
            
            if (request.Content != null)
                document.Content = request.Content;
            
            if (!string.IsNullOrEmpty(request.DocumentType))
                document.DocumentType = request.DocumentType;
            
            if (!string.IsNullOrEmpty(request.Industry))
                document.Industry = request.Industry;
            
            if (request.Status.HasValue)
                document.Status = request.Status.Value;
            
            if (request.PublicAccessLevel.HasValue)
                document.PublicAccessLevel = request.PublicAccessLevel.Value;
            
            if (request.PublicSlug != null)
                document.PublicSlug = request.PublicSlug;
            
            if (request.MetaDescription != null)
                document.MetaDescription = request.MetaDescription;
            
            if (request.MetaKeywords != null)
                document.MetaKeywords = request.MetaKeywords;
            
            if (request.IndexBySearchEngines.HasValue)
                document.IndexBySearchEngines = request.IndexBySearchEngines.Value;
            
            if (request.VersionNotes != null)
                document.VersionNotes = request.VersionNotes;

            document.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Documents.UpdateAsync(document);

            // Update tags if provided
            if (request.Tags != null)
            {
                // Remove existing tags
                var existingTags = await _unitOfWork.DocumentTags.GetByDocumentIdAsync(id);
                foreach (var tag in existingTags)
                {
                    await _unitOfWork.DocumentTags.DeleteAsync(tag.Id);
                }

                // Add new tags
                foreach (var tagName in request.Tags)
                {
                    var tag = new DocumentTag
                    {
                        DocumentId = id,
                        Name = tagName,
                        Category = "User"
                    };
                    await _unitOfWork.DocumentTags.AddAsync(tag);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            // Reload document with related data
            var updatedDocument = await _unitOfWork.Documents.GetByIdAsync(id);
            var documentDto = MapToDetailResponse(updatedDocument!);

            return Ok(documentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating document {DocumentId}", id);
            return StatusCode(500, new { error = "Failed to update document", details = ex.Message });
        }
    }

    /// <summary>
    /// Delete a document (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var document = await _unitOfWork.Documents.GetByIdAsync(id);

            if (document == null)
            {
                return NotFound(new { error = "Document not found" });
            }

            // Check user access
            var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(id, userId, PermissionType.Delete);
            if (!hasAccess)
            {
                return Forbid("You don't have permission to delete this document");
            }

            // Soft delete by updating status
            document.Status = DocumentStatus.Deleted;
            document.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Documents.UpdateAsync(document);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document {DocumentId}", id);
            return StatusCode(500, new { error = "Failed to delete document", details = ex.Message });
        }
    }

    /// <summary>
    /// Get document version history
    /// </summary>
    [HttpGet("{id}/versions")]
    public async Task<ActionResult<IEnumerable<DocumentListResponse>>> GetDocumentVersions(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            
            // Check user access to the document
            var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(id, userId, PermissionType.Read);
            if (!hasAccess)
            {
                return Forbid("You don't have access to this document");
            }

            var versions = await _unitOfWork.Documents.GetVersionsAsync(id);
            var versionDtos = versions.Select(MapToListResponse).ToList();

            return Ok(versionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving document versions for {DocumentId}", id);
            return StatusCode(500, new { error = "Failed to retrieve document versions", details = ex.Message });
        }
    }

    /// <summary>
    /// Create a new version of an existing document
    /// </summary>
    [HttpPost("{id}/versions")]
    public async Task<ActionResult<DocumentResponse>> CreateDocumentVersion(Guid id, [FromBody] CreateDocumentVersionRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var originalDocument = await _unitOfWork.Documents.GetByIdAsync(id);

            if (originalDocument == null)
            {
                return NotFound(new { error = "Original document not found" });
            }

            // Check user access
            var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(id, userId, PermissionType.Write);
            if (!hasAccess)
            {
                return Forbid("You don't have permission to create versions of this document");
            }

            // Create new version based on original
            var newVersion = new Document
            {
                Title = originalDocument.Title,
                Content = request.Content ?? originalDocument.Content,
                DocumentType = originalDocument.DocumentType,
                Industry = originalDocument.Industry,
                Status = request.Status ?? originalDocument.Status,
                PublicAccessLevel = originalDocument.PublicAccessLevel,
                PublicSlug = originalDocument.PublicSlug,
                MetaDescription = originalDocument.MetaDescription,
                MetaKeywords = originalDocument.MetaKeywords,
                IndexBySearchEngines = originalDocument.IndexBySearchEngines,
                FileName = originalDocument.FileName,
                ContentType = originalDocument.ContentType,
                FileSize = originalDocument.FileSize,
                VersionNotes = request.VersionNotes,
                CreatedBy = userId,
                TenantId = originalDocument.TenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdVersion = await _unitOfWork.Documents.CreateVersionAsync(id, newVersion);

            if (createdVersion == null)
            {
                return StatusCode(500, new { error = "Failed to create document version" });
            }

            // Copy tags if provided, otherwise use original tags
            var tagsToUse = request.Tags ?? originalDocument.Tags.Select(t => t.Name).ToList();
            foreach (var tagName in tagsToUse)
            {
                var tag = new DocumentTag
                {
                    DocumentId = createdVersion.Id,
                    Name = tagName,
                    Category = "User"
                };
                await _unitOfWork.DocumentTags.AddAsync(tag);
            }

            await _unitOfWork.SaveChangesAsync();

            // Reload document with related data
            var versionWithDetails = await _unitOfWork.Documents.GetByIdAsync(createdVersion.Id);
            var documentDto = MapToDetailResponse(versionWithDetails!);

            return CreatedAtAction(nameof(GetDocument), new { id = createdVersion.Id }, documentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating document version for {DocumentId}", id);
            return StatusCode(500, new { error = "Failed to create document version", details = ex.Message });
        }
    }

    /// <summary>
    /// Get the latest version of a document
    /// </summary>
    [HttpGet("{id}/latest")]
    public async Task<ActionResult<DocumentResponse>> GetLatestVersion(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var latestVersion = await _unitOfWork.Documents.GetLatestVersionAsync(id);

            if (latestVersion == null)
            {
                return NotFound(new { error = "Document not found" });
            }

            // Check user access
            var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(latestVersion.Id, userId, PermissionType.Read);
            if (!hasAccess)
            {
                return Forbid("You don't have access to this document");
            }

            var documentDto = MapToDetailResponse(latestVersion);
            return Ok(documentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving latest version of document {DocumentId}", id);
            return StatusCode(500, new { error = "Failed to retrieve latest document version", details = ex.Message });
        }
    }

    /// <summary>
    /// Upload a file and create a document
    /// </summary>
    [HttpPost("upload")]
    public async Task<ActionResult<DocumentResponse>> UploadDocument([FromForm] DocumentUploadRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var tenantId = GetCurrentTenantId();

            // Validate file
            var validation = await _storageService.ValidateFileAsync(request.File.OpenReadStream(), request.File.FileName, request.File.ContentType);
            if (!validation.isValid)
            {
                return BadRequest(new { error = validation.errorMessage });
            }

            // Calculate file hash for duplicate detection
            var fileHash = await _storageService.CalculateFileHashAsync(request.File.OpenReadStream());

            // Check for duplicates
            if (tenantId.HasValue)
            {
                var existingDocument = await _unitOfWork.Documents.GetByFileHashAsync(fileHash, tenantId.Value);
                if (existingDocument != null)
                {
                    return Conflict(new { error = "File already exists", existingDocumentId = existingDocument.Id });
                }
            }

            // Upload file to storage
            var filePath = await _storageService.UploadFileAsync(
                request.File.OpenReadStream(),
                request.File.FileName,
                request.File.ContentType,
                tenantId?.ToString());

            // Create document entity
            var document = new Document
            {
                Title = request.Title ?? Path.GetFileNameWithoutExtension(request.File.FileName),
                Content = request.Description ?? string.Empty,
                DocumentType = request.DocumentType ?? "File",
                Industry = request.Industry ?? "General",
                Status = request.Status,
                PublicAccessLevel = request.PublicAccessLevel,
                FileName = request.File.FileName,
                ContentType = request.File.ContentType,
                FileSize = request.File.Length,
                FilePath = filePath,
                FileHash = fileHash,
                CreatedBy = userId,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdDocument = await _unitOfWork.Documents.AddAsync(document);

            // Add tags if provided
            if (request.Tags?.Any() == true)
            {
                foreach (var tagName in request.Tags)
                {
                    var tag = new DocumentTag
                    {
                        DocumentId = createdDocument.Id,
                        Name = tagName,
                        Category = "User"
                    };
                    await _unitOfWork.DocumentTags.AddAsync(tag);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            // Reload document with related data
            var documentWithDetails = await _unitOfWork.Documents.GetByIdAsync(createdDocument.Id);
            var documentDto = MapToDetailResponse(documentWithDetails!);

            return CreatedAtAction(nameof(GetDocument), new { id = createdDocument.Id }, documentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document");
            return StatusCode(500, new { error = "Failed to upload document", details = ex.Message });
        }
    }

    /// <summary>
    /// Download a document file
    /// </summary>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var document = await _unitOfWork.Documents.GetByIdAsync(id);

            if (document == null)
            {
                return NotFound(new { error = "Document not found" });
            }

            // Check user access
            var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(id, userId, PermissionType.Read);
            if (!hasAccess)
            {
                return Forbid("You don't have access to this document");
            }

            if (string.IsNullOrEmpty(document.FilePath))
            {
                return BadRequest(new { error = "Document has no associated file" });
            }

            // Download file from storage
            var (stream, contentType, fileName) = await _storageService.DownloadFileAsync(document.FilePath);

            return File(stream, contentType, fileName ?? document.FileName ?? "document");
        }
        catch (FileNotFoundException)
        {
            return NotFound(new { error = "File not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading document {DocumentId}", id);
            return StatusCode(500, new { error = "Failed to download document", details = ex.Message });
        }
    }

    /// <summary>
    /// Get document file metadata
    /// </summary>
    [HttpGet("{id}/file-info")]
    public async Task<ActionResult<object>> GetDocumentFileInfo(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var document = await _unitOfWork.Documents.GetByIdAsync(id);

            if (document == null)
            {
                return NotFound(new { error = "Document not found" });
            }

            // Check user access
            var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(id, userId, PermissionType.Read);
            if (!hasAccess)
            {
                return Forbid("You don't have access to this document");
            }

            if (string.IsNullOrEmpty(document.FilePath))
            {
                return BadRequest(new { error = "Document has no associated file" });
            }

            // Get file metadata from storage
            var metadata = await _storageService.GetFileMetadataAsync(document.FilePath);
            if (metadata == null)
            {
                return NotFound(new { error = "File metadata not found" });
            }

            return Ok(new
            {
                fileName = document.FileName,
                contentType = document.ContentType,
                fileSize = document.FileSize,
                fileHash = document.FileHash,
                storage = new
                {
                    created = metadata.Created,
                    lastModified = metadata.LastModified,
                    etag = metadata.ETag,
                    storageSize = metadata.Size
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving file info for document {DocumentId}", id);
            return StatusCode(500, new { error = "Failed to retrieve file info", details = ex.Message });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    private Guid? GetCurrentTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return null;
        }
        return tenantId;
    }

    private static DocumentListResponse MapToListResponse(Document document)
    {
        return new DocumentListResponse
        {
            Id = document.Id,
            Title = document.Title,
            DocumentType = document.DocumentType,
            Industry = document.Industry,
            Status = document.Status,
            CreatedAt = document.CreatedAt,
            UpdatedAt = document.UpdatedAt,
            CreatedByName = document.CreatedByUser?.FirstName + " " + document.CreatedByUser?.LastName,
            FileName = document.FileName,
            ContentType = document.ContentType,
            FileSize = document.FileSize,
            Version = document.Version,
            IsLatestVersion = document.IsLatestVersion,
            TagNames = document.Tags.Select(t => t.Name).ToList()
        };
    }

    private static DocumentResponse MapToDetailResponse(Document document)
    {
        return new DocumentResponse
        {
            Id = document.Id,
            Title = document.Title,
            Content = document.Content,
            DocumentType = document.DocumentType,
            Industry = document.Industry,
            Status = document.Status,
            PublicAccessLevel = document.PublicAccessLevel,
            PublicSlug = document.PublicSlug,
            PublishedAt = document.PublishedAt,
            MetaDescription = document.MetaDescription,
            MetaKeywords = document.MetaKeywords,
            IndexBySearchEngines = document.IndexBySearchEngines,
            PublicViewCount = document.PublicViewCount,
            LastPublicViewAt = document.LastPublicViewAt,
            CreatedAt = document.CreatedAt,
            UpdatedAt = document.UpdatedAt,
            CreatedBy = document.CreatedBy,
            CreatedByName = document.CreatedByUser?.FirstName + " " + document.CreatedByUser?.LastName,
            TenantId = document.TenantId,
            TenantName = document.Tenant?.Name,
            FileName = document.FileName,
            ContentType = document.ContentType,
            FileSize = document.FileSize,
            FileHash = document.FileHash,
            Version = document.Version,
            IsLatestVersion = document.IsLatestVersion,
            ParentDocumentId = document.ParentDocumentId,
            VersionNotes = document.VersionNotes,
            Tags = document.Tags.Select(t => new DocumentTagResponse
            {
                Id = t.Id,
                Name = t.Name,
                Category = t.Category,
                IsSystemGenerated = t.IsSystemGenerated,
                Confidence = t.Confidence
            }).ToList(),
            Attachments = document.Attachments.Select(a => new DocumentAttachmentResponse
            {
                Id = a.Id,
                FileName = a.FileName,
                ContentType = a.ContentType,
                FileSize = a.FileSize,
                UploadedAt = a.UploadedAt,
                Description = a.Description,
                Type = a.Type
            }).ToList(),
            Metadata = new DocumentMetadataResponse
            {
                Properties = document.Metadata.Properties,
                SourceModule = document.Metadata.SourceModule,
                SourceAgent = document.Metadata.SourceAgent,
                SourceCaptureTime = document.Metadata.SourceCaptureTime,
                SourceLocation = document.Metadata.SourceLocation,
                Keywords = document.Metadata.Keywords,
                Summary = document.Metadata.Summary,
                WordCount = document.Metadata.WordCount,
                Language = document.Metadata.Language
            },
            AIMetadata = document.AIMetadata != null ? new AIMetadataResponse
            {
                ModelUsed = document.AIMetadata.ModelUsed,
                ConfidenceScore = document.AIMetadata.ConfidenceScore,
                ProcessedAt = document.AIMetadata.ProcessedAt,
                ProcessingResults = document.AIMetadata.ProcessingResults,
                PromptUsed = document.AIMetadata.PromptUsed,
                SuggestedTags = document.AIMetadata.SuggestedTags,
                AutoGeneratedSummary = document.AIMetadata.AutoGeneratedSummary
            } : null
        };
    }
}