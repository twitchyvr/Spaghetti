import React from 'react';
import { Card } from '../Card';

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
  const changeColorClasses = {
    increase: 'text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50',
    decrease: 'text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50',
    neutral: 'text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/50',
  };
  
  return (
    <Card className={`hover:scale-105 ${className}`.trim()}>
      <div className="text-center space-y-6">
        {icon && (
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-4xl font-light text-gray-900 tracking-tight">
            {value}
          </p>
          
          {change && (
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                  changeColorClasses[change.type]
                }`}
              >
                {change.type === 'increase' && '↗'}
                {change.type === 'decrease' && '↘'}
                {change.type === 'neutral' && '→'}
                {change.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};