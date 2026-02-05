import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../utils/currency';
import ExpenseForm from '../components/Expenses/ExpenseForm';
import ExpenseFilter from '../components/Expenses/ExpenseFilter';

const Expenses = () => {
  const { format } = useCurrency();
  const { 
    expenses, 
    loading, 
    addExpense, 
    updateExpense, 
    deleteExpense 
  } = useExpenses();
  
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const filterExpenses = useCallback(() => {
    let filtered = expenses;

    if (filters.category) {
      filtered = filtered.filter(exp => exp.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(exp => new Date(exp.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(exp => new Date(exp.date) <= new Date(filters.endDate));
    }

    setFilteredExpenses(filtered);
  }, [expenses, filters]);

  useEffect(() => {
    filterExpenses();
  }, [filterExpenses]);

  const handleAddExpense = async (expenseData) => {
    await addExpense(expenseData);
    setShowForm(false);
  };

  const handleEditExpense = async (expenseData) => {
    await updateExpense(editingExpense._id, expenseData);
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

  if (loading) return <div className="loading">Loading expenses...</div>;

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Expense Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <ExpenseFilter 
        filters={filters} 
        setFilters={setFilters}
        categories={categories}
      />

      {(showForm || editingExpense) && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
          onCancel={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
          categories={categories}
        />
      )}

      <div className="expenses-list">
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses found. Add your first expense!</p>
          </div>
        ) : (
          filteredExpenses.map(expense => (
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
              <div className="expense-actions">
                <button 
                  className="btn-icon"
                  onClick={() => setEditingExpense(expense)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon danger"
                  onClick={() => handleDeleteExpense(expense._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Expenses;