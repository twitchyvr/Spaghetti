import React, { useState } from 'react';
import { AIDocumentGenerator } from '../components/ai/AIDocumentGenerator';
import { AIDocumentGenerationResponse } from '../types';
import { documentApi } from '../services/api';

const AIDocuments: React.FC = () => {
  const [recentDocuments, setRecentDocuments] = useState<AIDocumentGenerationResponse[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDocumentGenerated = async (document: AIDocumentGenerationResponse) => {
    // Add to recent documents list
    setRecentDocuments(prev => [document, ...prev.slice(0, 4)]);
    
    // Optionally save to backend
    try {
      await documentApi.createDocument({
        title: document.title,
        content: document.content,
        tags: ['ai-generated', document.metadata.templateType]
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Document Generation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create professional documents using AI-powered templates and natural language processing
          </p>
        </div>

        {/* Success Message */}
        {savedSuccess && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-700 dark:text-green-400">
              Document successfully generated and saved to your document library!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Document Generator */}
          <div className="lg:col-span-2">
            <AIDocumentGenerator 
              onDocumentGenerated={handleDocumentGenerated}
              className="w-full"
            />
          </div>

          {/* Sidebar - Recent Documents & Tips */}
          <div className="space-y-6">
            {/* Recent Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recently Generated
                </h3>
              </div>
              <div className="p-4">
                {recentDocuments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No documents generated yet. Create your first AI-generated document using the form on the left.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentDocuments.map((doc, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {doc.title}
                        </h4>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.metadata.templateType}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(doc.metadata.confidenceScore * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tips & Best Practices */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Tips for Better Results
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">💡</span>
                    <p>
                      <strong>Be specific:</strong> Provide detailed information in the template parameters for more accurate results.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <p>
                      <strong>Choose the right model:</strong> GPT-4 for complex documents, GPT-3.5 for faster generation.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2">🎯</span>
                    <p>
                      <strong>Review and edit:</strong> Always review generated content and make necessary adjustments.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">⚡</span>
                    <p>
                      <strong>Template selection:</strong> Choose templates that match your industry and document type.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Model Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  AI Service Status
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">OpenAI GPT-4</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">OpenAI GPT-3.5</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Claude 3</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDocuments;