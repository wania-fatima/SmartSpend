const Expense = require('../models/expense');
const Income = require('../models/income');
const Budget = require('../models/budget');
const { updateBudgetSpending } = require('./budgetController');
const { ObjectId } = require('mongoose').Types;

// Helper to get start date based on timeRange
const getStartDate = (timeRange) => {
  const now = new Date();
  if (timeRange === '3months') {
    now.setMonth(now.getMonth() - 3);
  } else if (timeRange === '6months') {
    now.setMonth(now.getMonth() - 6);
  } else if (timeRange === '1year') {
    now.setFullYear(now.getFullYear() - 1);
  }
  return now;
};

// Get all expenses for user
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent expenses (last 5)
const getRecentExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create expense
const createExpense = async (req, res) => {
  const { amount, description, category, date } = req.body;
  try {
    const expense = await Expense.create({
      user: req.user.id,
      amount,
      description,
      category,
      date,
    });

    // Update budget spending and check for alerts
    await updateBudgetSpending(req.user.id);

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    await Expense.findByIdAndDelete(req.params.id);

    // Update budget spending after deletion
    await updateBudgetSpending(req.user.id);

    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalSpent, expensesThisMonth, topCategory, totalIncome, totalBudget] = await Promise.all([
      Expense.aggregate([
        { $match: { user: new ObjectId(req.user.id) } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: new ObjectId(req.user.id), date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: new ObjectId(req.user.id) } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      Income.aggregate([
        { $match: { user: new ObjectId(req.user.id) } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Budget.aggregate([
        { $match: { user: new ObjectId(req.user.id) } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalSpentValue = totalSpent[0]?.total || 0;
    const totalIncomeValue = totalIncome[0]?.total || 0;
    const totalBudgetValue = totalBudget[0]?.total || 0;
    const remainingBudget = totalIncomeValue - totalSpentValue;

    res.json({
      totalSpent: totalSpentValue,
      expensesThisMonth: expensesThisMonth[0]?.total || 0,
      topCategory: topCategory[0]?._id || 'N/A',
      totalIncome: totalIncomeValue,
      totalBudget: totalBudgetValue,
      remainingBudget: remainingBudget,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get spending by category
const getSpendingByCategory = async (req, res) => {
  try {
    const spending = await Expense.aggregate([
      { $match: { user: new ObjectId(req.user.id) } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);
    res.json(spending);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const getAnalytics = async (req, res) => {
  const timeRange = req.query.timeRange || '6months';
  const startDate = getStartDate(timeRange);

  try {
    const [categoryData, monthlyData, summary] = await Promise.all([
      // Category data
      Expense.aggregate([
        { $match: { user: new ObjectId(req.user.id), date: { $gte: startDate } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $project: { category: '$_id', total: 1, _id: 0 } },
      ]),
      // Monthly data
      Expense.aggregate([
        { $match: { user: new ObjectId(req.user.id), date: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { month: '$_id', total: 1, _id: 0 } },
      ]),
      // Summary
      Expense.aggregate([
        { $match: { user: new ObjectId(req.user.id), date: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' },
            countMonths: { $addToSet: { $dateToString: { format: '%Y-%m', date: '$date' } } },
            topCategory: { $max: { total: { $sum: '$amount' }, category: '$category' } },
            // For trend: compare last two months
          },
        },
        // Trend calculation would need more logic; for simplicity, assume increasing/decreasing based on total
        // You can expand this
      ]),
    ]);

    // Mock summary for now (expand as needed)
    const avgMonthlySpend = summary[0]?.totalSpent / summary[0]?.countMonths.length || 0;
    const topCategory = categoryData.sort((a, b) => b.total - a.total)[0]?.category || 'N/A';
    
    // Calculate trend by comparing last two months
    let trend = 0;
    if (monthlyData.length >= 2) {
      const lastMonth = monthlyData[monthlyData.length - 1].total;
      const previousMonth = monthlyData[monthlyData.length - 2].total;
      trend = lastMonth - previousMonth; // Positive = increasing, Negative = decreasing
    }

    res.json({
      categoryData,
      monthlyData,
      summary: { avgMonthlySpend, topCategory, trend },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getExpenses,
  getRecentExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardStats,
  getAnalytics,
  getSpendingByCategory,
};