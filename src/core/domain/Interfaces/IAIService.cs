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

// Request/Response DTOs
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

public class ProcessingOptions
{
    public string? Language { get; set; }
    public string? OutputFormat { get; set; }
    public bool IncludeSummary { get; set; } = true;
    public bool IncludeKeywords { get; set; } = true;
    public bool IncludeTags { get; set; } = true;
    public bool IncludeActionItems { get; set; } = true;
    public bool IncludeSentiment { get; set; } = false;
    public bool IncludeCompliance { get; set; } = false;
    public List<string> ComplianceFrameworks { get; set; } = new();
    public int MaxSummaryLength { get; set; } = 200;
    public int MaxKeywords { get; set; } = 10;
    public int MaxTags { get; set; } = 5;
}

public class DocumentOutput
{
    public required string Title { get; set; }
    public required string Content { get; set; }
    public string? Summary { get; set; }
    public required string DocumentType { get; set; }
    public float ConfidenceScore { get; set; }
    public List<string> SuggestedTags { get; set; } = new();
    public List<string> Keywords { get; set; } = new();
    public DocumentMetadata Metadata { get; set; } = new();
    public List<ActionItem> ActionItems { get; set; } = new();
    public List<string> KeyPoints { get; set; } = new();
    public SentimentAnalysis? Sentiment { get; set; }
    public ComplianceAnalysis? Compliance { get; set; }
    public ProcessingMetrics Metrics { get; set; } = new();
}

public class ActionItem
{
    public required string Description { get; set; }
    public string? Assignee { get; set; }
    public DateTime? DueDate { get; set; }
    public ActionItemPriority Priority { get; set; } = ActionItemPriority.Medium;
    public ActionItemStatus Status { get; set; } = ActionItemStatus.Pending;
    public float Confidence { get; set; }
}

public enum ActionItemPriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum ActionItemStatus
{
    Pending,
    InProgress,
    Completed,
    Cancelled
}

public class GenerateDocumentRequest
{
    public required string DocumentType { get; set; }
    public required string Industry { get; set; }
    public string? Template { get; set; }
    public Dictionary<string, object> Variables { get; set; } = new();
    public string? Context { get; set; }
    public GenerationOptions? Options { get; set; }
}

public class GenerationOptions
{
    public string? Style { get; set; }
    public string? Tone { get; set; }
    public int? TargetLength { get; set; }
    public string? Audience { get; set; }
    public List<string> RequiredSections { get; set; } = new();
    public bool IncludeReferences { get; set; } = false;
    public string? Language { get; set; } = "en";
}

public class SummaryOptions
{
    public int MaxLength { get; set; } = 200;
    public SummaryType Type { get; set; } = SummaryType.Extractive;
    public string? Language { get; set; }
    public List<string> KeyTopics { get; set; } = new();
}

public enum SummaryType
{
    Extractive,
    Abstractive,
    Bullet,
    Executive
}

public class ImprovementOptions
{
    public List<ImprovementType> Types { get; set; } = new();
    public string? Style { get; set; }
    public string? Tone { get; set; }
    public string? Audience { get; set; }
    public bool PreserveLength { get; set; } = false;
}

public enum ImprovementType
{
    Grammar,
    Clarity,
    Conciseness,
    Formality,
    Structure,
    Tone,
    Vocabulary
}

