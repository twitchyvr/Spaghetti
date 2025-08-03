import React, { useState } from 'react';
import { AIDocumentGenerator } from '../components/ai/AIDocumentGenerator';
import { AIDocumentGenerationResponse } from '../types';
import { documentApi } from '../services/api';

// Pantry Components
import { Card, CardHeader, CardContent } from '../components/pantry/Card';
import { Alert } from '../components/pantry/Alert';
import { Badge, StatusBadge } from '../components/pantry/Badge';

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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            AI Document Generation
          </h1>
          <p className="mt-2 text-neutral-600">
            Create professional documents using AI-powered templates and natural language processing
          </p>
        </div>

        {/* Success Message */}
        {savedSuccess && (
          <Alert variant="success" className="mb-4" dismissible onDismiss={() => setSavedSuccess(false)}>
            Document successfully generated and saved to your document library!
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Document Generator */}
          <div className="lg:col-span-2">
            <AIDocumentGenerator 
              onDocumentGenerated={handleDocumentGenerated}
            />
          </div>

          {/* Sidebar - Recent Documents & Tips */}
          <div className="space-y-6">
            {/* Recent Documents */}
            <Card>
              <CardHeader title="Recently Generated" />
              <CardContent>
                {recentDocuments.length === 0 ? (
                  <p className="text-neutral-500 text-sm">
                    No documents generated yet. Create your first AI-generated document using the form on the left.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentDocuments.map((doc, index) => (
                      <Card key={index} variant="filled" padding="sm">
                        <h4 className="font-medium text-neutral-900 text-sm truncate">
                          {doc.title}
                        </h4>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="secondary" size="sm">
                            {doc.metadata.templateType}
                          </Badge>
                          <Badge variant="info" size="sm">
                            {Math.round(doc.metadata.confidenceScore * 100)}% confidence
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips & Best Practices */}
            <Card>
              <CardHeader title="Tips for Better Results" />
              <CardContent>
                <div className="space-y-4 text-sm text-neutral-600">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500">💡</span>
                    <p>
                      <strong className="text-neutral-900">Be specific:</strong> Provide detailed information in the template parameters for more accurate results.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✅</span>
                    <p>
                      <strong className="text-neutral-900">Choose the right model:</strong> GPT-4 for complex documents, GPT-3.5 for faster generation.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500">🎯</span>
                    <p>
                      <strong className="text-neutral-900">Review and edit:</strong> Always review generated content and make necessary adjustments.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500">⚡</span>
                    <p>
                      <strong className="text-neutral-900">Template selection:</strong> Choose templates that match your industry and document type.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Model Status */}
            <Card>
              <CardHeader title="AI Service Status" />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">OpenAI GPT-4</span>
                    <Badge variant="success" size="sm" dot>
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">OpenAI GPT-3.5</span>
                    <Badge variant="success" size="sm" dot>
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Claude 3</span>
                    <Badge variant="warning" size="sm" dot>
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDocuments;