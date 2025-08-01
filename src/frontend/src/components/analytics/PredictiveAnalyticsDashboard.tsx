import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Users, FileText, AlertTriangle, CheckCircle, BarChart3, Brain } from 'lucide-react';

interface PredictiveMetrics {
  documentCompletionPrediction: {
    averageDays: number;
    confidence: number;
    factors: string[];
  };
  resourceUtilization: {
    currentCapacity: number;
    predictedPeak: number;
    recommendedScaling: string;
  };
  userBehaviorInsights: {
    mostActiveHours: string;
    preferredDocumentTypes: string[];
    collaborationPatterns: string;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
}

interface TrendData {
  date: string;
  documents: number;
  users: number;
  completion: number;
}

const PredictiveAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PredictiveMetrics | null>(null);
  const [, setTrendData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadPredictiveAnalytics();
  }, [selectedTimeframe]);

  const loadPredictiveAnalytics = async () => {
    setIsLoading(true);
    
    // Simulate ML model prediction processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock predictive analytics data
    const mockMetrics: PredictiveMetrics = {
      documentCompletionPrediction: {
        averageDays: 3.2,
        confidence: 0.87,
        factors: ['Document complexity', 'Team availability', 'Review cycles', 'External dependencies']
      },
      resourceUtilization: {
        currentCapacity: 72,
        predictedPeak: 89,
        recommendedScaling: 'Add 2 additional team members by next week'
      },
      userBehaviorInsights: {
        mostActiveHours: '9 AM - 11 AM, 2 PM - 4 PM',
        preferredDocumentTypes: ['Legal Contracts', 'Policy Documents', 'Legal Briefs'],
        collaborationPatterns: 'Peak collaboration occurs on Tuesdays and Wednesdays'
      },
      riskAssessment: {
        level: 'medium',
        factors: ['Increased document volume', 'Vacation schedule conflicts', 'New compliance requirements'],
        mitigation: ['Enable overtime authorization', 'Cross-train team members', 'Update compliance templates']
      }
    };

    // Mock trend data
    const mockTrendData: TrendData[] = [
      { date: '2025-07-01', documents: 45, users: 23, completion: 78 },
      { date: '2025-07-02', documents: 52, users: 27, completion: 82 },
      { date: '2025-07-03', documents: 48, users: 25, completion: 75 },
      { date: '2025-07-04', documents: 38, users: 19, completion: 88 },
      { date: '2025-07-05', documents: 61, users: 32, completion: 71 },
      { date: '2025-07-06', documents: 55, users: 28, completion: 79 },
      { date: '2025-07-07', documents: 49, users: 26, completion: 84 }
    ];

    setMetrics(mockMetrics);
    setTrendData(mockTrendData);
    setIsLoading(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-5 w-5" />;
      case 'medium': return <AlertTriangle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Brain className="h-8 w-8 text-indigo-600 animate-pulse mr-3" />
          <div className="text-lg text-gray-600">
            Processing predictive analytics with ML models...
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
            <p className="text-gray-600">AI-powered insights and forecasting</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Document Completion Prediction */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {(metrics.documentCompletionPrediction.confidence * 100).toFixed(0)}% confident
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Prediction</h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {metrics.documentCompletionPrediction.averageDays} days
          </div>
          <p className="text-sm text-gray-600">Average completion time</p>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-green-600" />
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {metrics.resourceUtilization.currentCapacity}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Utilization</h3>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {metrics.resourceUtilization.predictedPeak}%
          </div>
          <p className="text-sm text-gray-600">Predicted peak capacity</p>
        </div>

        {/* Document Volume */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-purple-600" />
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Trend</h3>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            +23%
          </div>
          <p className="text-sm text-gray-600">Growth this month</p>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${getRiskColor(metrics.riskAssessment.level)}`}>
              {getRiskIcon(metrics.riskAssessment.level)}
            </div>
            <span className={`text-sm px-2 py-1 rounded-full ${getRiskColor(metrics.riskAssessment.level)}`}>
              {metrics.riskAssessment.level.toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Level</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics.riskAssessment.factors.length}
          </div>
          <p className="text-sm text-gray-600">Active risk factors</p>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Factors */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Completion Time Factors
          </h3>
          <div className="space-y-3">
            {metrics.documentCompletionPrediction.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{factor}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.random() * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Behavior Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            User Behavior Insights
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Most Active Hours:</span>
              <p className="text-sm text-gray-600 mt-1">{metrics.userBehaviorInsights.mostActiveHours}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Preferred Document Types:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {metrics.userBehaviorInsights.preferredDocumentTypes.map((type, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Collaboration Pattern:</span>
              <p className="text-sm text-gray-600 mt-1">{metrics.userBehaviorInsights.collaborationPatterns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment & Mitigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
          Risk Assessment & Mitigation
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Factors:</h4>
            <div className="space-y-2">
              {metrics.riskAssessment.factors.map((factor, index) => (
                <div key={index} className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">{factor}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Actions:</h4>
            <div className="space-y-2">
              {metrics.riskAssessment.mitigation.map((action, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Scaling Recommendation */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6">
        <div className="flex items-start">
          <Brain className="h-6 w-6 text-indigo-600 mr-3 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">AI Recommendation</h3>
            <p className="text-indigo-800 mb-3">{metrics.resourceUtilization.recommendedScaling}</p>
            <div className="flex space-x-3">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Apply Recommendation
              </button>
              <button className="bg-white text-indigo-600 border border-indigo-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;