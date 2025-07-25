using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

// Analysis Options and Results
public class AnalysisOptions
{
    public bool IncludeSentiment { get; set; } = true;
    public bool IncludeReadability { get; set; } = true;
    public bool IncludeTopics { get; set; } = true;
    public bool IncludeKeywords { get; set; } = true;
    public string? Language { get; set; }
    public Dictionary<string, object> CustomOptions { get; set; } = new();
}

public class SummaryOptions
{
    public int MaxLength { get; set; } = 500;
    public int MinLength { get; set; } = 50;
    public SummaryStyle Style { get; set; } = SummaryStyle.Balanced;
    public bool IncludeKeyPoints { get; set; } = true;
    public string? Focus { get; set; }
}

public enum SummaryStyle
{
    Concise,
    Balanced,
    Detailed,
    Executive,
    Technical
}

public class ImprovementOptions
{
    public bool FixGrammar { get; set; } = true;
    public bool ImproveClarity { get; set; } = true;
    public bool EnhanceTone { get; set; } = false;
    public string? TargetAudience { get; set; }
    public string? WritingStyle { get; set; }
    public bool PreserveLength { get; set; } = false;
}

public class ContentAnalysis
{
    public float ReadabilityScore { get; set; }
    public string ReadabilityLevel { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public int SentenceCount { get; set; }
    public int ParagraphCount { get; set; }
    public List<string> TopicSummary { get; set; } = new();
    public SentimentAnalysis Sentiment { get; set; } = new();
    public List<string> KeyPhrases { get; set; } = new();
    public Dictionary<string, float> Topics { get; set; } = new();
}

public class SentimentAnalysis
{
    public SentimentType Overall { get; set; }
    public float ConfidenceScore { get; set; }
    public float PositiveScore { get; set; }
    public float NegativeScore { get; set; }
    public float NeutralScore { get; set; }
    public List<SentimentDetail> Details { get; set; } = new();
}

public enum SentimentType
{
    Positive,
    Negative,
    Neutral,
    Mixed
}

public class SentimentDetail
{
    public string Text { get; set; } = string.Empty;
    public SentimentType Sentiment { get; set; }
    public float Confidence { get; set; }
    public int StartOffset { get; set; }
    public int EndOffset { get; set; }
}

public class ComplianceAnalysis
{
    public List<ComplianceResult> Results { get; set; } = new();
    public float OverallScore { get; set; }
    public List<ComplianceIssue> Issues { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class ComplianceResult
{
    public string Framework { get; set; } = string.Empty;
    public float Score { get; set; }
    public bool IsCompliant { get; set; }
    public List<string> Requirements { get; set; } = new();
    public List<string> Violations { get; set; } = new();
}

public class ComplianceIssue
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string? Recommendation { get; set; }
    public int? LineNumber { get; set; }
}

// Audio/Video Processing
public class TranscriptionOptions
{
    public string Language { get; set; } = "en";
    public bool EnableSpeakerDiarization { get; set; } = false;
    public bool EnablePunctuation { get; set; } = true;
    public bool EnableWordTimestamps { get; set; } = false;
    public AudioFormat Format { get; set; } = AudioFormat.Auto;
}

public enum AudioFormat
{
    Auto,
    WAV,
    MP3,
    MP4,
    FLAC,
    OGG
}

public class TranscriptionResult
{
    public string Text { get; set; } = string.Empty;
    public float Confidence { get; set; }
    public TimeSpan Duration { get; set; }
    public List<TranscriptionSegment> Segments { get; set; } = new();
    public List<SpeakerInfo> Speakers { get; set; } = new();
}

public class TranscriptionSegment
{
    public string Text { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public float Confidence { get; set; }
    public string? SpeakerId { get; set; }
    public List<WordTimestamp> Words { get; set; } = new();
}

public class WordTimestamp
{
    public string Word { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public float Confidence { get; set; }
}

public class SpeakerInfo
{
    public string Id { get; set; } = string.Empty;
    public string? Name { get; set; }
    public TimeSpan TotalSpeakingTime { get; set; }
}

public class VideoProcessingOptions
{
    public bool ExtractAudio { get; set; } = true;
    public bool ExtractFrames { get; set; } = false;
    public int FrameInterval { get; set; } = 30; // seconds
    public VideoQuality Quality { get; set; } = VideoQuality.Medium;
    public TranscriptionOptions? AudioOptions { get; set; }
}

public enum VideoQuality
{
    Low,
    Medium,
    High,
    Original
}

// Form Processing
public class FormSchema
{
    public List<FormField> Fields { get; set; } = new();
    public string? Name { get; set; }
    public string? Description { get; set; }
}

public class FormField
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool Required { get; set; } = false;
    public string? Description { get; set; }
    public List<string> Options { get; set; } = new();
}

public class FormExtractionResult
{
    public Dictionary<string, object> Fields { get; set; } = new();
    public float Confidence { get; set; }
    public List<FormField> DetectedFields { get; set; } = new();
    public List<ExtractionIssue> Issues { get; set; } = new();
}

public class ExtractionIssue
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? FieldName { get; set; }
}

// Translation
public class TranslationResult
{
    public string TranslatedText { get; set; } = string.Empty;
    public string SourceLanguage { get; set; } = string.Empty;
    public string TargetLanguage { get; set; } = string.Empty;
    public float Confidence { get; set; }
    public List<TranslationAlternative> Alternatives { get; set; } = new();
}

public class TranslationAlternative
{
    public string Text { get; set; } = string.Empty;
    public float Confidence { get; set; }
}

// Smart Suggestions
public class AutoCompleteSuggestion
{
    public string Text { get; set; } = string.Empty;
    public string? Description { get; set; }
    public float Confidence { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class SmartSuggestionRequest
{
    public string Content { get; set; } = string.Empty;
    public string? Context { get; set; }
    public string? DocumentType { get; set; }
    public string? Industry { get; set; }
    public int MaxSuggestions { get; set; } = 5;
    public Dictionary<string, object> Options { get; set; } = new();
}

public class SmartSuggestion
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Action { get; set; }
    public float Confidence { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

// Quality Assessment
public class QualityCriteria
{
    public bool CheckGrammar { get; set; } = true;
    public bool CheckSpelling { get; set; } = true;
    public bool CheckReadability { get; set; } = true;
    public bool CheckStructure { get; set; } = true;
    public bool CheckTone { get; set; } = false;
    public string? TargetAudience { get; set; }
    public string? DocumentType { get; set; }
}

public class QualityAssessment
{
    public float OverallScore { get; set; }
    public QualityGrade Grade { get; set; }
    public List<QualityIssue> Issues { get; set; } = new();
    public List<string> Suggestions { get; set; } = new();
    public QualityMetrics Metrics { get; set; } = new();
}

public enum QualityGrade
{
    Excellent,
    Good,
    Fair,
    Poor,
    Needs_Improvement
}

public class QualityIssue
{
    public string Type { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? LineNumber { get; set; }
    public int? StartOffset { get; set; }
    public int? EndOffset { get; set; }
    public string? Suggestion { get; set; }
}

public class QualityMetrics
{
    public float ReadabilityScore { get; set; }
    public int GrammarErrors { get; set; }
    public int SpellingErrors { get; set; }
    public int StructureIssues { get; set; }
    public float ToneConsistency { get; set; }
}

public class LanguageIssue
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int StartOffset { get; set; }
    public int EndOffset { get; set; }
    public string? Suggestion { get; set; }
    public string Severity { get; set; } = string.Empty;
}

public class ConsistencyReport
{
    public float OverallScore { get; set; }
    public List<ConsistencyIssue> Issues { get; set; } = new();
    public Dictionary<string, float> CategoryScores { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class ConsistencyIssue
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Examples { get; set; } = new();
    public string? Suggestion { get; set; }
}

// AI Models
public class AIModel
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public List<string> Capabilities { get; set; } = new();
    public ModelLimits Limits { get; set; } = new();
    public bool IsAvailable { get; set; } = true;
    public DateTime? LastUpdated { get; set; }
}

public class ModelLimits
{
    public int MaxTokens { get; set; }
    public int MaxRequestsPerMinute { get; set; }
    public long MaxFileSizeBytes { get; set; }
    public List<string> SupportedFormats { get; set; } = new();
}

public class TrainModelRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BaseModel { get; set; } = string.Empty;
    public List<TrainingData> TrainingData { get; set; } = new();
    public TrainingOptions Options { get; set; } = new();
}

public class TrainingData
{
    public string Input { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class TrainingOptions
{
    public int Epochs { get; set; } = 3;
    public float LearningRate { get; set; } = 0.001f;
    public int BatchSize { get; set; } = 32;
    public Dictionary<string, object> CustomOptions { get; set; } = new();
}

public class CustomModelResult
{
    public string ModelId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public float? TrainingScore { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<string> TrainingLogs { get; set; } = new();
}

// Usage and Performance
public class AIUsageStats
{
    public int TotalRequests { get; set; }
    public int SuccessfulRequests { get; set; }
    public int FailedRequests { get; set; }
    public long TotalTokensUsed { get; set; }
    public TimeSpan TotalProcessingTime { get; set; }
    public decimal TotalCost { get; set; }
    public Dictionary<string, int> RequestsByType { get; set; } = new();
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

public class AIUsageRecord
{
    public Guid UserId { get; set; }
    public string ModelId { get; set; } = string.Empty;
    public string RequestType { get; set; } = string.Empty;
    public int TokensUsed { get; set; }
    public TimeSpan ProcessingTime { get; set; }
    public decimal Cost { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class AIPerformanceMetric
{
    public string MetricName { get; set; } = string.Empty;
    public float Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? ModelId { get; set; }
}

// Batch Processing
public class BatchProcessingRequest
{
    public string Name { get; set; } = string.Empty;
    public List<BatchItem> Items { get; set; } = new();
    public BatchProcessingOptions Options { get; set; } = new();
    public Guid RequestedBy { get; set; }
}

public class BatchItem
{
    public string Id { get; set; } = string.Empty;
    public ProcessDocumentRequest Request { get; set; } = new() { Input = new DocumentInput { Type = DocumentInputType.Text } };
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class BatchProcessingOptions
{
    public int MaxConcurrency { get; set; } = 5;
    public bool ContinueOnError { get; set; } = true;
    public TimeSpan? Timeout { get; set; }
    public string? NotificationUrl { get; set; }
}

public class BatchProcessingResult
{
    public Guid BatchId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalItems { get; set; }
    public int ProcessedItems { get; set; }
    public int SuccessfulItems { get; set; }
    public int FailedItems { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<BatchItemResult> Results { get; set; } = new();
}

public class BatchItemResult
{
    public string ItemId { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public DocumentOutput? Result { get; set; }
    public string? ErrorMessage { get; set; }
    public TimeSpan ProcessingTime { get; set; }
}

public class BatchProcessingStatus
{
    public Guid BatchId { get; set; }
    public string Status { get; set; } = string.Empty;
    public float Progress { get; set; }
    public int TotalItems { get; set; }
    public int ProcessedItems { get; set; }
    public DateTime StartedAt { get; set; }
    public TimeSpan? EstimatedTimeRemaining { get; set; }
    public string? CurrentItem { get; set; }
}

// Additional Document Types
public class DocumentOutput
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public float ConfidenceScore { get; set; }
    public List<string> SuggestedTags { get; set; } = new();
    public List<string> Keywords { get; set; } = new();
    public DocumentMetadata Metadata { get; set; } = new();
    public AIMetadata? AIMetadata { get; set; }
}

public class GenerateDocumentRequest
{
    public string DocumentType { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Title { get; set; }
    public Dictionary<string, object> Parameters { get; set; } = new();
    public string? TemplateId { get; set; }
    public string? Style { get; set; }
    public int? TargetLength { get; set; }
    public Guid? UserId { get; set; }
}

public class ProcessingOptions
{
    public bool GenerateSummary { get; set; } = true;
    public bool ExtractKeywords { get; set; } = true;
    public bool AnalyzeSentiment { get; set; } = false;
    public bool CheckCompliance { get; set; } = false;
    public List<string> ComplianceFrameworks { get; set; } = new();
    public string? OutputFormat { get; set; }
    public Dictionary<string, object> CustomOptions { get; set; } = new();
}