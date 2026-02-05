import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react';

const AnalyticsSummary = ({ summary }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">${summary.avgMonthlySpend || '0'}</div>
        <div className="stat-label">Avg Monthly Spend</div>
        <DollarSign size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
      </div>
      
      <div className="stat-card">
        <div className="stat-value">{summary.topCategory || 'N/A'}</div>
        <div className="stat-label">Top Spending Category</div>
        <Target size={20} color="var(--accent-color)" style={{ marginTop: '0.5rem' }} />
      </div>
      
      <div className="stat-card">
        <div 
          className="stat-value"
          style={{ color: summary.trend > 0 ? 'var(--danger-color)' : 'var(--primary-color)' }}
        >
          ${Math.abs(summary.trend || 0)}
        </div>
        <div className="stat-label">Monthly Trend</div>
        {summary.trend > 0 ? (
          <TrendingUp size={20} color="var(--danger-color)" style={{ marginTop: '0.5rem' }} />
        ) : (
          <TrendingDown size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
        )}
      </div>
      
      <div className="stat-card">
        <div 
          className="stat-value"
          style={{ color: summary.trend > 0 ? 'var(--danger-color)' : summary.trend < 0 ? 'var(--success-color)' : 'var(--muted)' }}
        >
          {summary.trend > 0 ? '↑ Increasing' : summary.trend < 0 ? '↓ Decreasing' : '→ Stable'}
        </div>
        <div className="stat-label">Spending Trend</div>
        {summary.trend > 0 ? (
          <TrendingUp size={20} color="var(--danger-color)" style={{ marginTop: '0.5rem' }} />
        ) : summary.trend < 0 ? (
          <TrendingDown size={20} color="var(--success-color)" style={{ marginTop: '0.5rem' }} />
        ) : (
          <Activity size={20} color="var(--muted)" style={{ marginTop: '0.5rem' }} />
        )}
      </div>
    </div>
  );
};

export default AnalyticsSummary;