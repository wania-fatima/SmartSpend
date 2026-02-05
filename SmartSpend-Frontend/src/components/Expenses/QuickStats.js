import React from 'react';
import { TrendingUp, TrendingDown, Target, Award, Wallet } from 'lucide-react';
import { useCurrency } from '../../utils/currency';

const QuickStats = ({ stats }) => {
  const { format } = useCurrency();
  const { totalSpent, expensesThisMonth, topCategory, monthlySalary, remainingBudget } = stats;
  const budgetUsed = monthlySalary ? ((totalSpent / monthlySalary) * 100).toFixed(1) : 0;
  const isOverBudget = remainingBudget !== null && remainingBudget < 0;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{format(monthlySalary || 0)}</div>
        <div className="stat-label">Monthly Salary</div>
        <Wallet size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
      </div>

      <div className="stat-card">
        <div className="stat-value">{format(totalSpent)}</div>
        <div className="stat-label">Total Spent</div>
        <TrendingUp size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
      </div>

      <div className="stat-card">
        <div
          className="stat-value"
          style={{ color: isOverBudget ? 'var(--danger-color)' : 'var(--primary-color)' }}
        >
          {budgetUsed}%
        </div>
        <div className="stat-label">Budget Used</div>
        {isOverBudget ? (
          <TrendingUp size={20} color="var(--danger-color)" style={{ marginTop: '0.5rem' }} />
        ) : (
          <TrendingDown size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
        )}
      </div>

      <div className="stat-card">
        <div className="stat-value">{topCategory || '-'}</div>
        <div className="stat-label">Top Category</div>
        <Award size={20} color="var(--warning-color)" style={{ marginTop: '0.5rem' }} />
      </div>

      {remainingBudget !== null && (
        <div className="stat-card">
          <div
            className="stat-value"
            style={{ color: remainingBudget < 0 ? 'var(--danger-color)' : 'var(--primary-color)' }}
          >
            {format(remainingBudget)}
          </div>
          <div className="stat-label">Remaining Budget</div>
          {remainingBudget < 0 ? (
            <TrendingUp size={20} color="var(--danger-color)" style={{ marginTop: '0.5rem' }} />
          ) : (
            <TrendingDown size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
          )}
        </div>
      )}
    </div>
  );
};

export default QuickStats;
