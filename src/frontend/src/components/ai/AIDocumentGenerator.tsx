import React, { useState } from 'react';
import { Sparkles, FileText, Clock, Send } from 'lucide-react';

interface AIDocumentGenerationResponse {
  title: string;
  content: string;
  metadata: {
    templateType: string;
    model: string;
    generatedAt: string;
    processingTime: number;
    confidenceScore: number;
  };
}

interface AIDocumentGeneratorProps {
  onDocumentGenerated?: (document: AIDocumentGenerationResponse) => void;
}

export const AIDocumentGenerator: React.FC<AIDocumentGeneratorProps> = ({
  onDocumentGenerated
}) => {
  const [prompt, setPrompt] = useState('');
  const [documentType, setDocumentType] = useState('contract');
  const [isGenerating, setIsGenerating] = useState(false);

  const documentTypes = [
    { id: 'contract', label: 'Contract', icon: '📄' },
    { id: 'legal-brief', label: 'Legal Brief', icon: '⚖️' },
    { id: 'memo', label: 'Legal Memo', icon: '📝' },
    { id: 'policy', label: 'Policy Document', icon: '📋' },
    { id: 'correspondence', label: 'Legal Correspondence', icon: '✉️' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      // Simulate AI document generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generatedDocument: AIDocumentGenerationResponse = {
        title: `AI Generated ${documentTypes.find(t => t.id === documentType)?.label}`,
        content: `This is an AI-generated document based on your prompt: "${prompt}"\n\nDocument Type: ${documentType}\n\nGenerated content would appear here with professional formatting and structure appropriate for a ${documentType}.`,
        metadata: {
          templateType: documentType,
          model: 'GPT-4-Legal',
          generatedAt: new Date().toISOString(),
          processingTime: 2000,
          confidenceScore: 0.95
        }
      };

      onDocumentGenerated?.(generatedDocument);
      setPrompt('');
    } catch (error) {
      console.error('Failed to generate document:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Sparkles className="h-6 w-6 text-indigo-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">AI Document Generator</h2>
      </div>

      <div className="space-y-4">
        {/* Document Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {documentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setDocumentType(type.id)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  documentType === type.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-lg mb-1">{type.icon}</div>
                <div className="text-xs font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the document you want to generate... (e.g., 'Create a software licensing agreement for a SaaS product with annual billing')"
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
              !prompt.trim() || isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generate Document
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">AI Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-indigo-600" />
            <span>Professional formatting</span>
          </div>
          <div className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
            <span>Context-aware content</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-indigo-600" />
            <span>Generated in seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDocumentGenerator;