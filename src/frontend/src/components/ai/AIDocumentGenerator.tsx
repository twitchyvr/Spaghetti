import React, { useState, useEffect } from 'react';
import { 
  AIModel, 
  DocumentTemplate, 
  TemplateParameter, 
  AIGenerationProgress,
  AIDocumentGenerationResponse 
} from '../../types';
import { aiApi } from '../../services/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AIDocumentGeneratorProps {
  onDocumentGenerated?: (document: AIDocumentGenerationResponse) => void;
  className?: string;
}

export const AIDocumentGenerator: React.FC<AIDocumentGeneratorProps> = ({
  onDocumentGenerated,
  className = ''
}) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [templateParameters, setTemplateParameters] = useState<Record<string, unknown>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<AIGenerationProgress | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<AIDocumentGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  // Mock templates for demo - in real app these would come from backend
  const mockTemplates: DocumentTemplate[] = [
    {
      id: 'legal-contract',
      name: 'Legal Contract',
      description: 'Generate professional legal contracts with customizable terms and conditions',
      category: 'legal',
      templateType: 'legal-contract',
      parameters: [
        {
          name: 'contractType',
          label: 'Contract Type',
          type: 'select',
          required: true,
          options: [
            { label: 'Service Agreement', value: 'service' },
            { label: 'Employment Contract', value: 'employment' },
            { label: 'Non-Disclosure Agreement', value: 'nda' },
            { label: 'Partnership Agreement', value: 'partnership' }
          ]
        },
        {
          name: 'partyA',
          label: 'First Party Name',
          type: 'text',
          required: true,
          description: 'Name of the first contracting party'
        },
        {
          name: 'partyB',
          label: 'Second Party Name',
          type: 'text',
          required: true,
          description: 'Name of the second contracting party'
        },
        {
          name: 'contractValue',
          label: 'Contract Value',
          type: 'number',
          required: false,
          description: 'Total contract value in dollars'
        },
        {
          name: 'duration',
          label: 'Contract Duration',
          type: 'text',
          required: false,
          description: 'Length of the contract (e.g., "12 months", "2 years")'
        },
        {
          name: 'specialTerms',
          label: 'Special Terms',
          type: 'textarea',
          required: false,
          description: 'Any special terms or conditions to include'
        }
      ],
      icon: '⚖️'
    },
    {
      id: 'business-proposal',
      name: 'Business Proposal',
      description: 'Create compelling business proposals for projects, partnerships, or services',
      category: 'business',
      templateType: 'business-proposal',
      parameters: [
        {
          name: 'proposalType',
          label: 'Proposal Type',
          type: 'select',
          required: true,
          options: [
            { label: 'Project Proposal', value: 'project' },
            { label: 'Service Proposal', value: 'service' },
            { label: 'Partnership Proposal', value: 'partnership' },
            { label: 'Investment Proposal', value: 'investment' }
          ]
        },
        {
          name: 'companyName',
          label: 'Your Company Name',
          type: 'text',
          required: true
        },
        {
          name: 'clientName',
          label: 'Client/Recipient Name',
          type: 'text',
          required: true
        },
        {
          name: 'projectTitle',
          label: 'Project/Service Title',
          type: 'text',
          required: true
        },
        {
          name: 'budget',
          label: 'Proposed Budget',
          type: 'number',
          required: false,
          description: 'Budget in dollars'
        },
        {
          name: 'timeline',
          label: 'Timeline',
          type: 'text',
          required: false,
          description: 'Project timeline (e.g., "3 months", "Q2 2024")'
        },
        {
          name: 'objectives',
          label: 'Key Objectives',
          type: 'textarea',
          required: true,
          description: 'Main goals and objectives of the proposal'
        }
      ],
      icon: '📋'
    },
    {
      id: 'technical-spec',
      name: 'Technical Specification',
      description: 'Generate detailed technical specifications for software projects',
      category: 'technical',
      templateType: 'technical-spec',
      parameters: [
        {
          name: 'projectName',
          label: 'Project Name',
          type: 'text',
          required: true
        },
        {
          name: 'projectType',
          label: 'Project Type',
          type: 'select',
          required: true,
          options: [
            { label: 'Web Application', value: 'web-app' },
            { label: 'Mobile Application', value: 'mobile-app' },
            { label: 'API/Backend Service', value: 'api' },
            { label: 'Desktop Application', value: 'desktop' },
            { label: 'Integration Project', value: 'integration' }
          ]
        },
        {
          name: 'technologies',
          label: 'Technologies',
          type: 'text',
          required: false,
          description: 'Technologies to be used (e.g., React, Node.js, PostgreSQL)'
        },
        {
          name: 'requirements',
          label: 'Key Requirements',
          type: 'textarea',
          required: true,
          description: 'Main functional and non-functional requirements'
        },
        {
          name: 'scalability',
          label: 'Scalability Requirements',
          type: 'textarea',
          required: false,
          description: 'Expected load and scalability requirements'
        }
      ],
      icon: '⚙️'
    }
  ];

  useEffect(() => {
    loadModels();
    setTemplates(mockTemplates);
  }, []);

  const loadModels = async () => {
    try {
      setIsLoadingModels(true);
      const availableModels = await aiApi.getModels();
      setModels(availableModels);
      
      // Select first available model by default
      const defaultModel = availableModels.find(m => m.isAvailable);
      if (defaultModel) {
        setSelectedModel(defaultModel.id);
      }
    } catch (err) {
      console.error('Failed to load AI models:', err);
      setError('Failed to load AI models. Using demo mode.');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setTemplateParameters({});
    setGeneratedDocument(null);
    setError(null);
  };

  const handleParameterChange = (paramName: string, value: unknown) => {
    setTemplateParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const validateParameters = (): boolean => {
    if (!selectedTemplate) return false;
    
    for (const param of selectedTemplate.parameters) {
      if (param.required && !templateParameters[param.name]) {
        setError(`${param.label} is required`);
        return false;
      }
    }
    return true;
  };

  const generateDocument = async () => {
    if (!selectedTemplate || !selectedModel) return;
    
    if (!validateParameters()) return;

    try {
      setIsGenerating(true);
      setError(null);
      setProgress({
        stage: 'initializing',
        progress: 0,
        message: 'Initializing document generation...'
      });

      // Simulate progress updates
      setTimeout(() => {
        setProgress({
          stage: 'processing',
          progress: 25,
          message: 'Processing template parameters...'
        });
      }, 500);

      setTimeout(() => {
        setProgress({
          stage: 'generating',
          progress: 50,  
          message: 'Generating document content...'
        });
      }, 1000);

      setTimeout(() => {
        setProgress({
          stage: 'finalizing',
          progress: 75,
          message: 'Finalizing document...'
        });
      }, 1500);

      const result = await aiApi.generateDocument({
        templateType: selectedTemplate.templateType,
        parameters: templateParameters,
        model: selectedModel
      });

      setProgress({
        stage: 'completed',
        progress: 100,
        message: 'Document generated successfully!'
      });

      setGeneratedDocument(result);
      onDocumentGenerated?.(result);

    } catch (err) {
      console.error('Document generation failed:', err);
      setError('Failed to generate document. Please try again.');
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Generation failed',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
      // Clear progress after a delay
      setTimeout(() => setProgress(null), 3000);
    }
  };

  const renderParameterInput = (param: TemplateParameter) => {
    const value = templateParameters[param.name] || param.defaultValue || '';
    
    switch (param.type) {
      case 'text':
        return (
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={value as string}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.description}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            rows={4}
            value={value as string}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.description}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={value as number}
            onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value))}
            placeholder={param.description}
          />
        );
      
      case 'select':
        return (
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={value as string}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
          >
            <option value="">Select {param.label}</option>
            {param.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <input
            type="checkbox"
            className="rounded focus:ring-2 focus:ring-blue-500"
            checked={value as boolean}
            onChange={(e) => handleParameterChange(param.name, e.target.checked)}
          />
        );
      
      default:
        return null;
    }
  };

  if (isLoadingModels) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading AI models...</span>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            AI Document Generator
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Generate professional documents using AI-powered templates
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="">Select AI Model</option>
              {models.filter(m => m.isAvailable).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.provider} (Max: {model.maxTokens.toLocaleString()} tokens)
                </option>
              ))}
            </select>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Document Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{template.icon}</span>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    {template.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Template Parameters */}
          {selectedTemplate && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Template Parameters
              </h3>
              <div className="space-y-4">
                {selectedTemplate.parameters.map(param => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {param.label}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderParameterInput(param)}
                    {param.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {param.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={generateDocument}
              disabled={!selectedTemplate || !selectedModel || isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Generating...</span>
                </>
              ) : (
                'Generate Document'
              )}
            </button>
          </div>

          {/* Progress Display */}
          {progress && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress.message}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {progress.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.stage === 'error' ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              {progress.error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {progress.error}
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Generated Document Preview */}
          {generatedDocument && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Generated Document
              </h3>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {generatedDocument.title}
                </h4>
                <div className="max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {generatedDocument.content}
                  </pre>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Generated using {generatedDocument.metadata.model} 
                  (Confidence: {Math.round(generatedDocument.metadata.confidenceScore * 100)}%)
                </span>
                <span>
                  Processing time: {generatedDocument.metadata.processingTime}s
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDocumentGenerator;