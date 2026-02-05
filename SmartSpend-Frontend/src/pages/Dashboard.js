import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { expenseAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ExpenseChart from '../components/Charts/ExpenseChart';
import QuickStats from '../components/Dashboard/QuickStats';
import RecentExpenses from '../components/Dashboard/RecentExpenses';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSpent: 0,
    monthlyBudget: user?.salary || 0,
    expensesThisMonth: 0,
    topCategory: ''
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [navigate, user?.salary]); // Add user?.salary to dependency

  const loadDashboardData = async () => {
    try {
      const [expensesData, statsData] = await Promise.all([
        expenseAPI.getRecentExpenses(),
        expenseAPI.getDashboardStats()
      ]);
      setRecentExpenses(expensesData);
      
      // Use the stats from the API instead of calculating manually
      setStats({
        totalSpent: statsData.totalSpent || 0,
        totalIncome: statsData.totalIncome || 0,
        expensesThisMonth: statsData.expensesThisMonth || 0,
        topCategory: statsData.topCategory || 'N/A',
        remainingBudget: statsData.remainingBudget || 0
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <Link to="/expenses?action=add" className="btn btn-primary">
          <Plus size={20} />
          Add Expense
        </Link>
      </div>

      <QuickStats stats={stats} />
      
      <div className="dashboard-grid">
        <div className="chart-section">
          <h2>Spending Overview</h2>
          <ExpenseChart />
        </div>
        
        <div className="recent-section">
          <h2>Recent Expenses</h2>
          <RecentExpenses expenses={recentExpenses} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;