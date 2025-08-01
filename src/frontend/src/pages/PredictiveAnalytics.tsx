import React from 'react';
import PredictiveAnalyticsDashboard from '../components/analytics/PredictiveAnalyticsDashboard';

const PredictiveAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics</h1>
        <p className="text-gray-600 mt-2">
          AI-powered insights and forecasting for document workflows and resource planning
        </p>
      </div>
      
      <PredictiveAnalyticsDashboard />
    </div>
  );
};

export default PredictiveAnalytics;