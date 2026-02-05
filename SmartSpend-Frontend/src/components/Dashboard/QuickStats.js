import React from 'react';
import { TrendingUp, TrendingDown, Award, Wallet } from 'lucide-react';
import { useCurrency } from '../../utils/currency';

const QuickStats = ({ stats }) => {
  const { format } = useCurrency();
  const balance = stats.totalIncome - stats.totalSpent;

  return (
    <div className="stats-grid">
      {/* Total Income */}
      <div className="stat-card">
        <div className="stat-value">{format(stats.totalIncome || 0)}</div>
        <div className="stat-label">Total Income</div>
        <Wallet size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
      </div>

      {/* Total Spent */}
      <div className="stat-card">
        <div className="stat-value">{format(stats.totalSpent)}</div>
        <div className="stat-label">Total Expenses</div>
        <TrendingUp size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
      </div>

      {/* Balance */}
      <div className="stat-card">
        <div 
          className="stat-value"
          style={{ color: balance < 0 ? 'var(--danger-color)' : 'var(--primary-color)' }}
        >
          {format(balance)}
        </div>
        <div className="stat-label">Balance</div>
        {balance < 0 ? (
          <TrendingUp size={20} color="var(--danger-color)" style={{ marginTop: '0.5rem' }} />
        ) : (
          <TrendingDown size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
        )}
      </div>

      {/* Top Category */}
      <div className="stat-card">
        <div className="stat-value">{stats.topCategory}</div>
        <div className="stat-label">Top Category</div>
        <Award size={20} color="var(--warning-color)" style={{ marginTop: '0.5rem' }} />
      </div>
    </div>
  );
};

export default QuickStats;
