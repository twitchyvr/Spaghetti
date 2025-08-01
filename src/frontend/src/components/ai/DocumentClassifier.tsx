import React, { useState, useEffect } from 'react';
import { Brain, FileText, AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface DocumentClassification {
  id: string;
  category: string;
  confidence: number;
  subcategory?: string;
  suggestedTags: string[];
  complianceFlags: string[];
  estimatedProcessingTime: number;
}

interface DocumentClassifierProps {
  documentId: string;
  content?: string;
  onClassificationComplete?: (classification: DocumentClassification) => void;
}

const DocumentClassifier: React.FC<DocumentClassifierProps> = ({
  documentId,
  content,
  onClassificationComplete
}) => {
  const [classification, setClassification] = useState<DocumentClassification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(false);

  const documentCategories = [
    { id: 'contract', label: 'Contract', color: 'bg-blue-100 text-blue-800' },
    { id: 'legal-brief', label: 'Legal Brief', color: 'bg-green-100 text-green-800' },
    { id: 'court-filing', label: 'Court Filing', color: 'bg-purple-100 text-purple-800' },
    { id: 'memo', label: 'Legal Memo', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'policy', label: 'Policy Document', color: 'bg-red-100 text-red-800' },
    { id: 'compliance', label: 'Compliance Document', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'correspondence', label: 'Legal Correspondence', color: 'bg-gray-100 text-gray-800' },
    { id: 'research', label: 'Legal Research', color: 'bg-teal-100 text-teal-800' }
  ];

  useEffect(() => {
    if (documentId || content) {
      classifyDocument();
    }
  }, [documentId, content]);

  const classifyDocument = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate ML classification with realistic processing time
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock ML classification result with high confidence
      const mockClassification: DocumentClassification = {
        id: documentId,
        category: 'contract',
        confidence: 0.94,
        subcategory: 'service-agreement',
        suggestedTags: ['commercial', 'B2B', 'software-services', 'annual'],
        complianceFlags: ['gdpr-review-needed', 'data-processing-clause'],
        estimatedProcessingTime: 45 // minutes
      };

      setClassification(mockClassification);
      onClassificationComplete?.(mockClassification);
    } catch (err) {
      setError('Failed to classify document. Please try manual classification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualOverride = (newCategory: string) => {
    if (classification) {
      const updatedClassification = {
        ...classification,
        category: newCategory,
        confidence: 1.0 // Manual classification is 100% confident
      };
      setClassification(updatedClassification);
      onClassificationComplete?.(updatedClassification);
      setManualOverride(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return documentCategories.find(cat => cat.id === categoryId) || 
           { id: categoryId, label: categoryId, color: 'bg-gray-100 text-gray-800' };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Classification Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => setManualOverride(true)}
              className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
            >
              Manual Classification
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Document Classification</h3>
        </div>
        {classification && (
          <button
            onClick={() => setManualOverride(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Override
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center text-indigo-600">
            <Clock className="h-5 w-5 mr-2 animate-spin" />
            <span className="text-sm">Analyzing document with ML models...</span>
          </div>
        </div>
      ) : classification ? (
        <div className="space-y-4">
          {/* Primary Classification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 mr-3">Classification:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryInfo(classification.category).color}`}>
                {getCategoryInfo(classification.category).label}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Confidence:</span>
              <span className={`font-semibold ${getConfidenceColor(classification.confidence)}`}>
                {(classification.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Subcategory */}
          {classification.subcategory && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-3">Subcategory:</span>
              <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {classification.subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          )}

          {/* Estimated Processing Time */}
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 mr-3">Est. Processing Time:</span>
            <span className="text-sm font-medium text-gray-900">
              {classification.estimatedProcessingTime} minutes
            </span>
          </div>

          {/* Suggested Tags */}
          {classification.suggestedTags.length > 0 && (
            <div>
              <span className="text-sm text-gray-600 block mb-2">Suggested Tags:</span>
              <div className="flex flex-wrap gap-2">
                {classification.suggestedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Flags */}
          {classification.complianceFlags.length > 0 && (
            <div>
              <span className="text-sm text-gray-600 block mb-2">Compliance Flags:</span>
              <div className="space-y-1">
                {classification.complianceFlags.map((flag, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-amber-700">
                      {flag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Manual Override Modal */}
      {manualOverride && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Manual Classification</h4>
            <p className="text-sm text-gray-600 mb-4">
              Select the correct document category:
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {documentCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleManualOverride(category.id)}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    classification?.category === category.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{category.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setManualOverride(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentClassifier;