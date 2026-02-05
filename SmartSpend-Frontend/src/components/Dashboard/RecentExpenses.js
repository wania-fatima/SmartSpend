import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../utils/currency';

const RecentExpenses = ({ expenses }) => {
  const { format } = useCurrency();
  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>No recent expenses found.</p>
        <Link to="/expenses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Add Your First Expense
        </Link>
      </div>
    );
  }

  return (
    <div className="expenses-list">
      {expenses.map(expense => (
        <div key={expense._id} className="expense-card">
          <div className="expense-info">
            <div className="expense-main">
              <h3>{expense.description}</h3>
              <span className="expense-category">{expense.category}</span>
            </div>
            <div className="expense-details">
              <span className="expense-amount">{format(expense.amount)}</span>
              <span className="expense-date">
                {new Date(expense.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {expenses.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/expenses" className="btn btn-secondary">
            View All Expenses
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;