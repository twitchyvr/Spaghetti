import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface BarDataPoint {
  name: string;
  value: number;
  category?: string;
}

// Color palette for consistent chart styling
export const CHART_COLORS = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  secondary: '#6b7280'
};

export const PIE_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', 
  '#06b6d4', '#8b5cf6', '#ec4899', '#84cc16'
];

interface BaseChartProps {
  title?: string;
  height?: number;
  className?: string;
}

// Revenue Trend Line Chart
interface RevenueTrendChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  showGrowth?: boolean;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data,
  title = "Revenue Trend",
  height = 300,
  showGrowth = false,
  className = ""
}) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          labelStyle={{ color: '#374151' }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.primary}
          strokeWidth={3}
          dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: CHART_COLORS.primary, strokeWidth: 2 }}
        />
        {showGrowth && (
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.primary}
            fill={`${CHART_COLORS.primary}20`}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Customer Metrics Area Chart
interface CustomerMetricsChartProps extends BaseChartProps {
  data: Array<{
    date: string;
    total: number;
    new: number;
    churned: number;
  }>;
}

export const CustomerMetricsChart: React.FC<CustomerMetricsChartProps> = ({
  data,
  title = "Customer Metrics",
  height = 300,
  className = ""
}) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="total"
          stackId="1"
          stroke={CHART_COLORS.primary}
          fill={CHART_COLORS.primary}
          name="Total Customers"
        />
        <Area
          type="monotone"
          dataKey="new"
          stackId="2"
          stroke={CHART_COLORS.success}
          fill={CHART_COLORS.success}
          name="New Customers"
        />
        <Area
          type="monotone"
          dataKey="churned"
          stackId="3"
          stroke={CHART_COLORS.danger}
          fill={CHART_COLORS.danger}
          name="Churned"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Tier Distribution Pie Chart
interface TierDistributionChartProps extends BaseChartProps {
  data: PieDataPoint[];
}

export const TierDistributionChart: React.FC<TierDistributionChartProps> = ({
  data,
  title = "Revenue by Tier",
  height = 300,
  className = ""
}) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Usage Analytics Bar Chart
interface UsageAnalyticsChartProps extends BaseChartProps {
  data: BarDataPoint[];
}

export const UsageAnalyticsChart: React.FC<UsageAnalyticsChartProps> = ({
  data,
  title = "Platform Usage",
  height = 300,
  className = ""
}) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value: number) => [value.toLocaleString(), 'Count']}
        />
        <Bar 
          dataKey="value" 
          fill={CHART_COLORS.info}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Cohort Retention Heatmap (simplified version using bar chart)
interface CohortRetentionChartProps extends BaseChartProps {
  data: Array<{
    cohort: string;
    period0: number;
    period1: number;
    period3: number;
    period6: number;
    period12: number;
  }>;
}

export const CohortRetentionChart: React.FC<CohortRetentionChartProps> = ({
  data,
  title = "Customer Cohort Retention",
  height = 300,
  className = ""
}) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          type="number" 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis 
          type="category" 
          dataKey="cohort" 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value}%`, 'Retention']}
        />
        <Legend />
        <Bar dataKey="period0" stackId="a" fill={PIE_COLORS[0]} name="Month 0" />
        <Bar dataKey="period1" stackId="a" fill={PIE_COLORS[1]} name="Month 1" />
        <Bar dataKey="period3" stackId="a" fill={PIE_COLORS[2]} name="Month 3" />
        <Bar dataKey="period6" stackId="a" fill={PIE_COLORS[3]} name="Month 6" />
        <Bar dataKey="period12" stackId="a" fill={PIE_COLORS[4]} name="Month 12" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Platform Health Status Chart
interface HealthMetricsChartProps extends BaseChartProps {
  data: Array<{
    date: string;
    uptime: number;
    responseTime: number;
  }>;
}

export const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({
  data,
  title = "Platform Health",
  height = 300,
  className = ""
}) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          yAxisId="uptime"
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          domain={[95, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis 
          yAxisId="response"
          orientation="right"
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}ms`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend />
        <Line
          yAxisId="uptime"
          type="monotone"
          dataKey="uptime"
          stroke={CHART_COLORS.success}
          strokeWidth={2}
          name="Uptime %"
        />
        <Line
          yAxisId="response"
          type="monotone"
          dataKey="responseTime"
          stroke={CHART_COLORS.warning}
          strokeWidth={2}
          name="Response Time (ms)"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Forecast Chart with confidence intervals
interface ForecastChartProps extends BaseChartProps {
  data: Array<{
    date: string;
    historical?: number;
    forecast: number;
    upperBound: number;
    lowerBound: number;
  }>;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  title = "Revenue Forecast",
  height = 300,
  className = ""
}) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
        />
        <Legend />
        
        {/* Confidence interval area */}
        <Area
          type="monotone"
          dataKey="upperBound"
          stroke="none"
          fill={`${CHART_COLORS.info}20`}
          fillOpacity={0.5}
        />
        <Area
          type="monotone"
          dataKey="lowerBound"
          stroke="none"
          fill="white"
        />
        
        {/* Historical data */}
        <Line
          type="monotone"
          dataKey="historical"
          stroke={CHART_COLORS.secondary}
          strokeWidth={2}
          dot={false}
          name="Historical"
        />
        
        {/* Forecast line */}
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={CHART_COLORS.primary}
          strokeWidth={3}
          strokeDasharray="5 5"
          dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
          name="Forecast"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Key Performance Indicator Card with Mini Chart
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: ChartDataPoint[];
  icon?: React.ReactNode;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  trend,
  icon,
  className = ""
}) => {
  const changeColor = changeType === 'positive' ? 'text-green-600' : 
                     changeType === 'negative' ? 'text-red-600' : 'text-gray-600';
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${changeColor} flex items-center mt-1`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
              <span className="ml-1 text-xs text-gray-500">vs last period</span>
            </p>
          )}
        </div>
        
        {icon && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-600">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {trend && trend.length > 0 && (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={trend}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};