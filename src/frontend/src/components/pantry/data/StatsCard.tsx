import React from 'react';
import { Card } from '../Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  className = '',
}) => {
  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };
  
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'decrease':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <Card 
      variant="default" 
      padding="lg"
      className={`group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${className}`.trim()}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <div className="text-white">
                  {icon}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {title}
              </p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
          </div>
          
          {change && (
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium border ${getChangeColor(change.type)}`}>
                {getChangeIcon(change.type)}
                <span>{typeof change.value === 'number' ? `${change.value}%` : change.value}</span>
              </div>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};