public class ContentAnalysis
{
    public float ReadabilityScore { get; set; }
    public string ReadabilityLevel { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public int SentenceCount { get; set; }
    public int ParagraphCount { get; set; }
    public List<string> TopicSummary { get; set; } = new();
    public List<EntityExtraction> Entities { get; set; } = new();
    public SentimentAnalysis Sentiment { get; set; } = new();
    public LanguageDetection Language { get; set; } = new();
    public Dictionary<string, float> TopicDistribution { get; set; } = new();
}

public class EntityExtraction
{
    public required string Text { get; set; }
    public required string Type { get; set; }
    public float Confidence { get; set; }
    public int StartPosition { get; set; }
    public int EndPosition { get; set; }
    public Dictionary<string, object> Properties { get; set; } = new();
}

public class SentimentAnalysis
{
    public SentimentType Overall { get; set; }
    public float PositiveScore { get; set; }
    public float NegativeScore { get; set; }
    public float NeutralScore { get; set; }
    public float ConfidenceScore { get; set; }
    public List<SentimentBySection> SectionBreakdown { get; set; } = new();
}

public enum SentimentType
{
    Positive,
    Negative,
    Neutral,
    Mixed
}

public class SentimentBySection
{
    public required string SectionText { get; set; }
    public SentimentType Sentiment { get; set; }
    public float Score { get; set; }
    public int StartPosition { get; set; }
    public int EndPosition { get; set; }
}

public class ComplianceAnalysis
{
    public List<ComplianceResult> Results { get; set; } = new();
    public float OverallComplianceScore { get; set; }
    public List<ComplianceIssue> Issues { get; set; } = new();
    public List<ComplianceRecommendation> Recommendations { get; set; } = new();
}

public class ComplianceResult
{
    public required string Framework { get; set; }
    public float Score { get; set; }
    public ComplianceStatus Status { get; set; }
    public List<string> PassedChecks { get; set; } = new();
    public List<string> FailedChecks { get; set; } = new();
}

public enum ComplianceStatus
{
    Compliant,
    NonCompliant,
    PartiallyCompliant,
    RequiresReview
}

public class ComplianceIssue
{
    public required string Framework { get; set; }
    public required string Issue { get; set; }
    public IssueSeverity Severity { get; set; }
    public string? SuggestedFix { get; set; }
    public int? LineNumber { get; set; }
}

public enum IssueSeverity
{
    Low,
    Medium,
    High,
    Critical
}

public class ComplianceRecommendation
{
    public required string Framework { get; set; }
    public required string Recommendation { get; set; }
    public string? Rationale { get; set; }
    public RecommendationPriority Priority { get; set; }
}

public enum RecommendationPriority
{
    Low,
    Medium,
    High,
    Critical
}

public class TranscriptionResult
{
    public required string Text { get; set; }
    public float ConfidenceScore { get; set; }
    public TimeSpan Duration { get; set; }
    public string? Language { get; set; }
    public List<TranscriptionSegment> Segments { get; set; } = new();
    public List<Speaker> Speakers { get; set; } = new();
}

public class TranscriptionSegment
{
    public required string Text { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public float Confidence { get; set; }
    public string? SpeakerId { get; set; }
}

public class Speaker
{
    public required string Id { get; set; }
    public string? Name { get; set; }
    public TimeSpan TotalSpeakingTime { get; set; }
    public int SegmentCount { get; set; }
}

public class TranscriptionOptions
{
    public string? Language { get; set; }
    public bool EnableSpeakerDiarization { get; set; } = false;
    public bool EnablePunctuation { get; set; } = true;
    public bool EnableTimestamps { get; set; } = false;
    public List<string> CustomVocabulary { get; set; } = new();
}

public class VideoProcessingOptions
{
    public bool ExtractAudio { get; set; } = true;
    public bool ExtractFrames { get; set; } = false;
    public int FrameIntervalSeconds { get; set; } = 30;
    public bool AnalyzeContent { get; set; } = true;
    public TranscriptionOptions? TranscriptionOptions { get; set; }
}

public class FormExtractionResult
{
    public Dictionary<string, object> ExtractedData { get; set; } = new();
    public float ConfidenceScore { get; set; }
    public List<ExtractionIssue> Issues { get; set; } = new();
    public FormSchema? DetectedSchema { get; set; }
}

public class FormSchema
{
    public required string Name { get; set; }
    public List<FormField> Fields { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class FormField
{
    public required string Name { get; set; }
    public required string Type { get; set; }
    public bool Required { get; set; }
    public string? DefaultValue { get; set; }
    public List<string> Options { get; set; } = new();
    public Dictionary<string, object> Validation { get; set; } = new();
}

public class ExtractionIssue
{
    public required string Field { get; set; }
    public required string Issue { get; set; }
    public IssueSeverity Severity { get; set; }
    public string? SuggestedValue { get; set; }
}

public class TranslationResult
{
    public required string TranslatedText { get; set; }
    public required string SourceLanguage { get; set; }
    public required string TargetLanguage { get; set; }
    public float ConfidenceScore { get; set; }
    public List<TranslationAlternative> Alternatives { get; set; } = new();
}

public class TranslationAlternative
{
    public required string Text { get; set; }
    public float Score { get; set; }
}

public class AutoCompleteSuggestion
{
    public required string Text { get; set; }
    public float Score { get; set; }
    public string? Type { get; set; }
    public Dictionary<string, object> Context { get; set; } = new();
}

public class SmartSuggestionRequest
{
    public required string Content { get; set; }
    public string? DocumentType { get; set; }
    public string? Industry { get; set; }
    public List<string> SuggestionTypes { get; set; } = new();
    public int MaxSuggestions { get; set; } = 5;
}

public class SmartSuggestion
{
    public required string Type { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public string? ActionText { get; set; }
    public float Priority { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
}

public class QualityAssessment
{
    public float OverallScore { get; set; }
    public List<QualityDimension> Dimensions { get; set; } = new();
    public List<QualityIssue> Issues { get; set; } = new();
    public List<QualityRecommendation> Recommendations { get; set; } = new();
}

public class QualityDimension
{
    public required string Name { get; set; }
    public float Score { get; set; }
    public string? Description { get; set; }
    public List<string> Strengths { get; set; } = new();
    public List<string> Weaknesses { get; set; } = new();
}

public class QualityIssue
{
    public required string Category { get; set; }
    public required string Description { get; set; }
    public IssueSeverity Severity { get; set; }
    public string? SuggestedFix { get; set; }
    public int? LineNumber { get; set; }
}

public class QualityRecommendation
{
    public required string Category { get; set; }
    public required string Recommendation { get; set; }
    public string? Rationale { get; set; }
    public RecommendationPriority Priority { get; set; }
}

public class QualityCriteria
{
    public List<string> RequiredSections { get; set; } = new();
    public int? MinWordCount { get; set; }
    public int? MaxWordCount { get; set; }
    public float? MinReadabilityScore { get; set; }
    public List<string> RequiredKeywords { get; set; } = new();
    public List<string> ForbiddenWords { get; set; } = new();
    public bool CheckGrammar { get; set; } = true;
    public bool CheckSpelling { get; set; } = true;
    public bool CheckConsistency { get; set; } = true;
}

public class LanguageIssue
{
    public LanguageIssueType Type { get; set; }
    public required string Description { get; set; }
    public string? SuggestedFix { get; set; }
    public int StartPosition { get; set; }
    public int EndPosition { get; set; }
    public IssueSeverity Severity { get; set; }
}

public enum LanguageIssueType
{
    Grammar,
    Spelling,
    Punctuation,
    Style,
    Tone,
    Clarity,
    Consistency
}

public class ConsistencyReport
{
    public float OverallConsistencyScore { get; set; }
    public List<ConsistencyIssue> Issues { get; set; } = new();
    public Dictionary<string, float> CategoryScores { get; set; } = new();
}

public class ConsistencyIssue
{
    public required string Category { get; set; }
    public required string Description { get; set; }
    public List<int> DocumentIndices { get; set; } = new();
    public IssueSeverity Severity { get; set; }
    public string? SuggestedFix { get; set; }
}

public class LanguageDetection
{
    public required string Language { get; set; }
    public float Confidence { get; set; }
    public List<LanguageCandidate> Alternatives { get; set; } = new();
}

public class LanguageCandidate
{
    public required string Language { get; set; }
    public float Confidence { get; set; }
}

public class AIModel
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Provider { get; set; }
    public required string Type { get; set; }
    public List<string> Capabilities { get; set; } = new();
    public ModelConfiguration Configuration { get; set; } = new();
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ModelConfiguration
{
    public int MaxTokens { get; set; }
    public float Temperature { get; set; }
    public float TopP { get; set; }
    public int TopK { get; set; }
    public List<string> StopSequences { get; set; } = new();
    public Dictionary<string, object> CustomParameters { get; set; } = new();
}

public class TrainModelRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string BaseModelId { get; set; }
    public required List<TrainingExample> TrainingData { get; set; }
    public TrainingConfiguration Configuration { get; set; } = new();
}

public class TrainingExample
{
    public required string Input { get; set; }
    public required string Output { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class TrainingConfiguration
{
    public int Epochs { get; set; } = 3;
    public float LearningRate { get; set; } = 0.001f;
    public int BatchSize { get; set; } = 8;
    public float ValidationSplit { get; set; } = 0.2f;
    public Dictionary<string, object> CustomParameters { get; set; } = new();
}

public class CustomModelResult
{
    public required string ModelId { get; set; }
    public ModelTrainingStatus Status { get; set; }
    public float? Accuracy { get; set; }
    public float? Loss { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public TrainingMetrics? Metrics { get; set; }
}

public enum ModelTrainingStatus
{
    Pending,
    Training,
    Completed,
    Failed,
    Cancelled
}

public class TrainingMetrics
{
    public float FinalAccuracy { get; set; }
    public float FinalLoss { get; set; }
    public List<EpochMetric> EpochMetrics { get; set; } = new();
    public TimeSpan TrainingDuration { get; set; }
}

public class EpochMetric
{
    public int Epoch { get; set; }
    public float TrainingLoss { get; set; }
    public float ValidationLoss { get; set; }
    public float TrainingAccuracy { get; set; }
    public float ValidationAccuracy { get; set; }
}

public class AIUsageStats
{
    public int TotalRequests { get; set; }
    public int TotalTokensUsed { get; set; }
    public TimeSpan TotalProcessingTime { get; set; }
    public decimal TotalCost { get; set; }
    public Dictionary<string, int> RequestsByModel { get; set; } = new();
    public Dictionary<string, int> RequestsByType { get; set; } = new();
    public Dictionary<DateTime, int> RequestsByDay { get; set; } = new();
    public float AverageResponseTime { get; set; }
    public float SuccessRate { get; set; }
}

public class AIUsageRecord
{
    public required string ModelId { get; set; }
    public required string RequestType { get; set; }
    public int TokensUsed { get; set; }
    public TimeSpan ProcessingTime { get; set; }
    public decimal Cost { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public Guid? UserId { get; set; }
    public Guid? TenantId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class AIPerformanceMetric
{
    public required string MetricName { get; set; }
    public float Value { get; set; }
    public string? Unit { get; set; }
    public DateTime Timestamp { get; set; }
    public string? ModelId { get; set; }
    public Dictionary<string, object> Tags { get; set; } = new();
}

public class BatchProcessingRequest
{
    public required List<ProcessDocumentRequest> Requests { get; set; }
    public BatchProcessingOptions? Options { get; set; }
    public string? CallbackUrl { get; set; }
}

public class BatchProcessingOptions
{
    public int MaxConcurrency { get; set; } = 5;
    public TimeSpan Timeout { get; set; } = TimeSpan.FromMinutes(30);
    public bool ContinueOnError { get; set; } = true;
    public string? Priority { get; set; }
}

public class BatchProcessingResult
{
    public Guid BatchId { get; set; }
    public BatchProcessingStatus Status { get; set; }
    public int TotalItems { get; set; }
    public int CompletedItems { get; set; }
    public int FailedItems { get; set; }
    public List<BatchProcessingError> Errors { get; set; } = new();
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ResultsUrl { get; set; }
}

public class BatchProcessingStatus
{
    public Guid BatchId { get; set; }
    public BatchStatus Status { get; set; }
    public float Progress { get; set; }
    public int TotalItems { get; set; }
    public int CompletedItems { get; set; }
    public int FailedItems { get; set; }
    public TimeSpan? EstimatedTimeRemaining { get; set; }
}

public enum BatchStatus
{
    Pending,
    Processing,
    Completed,
    Failed,
    Cancelled
}

public class BatchProcessingError
{
    public int ItemIndex { get; set; }
    public required string Error { get; set; }
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; }
}

public class ProcessingMetrics
{
    public TimeSpan ProcessingTime { get; set; }
    public int TokensUsed { get; set; }
    public string? ModelUsed { get; set; }
    public float ConfidenceScore { get; set; }
    public Dictionary<string, object> AdditionalMetrics { get; set; } = new();
}