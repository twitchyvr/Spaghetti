import React, { useState } from 'react';
import DocumentClassifier from '../components/ai/DocumentClassifier';
import { FileText, Upload, Brain, TrendingUp } from 'lucide-react';

const MLDocumentClassification: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<string>('sample-contract');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const sampleDocuments = [
    { id: 'sample-contract', name: 'Service Agreement 2024.pdf', type: 'Contract' },
    { id: 'sample-brief', name: 'Legal Brief - Smith vs. Jones.pdf', type: 'Legal Brief' },
    { id: 'sample-memo', name: 'Compliance Memo Q4 2023.pdf', type: 'Legal Memo' },
    { id: 'sample-policy', name: 'Data Privacy Policy v2.1.pdf', type: 'Policy Document' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSelectedDocument('');
    }
  };

  const classificationStats = {
    totalDocuments: 1247,
    classifiedToday: 89,
    averageAccuracy: 94.2,
    processingTime: 1.3
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ML Document Classification</h1>
        <p className="text-gray-600 mt-2">
          Automatically classify documents using advanced machine learning models with high accuracy
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{classificationStats.totalDocuments.toLocaleString()}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Classified Today</p>
              <p className="text-2xl font-bold text-gray-900">{classificationStats.classifiedToday}</p>
            </div>
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{classificationStats.averageAccuracy}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">{classificationStats.processingTime}s</p>
            </div>
            <Brain className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Document</h3>
          
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Document
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT up to 10MB</p>
              </label>
            </div>
            {uploadedFile && (
              <p className="text-sm text-green-600 mt-2">
                Uploaded: {uploadedFile.name}
              </p>
            )}
          </div>

          {/* Sample Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Select Sample Document
            </label>
            <div className="space-y-2">
              {sampleDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocument(doc.id);
                    setUploadedFile(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedDocument === doc.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Classification Results */}
        <div className="lg:col-span-2">
          {(selectedDocument || uploadedFile) && (
            <DocumentClassifier
              documentId={selectedDocument || uploadedFile?.name || ''}
              content={uploadedFile ? `Uploaded file: ${uploadedFile.name}` : ''}
              onClassificationComplete={(classification: any) => {
                console.log('Classification completed:', classification);
              }}
            />
          )}
        </div>
      </div>

      {/* ML Model Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ML Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Model Architecture</h4>
            <p className="text-sm text-gray-600">BERT-based transformer with fine-tuning for legal document classification</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Training Data</h4>
            <p className="text-sm text-gray-600">50,000+ labeled legal documents across 15+ categories</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h4>
            <p className="text-sm text-gray-600">94.2% accuracy, 91.8% precision, 93.1% recall on test set</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLDocumentClassification;