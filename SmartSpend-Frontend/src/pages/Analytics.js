import React, { useState, useEffect, useCallback } from 'react';
import { expenseAPI } from '../utils/api';
import { useCurrency } from '../utils/currency';
import CategoryChart from '../components/Charts/CategoryChart';
import MonthlyTrendChart from '../components/Charts/MonthlyTrendChart';
import AnalyticsSummary from '../components/Analytics/AnalyticsSummary';

const Analytics = () => {
  const { format } = useCurrency();
  const [analyticsData, setAnalyticsData] = useState({
    categoryData: [],
    monthlyData: [],
    summary: {}
  });
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    try {
      const data = await expenseAPI.getAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Spending Analytics</h1>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-selector"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      <AnalyticsSummary summary={analyticsData.summary} />

      <div className="analytics-grid">
        <div className="chart-container">
          <h2>Spending by Category</h2>
          <CategoryChart data={analyticsData.categoryData} />
        </div>

        <div className="chart-container">
          <h2>Monthly Trends</h2>
          <MonthlyTrendChart data={analyticsData.monthlyData} />
        </div>
      </div>

      <div className="insights-section">
        <h2>Spending Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>Top Category</h3>
            <p>{analyticsData.summary.topCategory || 'N/A'}</p>
          </div>
          <div className="insight-card">
            <h3>Average Monthly Spend</h3>
            <p>{format(analyticsData.summary.avgMonthlySpend || 0)}</p>
          </div>
          <div className="insight-card">
            <h3>Trend</h3>
            <p className={analyticsData.summary.trend > 0 ? 'trend-up' : 'trend-down'}>
              {analyticsData.summary.trend > 0 ? '↑ Increasing' : '↓ Decreasing'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;