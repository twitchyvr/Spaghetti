import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Download,
  RefreshCw,
  Target
} from 'lucide-react';
import {
  CustomerMetricsChart,
  CohortRetentionChart,
  TierDistributionChart,
  KPICard,
  ChartDataPoint,
  PieDataPoint
} from '../charts/AnalyticsCharts';

interface CustomerAnalyticsProps {
  className?: string;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomersThisPeriod: number;
  churnedCustomersThisPeriod: number;
  customerGrowthRate: number;
  churnRate: number;
  retentionRate: number;
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  conversionRate: number;
  upgradeRate: number;
  tierDistribution: {
    trialCustomers: number;
    professionalCustomers: number;
    enterpriseCustomers: number;
    customCustomers: number;
  };
}

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ className = "" }) => {
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockMetrics: CustomerMetrics = {
    totalCustomers: 247,
    newCustomersThisPeriod: 28,
    churnedCustomersThisPeriod: 3,
    customerGrowthRate: 12.8,
    churnRate: 1.2,
    retentionRate: 98.8,
    customerLifetimeValue: 45600,
    customerAcquisitionCost: 1250,
    conversionRate: 24.5,
    upgradeRate: 18.7,
    tierDistribution: {
      trialCustomers: 45,
      professionalCustomers: 128,
      enterpriseCustomers: 67,
      customCustomers: 7
    }
  };

  const mockCustomerTrend = [
    { date: '2024-01', total: 189, new: 15, churned: 2 },
    { date: '2024-02', total: 203, new: 16, churned: 2 },
    { date: '2024-03', total: 218, new: 17, churned: 2 },
    { date: '2024-04', total: 231, new: 15, churned: 2 },
    { date: '2024-05', total: 242, new: 13, churned: 2 },
    { date: '2024-06', total: 251, new: 12, churned: 3 },
    { date: '2024-07', total: 247, new: 28, churned: 3 }
  ];

  const mockTierDistribution: PieDataPoint[] = [
    { name: 'Professional', value: 128, color: '#2563eb' },
    { name: 'Enterprise', value: 67, color: '#10b981' },
    { name: 'Trial', value: 45, color: '#f59e0b' },
    { name: 'Custom', value: 7, color: '#8b5cf6' }
  ];

  const mockCohortData = [
    { cohort: '2024-01', period0: 100, period1: 85, period3: 78, period6: 72, period12: 68 },
    { cohort: '2024-02', period0: 100, period1: 88, period3: 82, period6: 76, period12: 71 },
    { cohort: '2024-03', period0: 100, period1: 91, period3: 85, period6: 79, period12: 74 },
    { cohort: '2024-04', period0: 100, period1: 89, period3: 83, period6: 78, period12: 72 },
    { cohort: '2024-05', period0: 100, period1: 92, period3: 87, period6: 81, period12: 76 },
    { cohort: '2024-06', period0: 100, period1: 94, period3: 89, period6: 84, period12: 78 },
    { cohort: '2024-07', period0: 100, period1: 96, period3: 91, period6: 86, period12: 81 }
  ];

  const acquisitionTrend: ChartDataPoint[] = [
    { date: '2024-01', value: 15 },
    { date: '2024-02', value: 16 },
    { date: '2024-03', value: 17 },
    { date: '2024-04', value: 15 },
    { date: '2024-05', value: 13 },
    { date: '2024-06', value: 12 },
    { date: '2024-07', value: 28 }
  ];

  useEffect(() => {
    fetchCustomerMetrics();
  }, [timeRange]);

  const fetchCustomerMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/platform-admin/analytics/customers?timeRange=${timeRange}`);
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetrics(mockMetrics);
    } catch (err) {
      console.error('Failed to fetch customer metrics:', err);
      setError('Failed to load customer metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // Generate CSV export of customer analytics data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Customers', metrics.totalCustomers.toString()],
      ['New Customers This Period', metrics.newCustomersThisPeriod.toString()],
      ['Churned Customers This Period', metrics.churnedCustomersThisPeriod.toString()],
      ['Customer Growth Rate', `${metrics.customerGrowthRate}%`],
      ['Churn Rate', `${metrics.churnRate}%`],
      ['Retention Rate', `${metrics.retentionRate}%`],
      ['Customer LTV', `$${metrics.customerLifetimeValue.toLocaleString()}`],
      ['Export Date', new Date().toISOString()]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-analytics-${new Date().toISOString().split('T')[0]}.csv`;
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
              <Users className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Failed to Load Customer Analytics</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchCustomerMetrics}
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
          <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
          <p className="text-gray-600">Customer acquisition, retention, and lifecycle metrics</p>
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
            onClick={fetchCustomerMetrics}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          change={metrics.customerGrowthRate}
          changeType="positive"
          icon={<Users size={24} />}
          trend={acquisitionTrend}
        />
        
        <KPICard
          title="New Customers"
          value={metrics.newCustomersThisPeriod}
          change={15.3}
          changeType="positive"
          icon={<UserPlus size={24} />}
        />
        
        <KPICard
          title="Churn Rate"
          value={`${metrics.churnRate.toFixed(1)}%`}
          change={-0.3}
          changeType="positive"
          icon={<UserMinus size={24} />}
        />
        
        <KPICard
          title="Customer LTV"
          value={`$${(metrics.customerLifetimeValue / 1000).toFixed(0)}K`}
          change={8.2}
          changeType="positive"
          icon={<Target size={24} />}
        />
      </div>

      {/* Customer Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerMetricsChart
          data={mockCustomerTrend}
          title="Customer Growth Trend"
        />
        
        <TierDistributionChart
          data={mockTierDistribution}
          title="Customers by Tier"
        />
      </div>

      {/* Customer Lifecycle Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Trial Signups</span>
              <span className="font-semibold text-blue-600">142</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-green-600">{metrics.conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">CAC</span>
              <span className="font-semibold text-blue-600">${metrics.customerAcquisitionCost}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">LTV:CAC Ratio</span>
              <span className="font-semibold text-green-600">
                {(metrics.customerLifetimeValue / metrics.customerAcquisitionCost).toFixed(1)}:1
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retention Rate</span>
              <span className="font-semibold text-green-600">{metrics.retentionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Churn Rate</span>
              <span className="font-semibold text-red-600">{metrics.churnRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Lifespan</span>
              <span className="font-semibold text-blue-600">36 months</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">At-Risk Customers</span>
              <span className="font-semibold text-yellow-600">12</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expansion Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Upgrade Rate</span>
              <span className="font-semibold text-green-600">{metrics.upgradeRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cross-sell Rate</span>
              <span className="font-semibold text-blue-600">12.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expansion Revenue</span>
              <span className="font-semibold text-green-600">$23.4K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Net Expansion</span>
              <span className="font-semibold text-green-600">118%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Retention Analysis */}
      <CohortRetentionChart
        data={mockCohortData}
        title="Customer Cohort Retention Analysis"
        height={400}
      />

      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customer Segments</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Enterprise Legal Firms</p>
                <p className="text-sm text-blue-600">High retention, low churn</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-900">67 customers</p>
                <p className="text-sm text-blue-600">$2.1M ARR</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Tech Startups</p>
                <p className="text-sm text-green-600">High growth potential</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-900">128 customers</p>
                <p className="text-sm text-green-600">$890K ARR</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-900">Trial Users</p>
                <p className="text-sm text-yellow-600">Conversion opportunity</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-yellow-900">45 customers</p>
                <p className="text-sm text-yellow-600">24.5% conv. rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 text-sm font-medium">
              View Customer Health Scores
            </button>
            <button className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 text-sm font-medium">
              Launch Retention Campaign
            </button>
            <button className="w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100 text-sm font-medium">
              Configure Churn Alerts
            </button>
            <button className="w-full bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg hover:bg-yellow-100 text-sm font-medium">
              Review At-Risk Accounts
            </button>
            <button className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 text-sm font-medium">
              Export Customer Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};