using EnterpriseDocsCore.Infrastructure.Services.AI;

namespace EnterpriseDocsCore.Domain.Interfaces
{
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
}