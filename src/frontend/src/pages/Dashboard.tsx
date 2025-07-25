import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard.css';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  Activity,
  Target
} from 'lucide-react';

interface DashboardStats {
  totalDocuments: number;
  recentDocuments: number;
  activeProjects: number;
  teamMembers: number;
}

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats] = useState<DashboardStats>({
    totalDocuments: 247,
    recentDocuments: 12,
    activeProjects: 8,
    teamMembers: 15
  });
  
  const [metrics] = useState<MetricCard[]>([
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: '$284,590',
      change: 12.5,
      changeType: 'positive',
      icon: <DollarSign size={24} />,
      color: 'success'
    },
    {
      id: 'documents',
      title: 'Total Documents',
      value: '1,247',
      change: 18.2,
      changeType: 'positive',
      icon: <FileText size={24} />,
      color: 'primary'
    },
    {
      id: 'efficiency',
      title: 'Process Efficiency',
      value: '94.2%',
      change: 5.1,
      changeType: 'positive',
      icon: <Activity size={24} />,
      color: 'warning'
    },
    {
      id: 'response',
      title: 'Avg Response Time',
      value: '1.2s',
      change: -15.2,
      changeType: 'positive',
      icon: <Clock size={24} />,
      color: 'info'
    }
  ]);

  const formatChange = (change: number, type: 'positive' | 'negative' | 'neutral') => {
    const Icon = change > 0 ? ArrowUpRight : ArrowDownRight;
    const colorClass = type === 'positive' ? 'metric-change-positive' : 
                      type === 'negative' ? 'metric-change-negative' : 'metric-change-neutral';
    
    return (
      <div className={`metric-change ${colorClass}`}>
        <Icon size={16} />
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <section className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Welcome back, {user?.firstName || 'User'}</h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your documents today.
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">
              <Download size={20} />
              Export Report
            </button>
            <button className="btn btn-primary">
              <Plus size={20} />
              New Document
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="metrics-section">
        <div className="grid md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="metric-card card">
              <div className="metric-header">
                <div className={`metric-icon metric-icon-${metric.color}`}>
                  {metric.icon}
                </div>
                {formatChange(metric.change, metric.changeType)}
              </div>
              <div className="metric-content">
                <h3 className="metric-value">{metric.value}</h3>
                <p className="metric-title">{metric.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="stats-section">
        <h2 className="section-title">Quick Stats</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4">
          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.totalDocuments}</p>
              <p className="stat-label">Total Documents</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.recentDocuments}</p>
              <p className="stat-label">Recent Documents</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.activeProjects}</p>
              <p className="stat-label">Active Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.teamMembers}</p>
              <p className="stat-label">Team Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="activity-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list card">
          <div className="activity-item">
            <div className="activity-icon">
              <FileText size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-title">Contract Template Updated</p>
              <p className="activity-time">2 minutes ago</p>
            </div>
            <span className="status-indicator status-success">Completed</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <Users size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-title">New team member added</p>
              <p className="activity-time">1 hour ago</p>
            </div>
            <span className="status-indicator status-info">Info</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <TrendingUp size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-title">Monthly report generated</p>
              <p className="activity-time">3 hours ago</p>
            </div>
            <span className="status-indicator status-success">Success</span>
          </div>
        </div>
      </section>
    </div>
  );
}