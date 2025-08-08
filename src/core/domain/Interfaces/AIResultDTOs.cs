namespace EnterpriseDocsCore.Domain.Interfaces;

// AI Service Result DTOs
public record ComputerVisionResult
{
    public string[] ExtractedText { get; init; } = Array.Empty<string>();
    public ObjectDetection[] Objects { get; init; } = Array.Empty<ObjectDetection>();
    public FaceDetection[] Faces { get; init; } = Array.Empty<FaceDetection>();
    public string[] Tags { get; init; } = Array.Empty<string>();
    public double Confidence { get; init; }
}

public record ObjectDetection
{
    public string Label { get; init; } = string.Empty;
    public double Confidence { get; init; }
    public BoundingBox BoundingBox { get; init; } = new();
}

public record FaceDetection
{
    public BoundingBox BoundingBox { get; init; } = new();
    public double Age { get; init; }
    public string Gender { get; init; } = string.Empty;
    public EmotionScores Emotions { get; init; } = new();
}

public record BoundingBox
{
    public int X { get; init; }
    public int Y { get; init; }
    public int Width { get; init; }
    public int Height { get; init; }
}

public record EmotionScores
{
    public double Happiness { get; init; }
    public double Sadness { get; init; }
    public double Anger { get; init; }
    public double Fear { get; init; }
    public double Surprise { get; init; }
}

public record MultiLanguageNLPResult
{
    public string DetectedLanguage { get; init; } = string.Empty;
    public double LanguageConfidence { get; init; }
    public SentimentAnalysis Sentiment { get; init; } = new();
    public KeyPhrase[] KeyPhrases { get; init; } = Array.Empty<KeyPhrase>();
    public EntityRecognition[] Entities { get; init; } = Array.Empty<EntityRecognition>();
}

public record SentimentAnalysis
{
    public string Overall { get; init; } = string.Empty; // Positive, Negative, Neutral
    public double PositiveScore { get; init; }
    public double NegativeScore { get; init; }
    public double NeutralScore { get; init; }
}

public record KeyPhrase
{
    public string Text { get; init; } = string.Empty;
    public double Confidence { get; init; }
}

public record EntityRecognition
{
    public string Text { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty; // Person, Location, Organization, etc.
    public double Confidence { get; init; }
}

public record DocumentClassificationResult
{
    public DocumentCategory[] Categories { get; init; } = Array.Empty<DocumentCategory>();
    public string RecommendedCategory { get; init; } = string.Empty;
    public double OverallConfidence { get; init; }
    public string[] SuggestedTags { get; init; } = Array.Empty<string>();
}

public record DocumentCategory
{
    public string Name { get; init; } = string.Empty;
    public double Confidence { get; init; }
    public string Description { get; init; } = string.Empty;
}

public record ComplianceCheckResult
{
    public bool IsCompliant { get; init; }
    public double ComplianceScore { get; init; }
    public ComplianceViolation[] Violations { get; init; } = Array.Empty<ComplianceViolation>();
    public ComplianceRecommendation[] Recommendations { get; init; } = Array.Empty<ComplianceRecommendation>();
    public string[] ApplicableRegulations { get; init; } = Array.Empty<string>();
}

public record ComplianceViolation
{
    public string Type { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Severity { get; init; } = string.Empty; // Low, Medium, High, Critical
    public string Regulation { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty; // Where in the document
}

public record ComplianceRecommendation
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string[] Steps { get; init; } = Array.Empty<string>();
}

public record TranslationResult
{
    public string TranslatedText { get; init; } = string.Empty;
    public string SourceLanguage { get; init; } = string.Empty;
    public string TargetLanguage { get; init; } = string.Empty;
    public double Confidence { get; init; }
    public AlternativeTranslation[] Alternatives { get; init; } = Array.Empty<AlternativeTranslation>();
}

public record AlternativeTranslation
{
    public string Text { get; init; } = string.Empty;
    public double Confidence { get; init; }
}

// Global deployment DTOs
public record RegionHealthStatus
{
    public string Region { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty; // Healthy, Degraded, Outage
    public double ResponseTime { get; init; }
    public double AvailabilityPercent { get; init; }
    public DateTime LastUpdated { get; init; }
    public ServiceHealthStatus[] Services { get; init; } = Array.Empty<ServiceHealthStatus>();
}

public record ServiceHealthStatus
{
    public string ServiceName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public double ResponseTime { get; init; }
    public string[] Issues { get; init; } = Array.Empty<string>();
}

public record GlobalHealthStatus
{
    public string OverallStatus { get; init; } = string.Empty;
    public RegionHealthStatus[] Regions { get; init; } = Array.Empty<RegionHealthStatus>();
    public GlobalMetrics Metrics { get; init; } = new();
    public DateTime LastUpdated { get; init; }
}

public record GlobalMetrics
{
    public double AverageResponseTime { get; init; }
    public double GlobalAvailability { get; init; }
    public int ActiveRegions { get; init; }
    public int TotalRequests { get; init; }
    public int FailedRequests { get; init; }
}

public record CDNOptimizationResult
{
    public bool OptimizationApplied { get; init; }
    public string RecommendedRegion { get; init; } = string.Empty;
    public int CacheHitRatio { get; init; }
    public double LatencyImprovement { get; init; }
    public string[] AppliedOptimizations { get; init; } = Array.Empty<string>();
}

public record FailoverResult
{
    public bool FailoverSuccessful { get; init; }
    public string FailoverRegion { get; init; } = string.Empty;
    public TimeSpan FailoverTime { get; init; }
    public string[] AffectedServices { get; init; } = Array.Empty<string>();
    public string Status { get; init; } = string.Empty;
}