const Expense = require('../models/expense');
const Income = require('../models/income');
const Budget = require('../models/budget');

// Export expenses to CSV
const exportExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let query = { user: req.user.id };

    // Add date filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    // Generate CSV content
    const csvHeader = 'Date,Description,Category,Amount\n';
    const csvRows = expenses.map(expense =>
      `${expense.date.toISOString().split('T')[0]},${expense.description.replace(/,/g, ';')},${expense.category},${expense.amount}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csvContent);
  } catch (error) {
    console.error('Export expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export income to CSV
const exportIncome = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let query = { user: req.user.id };

    // Add date filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const incomes = await Income.find(query).sort({ date: -1 });

    // Generate CSV content
    const csvHeader = 'Date,Description,Category,Amount\n';
    const csvRows = incomes.map(income =>
      `${income.date.toISOString().split('T')[0]},${income.description.replace(/,/g, ';')},${income.category},${income.amount}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=income_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csvContent);
  } catch (error) {
    console.error('Export income error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export budgets to CSV
const exportBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    // Generate CSV content
    const csvHeader = 'Category,Allocated,Spent,Remaining\n';
    const csvRows = budgets.map(budget => {
      const spent = budget.spent || 0;
      const remaining = budget.allocated - spent;
      return `${budget.category},${budget.allocated},${spent},${remaining}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=budgets_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csvContent);
  } catch (error) {
    console.error('Export budgets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export complete financial report (expenses, income, budgets)
const exportFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all data
    const [expenses, incomes, budgets] = await Promise.all([
      Expense.find({ user: req.user.id, ...(dateFilter.date && { date: dateFilter }) }).sort({ date: -1 }),
      Income.find({ user: req.user.id, ...(dateFilter.date && { date: dateFilter }) }).sort({ date: -1 }),
      Budget.find({ user: req.user.id })
    ]);

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    // Generate comprehensive CSV
    let csvContent = 'FINANCIAL REPORT\n';
    csvContent += `Generated on: ${new Date().toISOString().split('T')[0]}\n`;
    csvContent += `Period: ${startDate || 'All time'} to ${endDate || 'Present'}\n\n`;

    csvContent += 'SUMMARY\n';
    csvContent += `Total Income,${totalIncome.toFixed(2)}\n`;
    csvContent += `Total Expenses,${totalExpenses.toFixed(2)}\n`;
    csvContent += `Net Income,${netIncome.toFixed(2)}\n\n`;

    csvContent += 'EXPENSES\n';
    csvContent += 'Date,Description,Category,Amount\n';
    expenses.forEach(expense => {
      csvContent += `${expense.date.toISOString().split('T')[0]},${expense.description.replace(/,/g, ';')},${expense.category},${expense.amount}\n`;
    });

    csvContent += '\nINCOME\n';
    csvContent += 'Date,Description,Category,Amount\n';
    incomes.forEach(income => {
      csvContent += `${income.date.toISOString().split('T')[0]},${income.description.replace(/,/g, ';')},${income.category},${income.amount}\n`;
    });

    csvContent += '\nBUDGETS\n';
    csvContent += 'Category,Allocated,Spent,Remaining\n';
    budgets.forEach(budget => {
      const spent = budget.spent || 0;
      const remaining = budget.allocated - spent;
      csvContent += `${budget.category},${budget.allocated},${spent},${remaining}\n`;
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=financial_report_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csvContent);
  } catch (error) {
    console.error('Export financial report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  exportExpenses,
  exportIncome,
  exportBudgets,
  exportFinancialReport
};