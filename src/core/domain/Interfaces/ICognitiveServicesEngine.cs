namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Sprint 9: Cognitive Services Engine Interface
/// Defines contract for advanced AI capabilities including computer vision, NLP, and compliance
/// </summary>
public interface ICognitiveServicesEngine
{
    /// <summary>
    /// Analyze document using computer vision for OCR, layout, tables, signatures, and forms
    /// </summary>
    Task<ComputerVisionResult> AnalyzeDocumentAsync(byte[] documentData, string contentType);

    /// <summary>
    /// Process text with multi-language NLP including translation and legal terminology
    /// </summary>
    Task<MultiLanguageNLPResult> ProcessMultiLanguageTextAsync(string text, string? targetLanguage = null);

    /// <summary>
    /// Classify document type and extract metadata using AI
    /// </summary>
    Task<DocumentClassificationResult> ClassifyDocumentAsync(string text, byte[]? documentData = null);

    /// <summary>
    /// Check compliance against multiple regulations using AI-powered analysis
    /// </summary>
    Task<ComplianceCheckResult> CheckComplianceAsync(string text, string documentType, string[] regulations);
}

#region Data Transfer Objects

/// <summary>
/// Computer vision analysis result
/// </summary>
public class ComputerVisionResult
{
    public string ExtractedText { get; set; } = string.Empty;
    public List<DocumentTable> Tables { get; set; } = new();
    public List<DocumentForm> Forms { get; set; } = new();
    public List<DocumentSignature> Signatures { get; set; } = new();
    public DocumentLayout Layout { get; set; } = new();
    public float ConfidenceScore { get; set; }
}

/// <summary>
/// Multi-language NLP processing result
/// </summary>
public class MultiLanguageNLPResult
{
    public string ProcessedText { get; set; } = string.Empty;
    public string DetectedLanguage { get; set; } = string.Empty;
    public string? TranslatedText { get; set; }
    public List<string> LegalTerms { get; set; } = new();
    public List<string> Entities { get; set; } = new();
    public float ConfidenceScore { get; set; }
}

/// <summary>
/// Document classification result
/// </summary>
public class DocumentClassificationResult
{
    public string DocumentType { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
    public List<string> SuggestedTags { get; set; } = new();
    public float ConfidenceScore { get; set; }
}

/// <summary>
/// Compliance check result
/// </summary>
public class ComplianceCheckResult
{
    public bool IsCompliant { get; set; }
    public Dictionary<string, ComplianceStatus> RegulationStatus { get; set; } = new();
    public List<ComplianceIssue> Issues { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
    public float OverallScore { get; set; }
}

/// <summary>
/// Document table structure
/// </summary>
public class DocumentTable
{
    public int RowCount { get; set; }
    public int ColumnCount { get; set; }
    public List<TableRow> Rows { get; set; } = new();
    public List<string> Headers { get; set; } = new();
}

/// <summary>
/// Document form structure
/// </summary>
public class DocumentForm
{
    public string FormType { get; set; } = string.Empty;
    public Dictionary<string, string> Fields { get; set; } = new();
    public float ConfidenceScore { get; set; }
}

/// <summary>
/// Document signature information
/// </summary>
public class DocumentSignature
{
    public string SignatureType { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public DateTime? SignedDate { get; set; }
    public string? SignerInfo { get; set; }
}

/// <summary>
/// Document layout information
/// </summary>
public class DocumentLayout
{
    public int PageCount { get; set; }
    public List<LayoutElement> Elements { get; set; } = new();
    public List<LayoutRegion> Regions { get; set; } = new();
}

/// <summary>
/// Table row data
/// </summary>
public class TableRow
{
    public List<string> Cells { get; set; } = new();
    public bool IsHeader { get; set; }
}

/// <summary>
/// Layout element
/// </summary>
public class LayoutElement
{
    public string Type { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public BoundingBox BoundingBox { get; set; } = new();
}

/// <summary>
/// Layout region
/// </summary>
public class LayoutRegion
{
    public string RegionType { get; set; } = string.Empty;
    public BoundingBox BoundingBox { get; set; } = new();
    public List<LayoutElement> Elements { get; set; } = new();
}

/// <summary>
/// Bounding box coordinates
/// </summary>
public class BoundingBox
{
    public float X { get; set; }
    public float Y { get; set; }
    public float Width { get; set; }
    public float Height { get; set; }
}

/// <summary>
/// Compliance status for a regulation
/// </summary>
public enum ComplianceStatus
{
    Compliant,
    NonCompliant,
    PartiallyCompliant,
    Unknown
}


#endregion