import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BrainCircuit, 
  FileText, 
  TrendingUp, 
  Zap, 
  Tag,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import { AnalyticsChart } from '../components/charts/AnalyticsChart';

interface DocumentInsight {
  id: string;
  title: string;
  type: 'contract' | 'legal-brief' | 'compliance' | 'analysis';
  insights: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
  readingTime: number;
  complexity: 'low' | 'medium' | 'high';
  lastAnalyzed: string;
}

interface AIMetrics {
  totalDocumentsAnalyzed: number;
  averageProcessingTime: number;
  accuracyScore: number;
  insightsGenerated: number;
  costSavings: number;
  timesSaved: number;
}

const AIAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<DocumentInsight[]>([]);
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalDocumentsAnalyzed: 2847,
    averageProcessingTime: 2.3,
    accuracyScore: 94.8,
    insightsGenerated: 15629,
    costSavings: 245000,
    timesSaved: 1580
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load sample insights
    const sampleInsights: DocumentInsight[] = [
      {
        id: '1',
        title: 'Enterprise Software License Agreement - TechCorp Inc.',
        type: 'contract',
        insights: [
          'Contains unusual termination clause requiring 180-day notice',
          'Liability cap set at $2.5M, significantly higher than standard',
          'Auto-renewal clause may not comply with state regulations'
        ],
        sentiment: 'neutral',
        confidence: 92,
        keywords: ['termination', 'liability', 'renewal', 'compliance'],
        readingTime: 45,
        complexity: 'high',
        lastAnalyzed: '2025-08-01T10:30:00Z'
      },
      {
        id: '2',
        title: 'GDPR Compliance Assessment Report Q3 2025',
        type: 'compliance',
        insights: [
          'Data retention policies align with GDPR requirements',
          'Cross-border data transfer mechanisms properly implemented',
          'Subject access request process needs optimization'
        ],
        sentiment: 'positive',
        confidence: 88,
        keywords: ['GDPR', 'data-retention', 'cross-border', 'access-rights'],
        readingTime: 32,
        complexity: 'medium',
        lastAnalyzed: '2025-08-01T09:15:00Z'
      },
      {
        id: '3',
        title: 'Intellectual Property Strategy Analysis',
        type: 'analysis',
        insights: [
          'Patent portfolio shows strong defensive positioning',
          'Trademark filings lag behind market expansion',
          'Trade secret protection protocols require updates'
        ],
        sentiment: 'positive',
        confidence: 95,
        keywords: ['patents', 'trademarks', 'trade-secrets', 'IP-strategy'],
        readingTime: 28,
        complexity: 'high',
        lastAnalyzed: '2025-08-01T08:45:00Z'
      }
    ];
    
    setInsights(sampleInsights);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-4 h-4" />;
      case 'compliance': return <Badge className="w-4 h-4" />;
      case 'analysis': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const processDocument = async () => {
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      const newInsight: DocumentInsight = {
        id: Date.now().toString(),
        title: 'New Document Analysis - M&A Due Diligence Report',
        type: 'analysis',
        insights: [
          'Financial statements show consistent growth trajectory',
          'Legal contingencies within acceptable risk parameters',
          'Integration timeline appears aggressive but achievable'
        ],
        sentiment: 'positive',
        confidence: 91,
        keywords: ['M&A', 'due-diligence', 'financial-analysis', 'integration'],
        readingTime: 52,
        complexity: 'high',
        lastAnalyzed: new Date().toISOString()
      };
      
      setInsights(prev => [newInsight, ...prev]);
      setMetrics(prev => ({
        ...prev,
        totalDocumentsAnalyzed: prev.totalDocumentsAnalyzed + 1,
        insightsGenerated: prev.insightsGenerated + 3
      }));
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Document Intelligence</h1>
              <p className="text-gray-600">Advanced AI-powered document analysis and insights</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={processDocument} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze New Document
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalDocumentsAnalyzed.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.averageProcessingTime}s</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accuracy Score</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.accuracyScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Insights Generated</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.insightsGenerated.toLocaleString()}</p>
                </div>
                <BrainCircuit className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Recent Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">AI Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Performance Metrics</CardTitle>
                  <CardDescription>Real-time AI processing performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart
                    data={[
                      { name: 'Jan', value: 85 },
                      { name: 'Feb', value: 88 },
                      { name: 'Mar', value: 92 },
                      { name: 'Apr', value: 89 },
                      { name: 'May', value: 94 },
                      { name: 'Jun', value: 96 },
                      { name: 'Jul', value: 95 }
                    ]}
                    type="line"
                    title="Accuracy Score Trend"
                    colors={['#3B82F6']}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost & Time Savings</CardTitle>
                  <CardDescription>AI automation impact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Cost Savings</p>
                      <p className="text-2xl font-bold text-green-900">${metrics.costSavings.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Time Saved</p>
                      <p className="text-2xl font-bold text-blue-900">{metrics.timesSaved}hrs</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getTypeIcon(insight.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className={getSentimentColor(insight.sentiment)}>
                                {insight.sentiment}
                              </Badge>
                              <Badge className={getComplexityColor(insight.complexity)}>
                                {insight.complexity} complexity
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{insight.readingTime} min read</p>
                          <p>{new Date(insight.lastAnalyzed).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">AI Insights:</h4>
                        <ul className="space-y-1">
                          {insight.insights.map((item, idx) => (
                            <li key={idx} className="text-gray-700 flex items-start gap-2">
                              <span className="text-blue-600 mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {insight.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Contracts', count: 1247, percentage: 44 },
                      { type: 'Legal Briefs', count: 892, percentage: 31 },
                      { type: 'Compliance', count: 456, percentage: 16 },
                      { type: 'Analysis', count: 252, percentage: 9 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart
                    data={[
                      { name: 'Week 1', value: 2.8 },
                      { name: 'Week 2', value: 2.5 },
                      { name: 'Week 3', value: 2.3 },
                      { name: 'Week 4', value: 2.1 }
                    ]}
                    type="bar"
                    title="Average Processing Time (seconds)"
                    colors={['#10B981']}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Manage AI processing settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-Analysis</h4>
                      <p className="text-sm text-gray-600">Automatically analyze new documents</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Insight Notifications</h4>
                      <p className="text-sm text-gray-600">Get notified of critical insights</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Processing Priority</h4>
                      <p className="text-sm text-gray-600">Set analysis priority level</p>
                    </div>
                    <Button variant="outline" size="sm">
                      High
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAnalytics;