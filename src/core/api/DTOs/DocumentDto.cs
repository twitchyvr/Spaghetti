using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.API.DTOs;

public class DocumentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid TenantId { get; set; }
}

public class CreateDocumentDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
}

public class UpdateDocumentDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public DocumentStatus? Status { get; set; }
}
