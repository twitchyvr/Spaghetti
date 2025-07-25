import React, { useMemo } from 'react';
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
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, HelpTooltip } from '../ui/Tooltip';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  date?: string;
  percentage?: number;
  change?: number;
  additional?: { [key: string]: any };
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'area' | 'bar' | 'pie';
  title: string;
  description?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showExport?: boolean;
  dataKey?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  formatValue?: (value: any) => string;
  className?: string;
  helpText?: string;
  metricType?: 'documents' | 'users' | 'projects' | 'revenue' | 'performance';
}

const PROFESSIONAL_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

const METRIC_CONFIGS = {
  documents: {
    icon: '📄',
    unit: 'docs',
    color: '#3B82F6',
    description: 'Document creation and management metrics'
  },
  users: {
    icon: '👥',
    unit: 'users',
    color: '#10B981',
    description: 'User engagement and activity statistics'
  },
  projects: {
    icon: '🚀',
    unit: 'projects',
    color: '#F59E0B',
    description: 'Project completion and milestone tracking'
  },
  revenue: {
    icon: '💰',
    unit: '$',
    color: '#EF4444',
    description: 'Financial performance and revenue analytics'
  },
  performance: {
    icon: '⚡',
    unit: 'ms',
    color: '#8B5CF6',
    description: 'System performance and response time metrics'
  }
};

// Custom tooltip component for professional appearance
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: any;
    name?: string;
    color?: string;
    payload?: any;
  }>;
  label?: string;
  formatValue?: (value: any) => string;
  metricType?: keyof typeof METRIC_CONFIGS;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  formatValue, 
  metricType 
}) => {
  if (!active || !payload || !payload.length) return null;

  const config = metricType ? METRIC_CONFIGS[metricType] : null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-elevation-3 p-4 max-w-xs">
      <div className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
        {config && <span>{config.icon}</span>}
        <span>{label}</span>
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between space-x-3 mb-1">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name || 'Value'}</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatValue ? formatValue(entry.value) : entry.value}
            {config && ` ${config.unit}`}
          </span>
        </div>
      ))}
      {payload[0]?.payload?.change && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className={`flex items-center space-x-1 text-sm ${
            payload[0].payload.change > 0 ? 'text-success-600' : 
            payload[0].payload.change < 0 ? 'text-error-600' : 'text-gray-600'
          }`}>
            {payload[0].payload.change > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : payload[0].payload.change < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>{Math.abs(payload[0].payload.change)}% vs previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  type,
  title,
  description,
  height = 300,
  colors = PROFESSIONAL_COLORS,
  showLegend = true,
  showGrid = true,
  showExport = true,
  dataKey = 'value',
  xAxisKey = 'name',
  formatValue,
  className = '',
  helpText,
  metricType
}) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  const config = metricType ? METRIC_CONFIGS[metricType] : null;

  // Calculate summary statistics
  const statistics = useMemo(() => {
    if (!data.length) return null;

    const values = data.map(d => d.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calculate trend (comparing first half to second half)
    const midpoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';
    const trendPercentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return {
      total,
      average,
      max,
      min,
      trend,
      trendPercentage,
      dataPoints: values.length
    };
  }, [data]);

  const exportToPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add title and metadata
      pdf.setFontSize(20);
      pdf.text(title, 20, 20);
      
      if (description) {
        pdf.setFontSize(12);
        pdf.text(description, 20, 30);
      }
      
      // Add chart
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
      
      // Add statistics if available
      if (statistics) {
        const statsY = 40 + imgHeight + 20;
        pdf.setFontSize(14);
        pdf.text('Statistics:', 20, statsY);
        
        pdf.setFontSize(10);
        const unit = config?.unit || '';
        pdf.text(`Total: ${formatValue ? formatValue(statistics.total) : statistics.total}${unit}`, 20, statsY + 10);
        pdf.text(`Average: ${formatValue ? formatValue(statistics.average) : statistics.average.toFixed(2)}${unit}`, 20, statsY + 20);
        pdf.text(`Maximum: ${formatValue ? formatValue(statistics.max) : statistics.max}${unit}`, 20, statsY + 30);
        pdf.text(`Minimum: ${formatValue ? formatValue(statistics.min) : statistics.min}${unit}`, 20, statsY + 40);
        pdf.text(`Trend: ${statistics.trend} (${statistics.trendPercentage.toFixed(1)}%)`, 20, statsY + 50);
        pdf.text(`Data Points: ${statistics.dataPoints}`, 20, statsY + 60);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, statsY + 70);
      }
      
      pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-analytics.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const exportToCSV = () => {
    const headers = [xAxisKey, dataKey, 'Category', 'Change %', 'Date'].filter(Boolean);
    const csvData = [
      headers.join(','),
      ...data.map(row => [
        row.name,
        row.value,
        row.category || '',
        row.change || '',
        row.date || new Date().toISOString().split('T')[0]
      ].join(','))
    ];
    
    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    const commonProps = {
      data,
      height,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatValue}
            />
            <RechartsTooltip 
              content={(props: any) => (
                <CustomTooltip 
                  {...props}
                  formatValue={formatValue}
                  metricType={metricType}
                />
              )}
            />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={{ fill: colors[0] || '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0] || '#3B82F6', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatValue}
            />
            <RechartsTooltip 
              content={(props: any) => (
                <CustomTooltip 
                  {...props}
                  formatValue={formatValue}
                  metricType={metricType}
                />
              )}
            />
            {showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={colors[0]} 
              fill={`${colors[0]}20`}
              strokeWidth={2}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatValue}
            />
            <RechartsTooltip 
              content={(props: any) => (
                <CustomTooltip 
                  {...props}
                  formatValue={formatValue}
                  metricType={metricType}
                />
              )}
            />
            {showLegend && <Legend />}
            <Bar 
              dataKey={dataKey} 
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      case 'pie':
        return (
          <PieChart {...commonProps} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              dataKey={dataKey}
              nameKey={xAxisKey}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              content={(props: any) => (
                <CustomTooltip 
                  {...props}
                  formatValue={formatValue}
                  metricType={metricType}
                />
              )}
            />
            {showLegend && <Legend />}
          </PieChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-elevation-2 border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {config && (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" 
                   style={{ backgroundColor: `${config.color}20` }}>
                {config.icon}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {helpText && (
                  <HelpTooltip 
                    content={helpText}
                    title={title}
                    description={helpText}
                    position="top"
                  />
                )}
              </div>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {showExport && (
            <div className="flex items-center space-x-2">
              <Tooltip content="Export to CSV">
                <button
                  onClick={exportToCSV}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="Export to PDF">
                <button
                  onClick={exportToPDF}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
        
        {/* Statistics Summary */}
        {statistics && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatValue ? formatValue(statistics.total) : statistics.total.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatValue ? formatValue(statistics.average) : statistics.average.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Average</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold flex items-center justify-center space-x-1 ${
                statistics.trend === 'up' ? 'text-success-600' : 
                statistics.trend === 'down' ? 'text-error-600' : 'text-gray-600'
              }`}>
                {statistics.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : statistics.trend === 'down' ? (
                  <TrendingDown className="w-5 h-5" />
                ) : (
                  <Minus className="w-5 h-5" />
                )}
                <span>{Math.abs(statistics.trendPercentage).toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-500">Trend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {statistics.dataPoints}
              </div>
              <div className="text-xs text-gray-500">Data Points</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="p-6" ref={chartRef}>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart() || <div className="flex items-center justify-center h-full text-gray-500">No chart available</div>}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;