const Budget = require('../models/budget');
const User = require('../models/user');
const Expense = require('../models/expense');
const { sendEmail, emailTemplates } = require('../utils/emailService');

const getBudgets = async (req, res) => {
  try {
    let budgets = await Budget.find({ user: req.user.id });

    // If less than 6 budgets, recreate defaults
    if (budgets.length < 6) {
      await Budget.deleteMany({ user: req.user.id });

      const defaultBudgets = [
        { user: req.user.id, category: 'food',         amount: 500 },
        { user: req.user.id, category: 'transport',    amount: 300 },
        { user: req.user.id, category: 'entertainment',amount: 200 },
        { user: req.user.id, category: 'shopping',     amount: 400 },
        { user: req.user.id, category: 'medicine',     amount: 150 },
        { user: req.user.id, category: 'other',        amount: 250 }
      ];

      budgets = await Budget.insertMany(defaultBudgets);
    }

    res.json(budgets);
  } catch (error) {
    console.error('Error in getBudgets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const setBudget = async (req, res) => {
  const { category, amount } = req.body;

  if (!category || typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({ message: 'Invalid category or amount' });
  }

  try {
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category: category.trim() },
      { amount: Number(amount) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Return updated list
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (error) {
    console.error('Error in setBudget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBudget = async (req, res) => {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  try {
    await Budget.deleteOne({ user: req.user.id, category });
    const remaining = await Budget.find({ user: req.user.id });
    res.json(remaining);
  } catch (error) {
    console.error('Error in deleteBudget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update spending for budgets and check for alerts
const updateBudgetSpending = async (userId) => {
  try {
    const budgets = await Budget.find({ user: userId });

    // Calculate spending for each category (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    for (const budget of budgets) {
      const spending = await Expense.aggregate([
        {
          $match: {
            user: userId,
            category: budget.category,
            date: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const totalSpent = spending.length > 0 ? spending[0].total : 0;
      budget.spent = totalSpent;

      // Check for budget alerts
      if (totalSpent > budget.amount) {
        await sendBudgetAlert(userId, budget.category, totalSpent, budget.amount);
      }

      await budget.save();
    }
  } catch (error) {
    console.error('Error updating budget spending:', error);
  }
};

// Send budget alert email
const sendBudgetAlert = async (userId, category, spent, budget) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.notifications.budgetAlerts) return;

    await sendEmail(
      user.email,
      'Budget Alert - SmartSpend',
      emailTemplates.budgetAlert(user.name, category, spent, budget)
    );

    console.log(`Budget alert sent to ${user.email} for ${category}`);
  } catch (error) {
    console.error('Error sending budget alert:', error);
  }
};

// Get budget alerts/status
const getBudgetAlerts = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    // Calculate current spending for each budget
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const alerts = [];

    for (const budget of budgets) {
      const spending = await Expense.aggregate([
        {
          $match: {
            user: req.user.id,
            category: budget.category,
            date: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const totalSpent = spending.length > 0 ? spending[0].total : 0;
      const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

      if (totalSpent > budget.amount) {
        alerts.push({
          category: budget.category,
          allocated: budget.amount,
          spent: totalSpent,
          overBudget: totalSpent - budget.amount,
          percentage: Math.round(percentage),
          status: 'exceeded'
        });
      } else if (percentage > 80) {
        alerts.push({
          category: budget.category,
          allocated: budget.amount,
          spent: totalSpent,
          remaining: budget.amount - totalSpent,
          percentage: Math.round(percentage),
          status: 'warning'
        });
      }
    }

    res.json(alerts);
  } catch (error) {
    console.error('Error getting budget alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
  updateBudgetSpending,
  getBudgetAlerts
};