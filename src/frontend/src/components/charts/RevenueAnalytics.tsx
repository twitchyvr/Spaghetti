import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Download,
  RefreshCw
} from 'lucide-react';
import {
  RevenueTrendChart,
  TierDistributionChart,
  ForecastChart,
  KPICard,
  ChartDataPoint,
  PieDataPoint
} from '../charts/AnalyticsCharts';

interface RevenueAnalyticsProps {
  className?: string;
}

interface RevenueMetrics {
  currentMRR: number;
  currentARR: number;
  mrrGrowthRate: number;
  mrrGrowthAmount: number;
  netRevenueRetention: number;
  customerLifetimeValue: number;
  averageRevenuePerUser: number;
  tierBreakdown: {
    trialRevenue: number;
    professionalRevenue: number;
    enterpriseRevenue: number;
    customRevenue: number;
  };
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({ className = "" }) => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockMetrics: RevenueMetrics = {
    currentMRR: 187450,
    currentARR: 2249400,
    mrrGrowthRate: 12.5,
    mrrGrowthAmount: 20780,
    netRevenueRetention: 118.5,
    customerLifetimeValue: 45600,
    averageRevenuePerUser: 1247,
    tierBreakdown: {
      trialRevenue: 0,
      professionalRevenue: 74980,
      enterpriseRevenue: 112470,
      customRevenue: 0
    }
  };

  const mockRevenueTrend: ChartDataPoint[] = [
    { date: '2024-01', value: 145000 },
    { date: '2024-02', value: 152000 },
    { date: '2024-03', value: 158000 },
    { date: '2024-04', value: 163000 },
    { date: '2024-05', value: 171000 },
    { date: '2024-06', value: 179000 },
    { date: '2024-07', value: 187450 }
  ];

  const mockTierDistribution: PieDataPoint[] = [
    { name: 'Professional', value: 74980, color: '#2563eb' },
    { name: 'Enterprise', value: 112470, color: '#10b981' },
    { name: 'Custom', value: 0, color: '#f59e0b' },
    { name: 'Trial', value: 0, color: '#6b7280' }
  ];

  const mockForecastData = [
    { date: '2024-05', historical: 171000, forecast: 171000, upperBound: 175000, lowerBound: 167000 },
    { date: '2024-06', historical: 179000, forecast: 179000, upperBound: 183000, lowerBound: 175000 },
    { date: '2024-07', historical: 187450, forecast: 187450, upperBound: 192000, lowerBound: 183000 },
    { date: '2024-08', forecast: 197500, upperBound: 207000, lowerBound: 188000 },
    { date: '2024-09', forecast: 208200, upperBound: 220000, lowerBound: 196000 },
    { date: '2024-10', forecast: 219800, upperBound: 234000, lowerBound: 205000 },
    { date: '2024-11', forecast: 232400, upperBound: 249000, lowerBound: 216000 },
    { date: '2024-12', forecast: 246000, upperBound: 265000, lowerBound: 227000 }
  ];

  useEffect(() => {
    fetchRevenueMetrics();
  }, [timeRange]);

  const fetchRevenueMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/platform-admin/analytics/revenue?timeRange=${timeRange}`);
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetrics(mockMetrics);
    } catch (err) {
      console.error('Failed to fetch revenue metrics:', err);
      setError('Failed to load revenue metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // Generate CSV export of revenue analytics data
    const csvData = [
      ['Metric', 'Value'],
      ['Current MRR', `$${metrics.currentMRR.toLocaleString()}`],
      ['Current ARR', `$${metrics.currentARR.toLocaleString()}`],
      ['MRR Growth Rate', `${metrics.mrrGrowthRate}%`],
      ['MRR Growth Amount', `$${metrics.mrrGrowthAmount.toLocaleString()}`],
      ['Net Revenue Retention', `${metrics.netRevenueRetention}%`],
      ['Customer LTV', `$${metrics.customerLifetimeValue.toLocaleString()}`],
      ['ARPU', `$${metrics.averageRevenuePerUser.toLocaleString()}`],
      ['Export Date', new Date().toISOString()]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 rounded-lg h-80"></div>
          <div className="bg-gray-200 rounded-lg h-80"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 rounded-full p-2">
              <Target className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Failed to Load Revenue Analytics</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchRevenueMetrics}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className={`${className} space-y-6`}>
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-gray-600">Comprehensive revenue metrics and forecasting</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          
          <button 
            onClick={handleExportData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          
          <button 
            onClick={fetchRevenueMetrics}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Monthly Recurring Revenue"
          value={`$${(metrics.currentMRR / 1000).toFixed(0)}K`}
          change={metrics.mrrGrowthRate}
          changeType="positive"
          icon={<DollarSign size={24} />}
          trend={mockRevenueTrend}
        />
        
        <KPICard
          title="Annual Recurring Revenue"
          value={`$${(metrics.currentARR / 1000000).toFixed(1)}M`}
          change={metrics.mrrGrowthRate}
          changeType="positive"
          icon={<TrendingUp size={24} />}
        />
        
        <KPICard
          title="Net Revenue Retention"
          value={`${metrics.netRevenueRetention.toFixed(1)}%`}
          change={2.3}
          changeType="positive"
          icon={<Target size={24} />}
        />
        
        <KPICard
          title="Customer Lifetime Value"
          value={`$${(metrics.customerLifetimeValue / 1000).toFixed(0)}K`}
          change={5.7}
          changeType="positive"
          icon={<Users size={24} />}
        />
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart
          data={mockRevenueTrend}
          title="MRR Growth Trend"
          showGrowth={true}
        />
        
        <TierDistributionChart
          data={mockTierDistribution}
          title="Revenue by Customer Tier"
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">MRR Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New MRR</span>
              <span className="font-semibold text-green-600">+$12.4K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expansion MRR</span>
              <span className="font-semibold text-green-600">+$8.3K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Contraction MRR</span>
              <span className="font-semibold text-yellow-600">-$2.1K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Churned MRR</span>
              <span className="font-semibold text-red-600">-$1.8K</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center font-semibold">
              <span className="text-gray-900">Net MRR Growth</span>
              <span className="text-green-600">+${metrics.mrrGrowthAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Ratios</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Net Revenue Retention</span>
              <span className="font-semibold text-blue-600">{metrics.netRevenueRetention}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gross Revenue Retention</span>
              <span className="font-semibold text-blue-600">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ARPU</span>
              <span className="font-semibold text-blue-600">${metrics.averageRevenuePerUser}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">LTV:CAC Ratio</span>
              <span className="font-semibold text-blue-600">9.1:1</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 text-sm font-medium">
              View Revenue Cohorts
            </button>
            <button className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 text-sm font-medium">
              Generate Revenue Report
            </button>
            <button className="w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100 text-sm font-medium">
              Configure Forecasting
            </button>
            <button className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 text-sm font-medium">
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Forecasting */}
      <ForecastChart
        data={mockForecastData}
        title="12-Month Revenue Forecast"
        height={400}
      />
    </div>
  );
};