using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

public interface IAIService
{
    // Document processing
    Task<DocumentOutput> ProcessDocumentAsync(ProcessDocumentRequest request, CancellationToken cancellationToken = default);
    Task<DocumentOutput> GenerateDocumentAsync(GenerateDocumentRequest request, CancellationToken cancellationToken = default);
    Task<string> SummarizeDocumentAsync(string content, SummaryOptions? options = null, CancellationToken cancellationToken = default);
    Task<string> ImproveDocumentAsync(string content, ImprovementOptions? options = null, CancellationToken cancellationToken = default);
    
    // Content analysis
    Task<ContentAnalysis> AnalyzeContentAsync(string content, AnalysisOptions? options = null, CancellationToken cancellationToken = default);
    Task<List<string>> ExtractKeywordsAsync(string content, int maxKeywords = 10, CancellationToken cancellationToken = default);
    Task<List<string>> SuggestTagsAsync(string content, string? industry = null, int maxTags = 5, CancellationToken cancellationToken = default);
    Task<SentimentAnalysis> AnalyzeSentimentAsync(string content, CancellationToken cancellationToken = default);
    Task<ComplianceAnalysis> AnalyzeComplianceAsync(string content, List<string> frameworks, CancellationToken cancellationToken = default);
    
    // Multi-modal processing
    Task<TranscriptionResult> TranscribeAudioAsync(Stream audioStream, TranscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<string> DescribeImageAsync(Stream imageStream, string? context = null, CancellationToken cancellationToken = default);
    Task<string> ExtractTextFromImageAsync(Stream imageStream, CancellationToken cancellationToken = default);
    Task<string> ProcessVideoAsync(Stream videoStream, VideoProcessingOptions? options = null, CancellationToken cancellationToken = default);
    
    // Template and form processing
    Task<string> FillTemplateAsync(string template, Dictionary<string, object> variables, CancellationToken cancellationToken = default);
    Task<FormExtractionResult> ExtractFormDataAsync(string content, FormSchema? schema = null, CancellationToken cancellationToken = default);
    Task<List<TemplateVariable>> IdentifyTemplateVariablesAsync(string template, CancellationToken cancellationToken = default);
    
    // Translation and localization
    Task<TranslationResult> TranslateTextAsync(string text, string targetLanguage, string? sourceLanguage = null, CancellationToken cancellationToken = default);
    Task<string> DetectLanguageAsync(string text, CancellationToken cancellationToken = default);
    Task<List<string>> GetSupportedLanguagesAsync(CancellationToken cancellationToken = default);
    
    // Intelligent suggestions
    Task<List<string>> SuggestNextActionsAsync(string content, string? context = null, CancellationToken cancellationToken = default);
    Task<List<AutoCompleteSuggestion>> GetAutoCompleteSuggestionsAsync(string partialText, string? context = null, CancellationToken cancellationToken = default);
    Task<List<SmartSuggestion>> GetSmartSuggestionsAsync(SmartSuggestionRequest request, CancellationToken cancellationToken = default);
    
    // Quality assurance
    Task<QualityAssessment> AssessDocumentQualityAsync(string content, QualityCriteria? criteria = null, CancellationToken cancellationToken = default);
    Task<List<LanguageIssue>> CheckLanguageAsync(string content, string? language = null, CancellationToken cancellationToken = default);
    Task<ConsistencyReport> CheckConsistencyAsync(List<string> documents, CancellationToken cancellationToken = default);
    
    // Custom model management
    Task<List<AIModel>> GetAvailableModelsAsync(CancellationToken cancellationToken = default);
    Task<AIModel?> GetModelInfoAsync(string modelId, CancellationToken cancellationToken = default);
    Task<CustomModelResult> TrainCustomModelAsync(TrainModelRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeployCustomModelAsync(string modelId, CancellationToken cancellationToken = default);
    
    // Usage tracking and analytics
    Task<AIUsageStats> GetUsageStatsAsync(Guid? userId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task RecordUsageAsync(AIUsageRecord record, CancellationToken cancellationToken = default);
    Task<List<AIPerformanceMetric>> GetPerformanceMetricsAsync(string? modelId = null, CancellationToken cancellationToken = default);
    
    // Batch processing
    Task<BatchProcessingResult> ProcessBatchAsync(BatchProcessingRequest request, CancellationToken cancellationToken = default);
    Task<BatchProcessingStatus> GetBatchStatusAsync(Guid batchId, CancellationToken cancellationToken = default);
    Task<bool> CancelBatchAsync(Guid batchId, CancellationToken cancellationToken = default);
}

// Request/Response DTOs that are unique to this file
public class ProcessDocumentRequest
{
    public required DocumentInput Input { get; set; }
    public string? AgentId { get; set; }
    public string? TemplateId { get; set; }
    public ProcessingOptions? Options { get; set; }
    public Dictionary<string, object> Configuration { get; set; } = new();
    public Guid? UserId { get; set; }
}

public class DocumentInput
{
    public DocumentInputType Type { get; set; }
    public string? TextContent { get; set; }
    public Stream? FileStream { get; set; }
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
    public DocumentContext? Context { get; set; }
}

public enum DocumentInputType
{
    Text,
    Audio,
    Video,
    Image,
    File,
    Email,
    Chat,
    Meeting,
    PhoneCall,
    ScreenCapture
}

public class DocumentContext
{
    public List<string> Participants { get; set; } = new();
    public string? Location { get; set; }
    public DateTime? Timestamp { get; set; }
    public TimeSpan? Duration { get; set; }
    public string? Industry { get; set; }
    public string? DocumentType { get; set; }
    public List<string> Tags { get; set; } = new();
    public Dictionary<string, object> CustomContext { get; set; } = new();
}

public class TemplateVariable
{
    public required string Name { get; set; }
    public required string Type { get; set; }
    public bool Required { get; set; }
    public string? Description { get; set; }
    public string? DefaultValue { get; set; }
    public List<string> Options { get; set; } = new();
}