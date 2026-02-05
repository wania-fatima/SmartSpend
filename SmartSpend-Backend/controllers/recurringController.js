const RecurringTransaction = require('../models/recurringTransaction');
const Expense = require('../models/expense');
const Income = require('../models/income');
// const { sendEmail, emailTemplates } = require('../utils/emailService');  // uncomment if used

const getRecurringTransactions = async (req, res) => {
  try {
    const transactions = await RecurringTransaction.find({
      user: req.user.id,
      isActive: true
    }).sort({ nextDueDate: 1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get recurring transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createRecurringTransaction = async (req, res) => {
  const { type, amount, description, category, frequency, startDate, endDate } = req.body;

  if (!type || !amount || amount <= 0 || !description || !category || !frequency || !startDate) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  try {
    const transaction = await RecurringTransaction.create({
      user: req.user.id,
      type,
      amount: parseFloat(amount),
      description,
      category,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      nextDueDate: new Date(startDate),           // important: start on the start date
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create recurring transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRecurringTransaction = async (req, res) => {
  try {
    const transaction = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) return res.status(404).json({ message: 'Recurring transaction not found' });

    const { type, amount, description, category, frequency, startDate, endDate, isActive } = req.body;

    if (type) transaction.type = type;
    if (amount !== undefined) {
      if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });
      transaction.amount = parseFloat(amount);
    }
    if (description) transaction.description = description;
    if (category) transaction.category = category;
    if (frequency) transaction.frequency = frequency;
    if (startDate) transaction.startDate = new Date(startDate);
    if (endDate !== undefined) transaction.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) transaction.isActive = isActive;

    // Reset nextDueDate if frequency or startDate changed
    if (frequency || startDate) {
      transaction.nextDueDate = new Date(transaction.startDate);
    }

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Update recurring transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRecurringTransaction = async (req, res) => {
  try {
    const transaction = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Recurring transaction deleted' });
  } catch (error) {
    console.error('Delete recurring transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const processRecurringTransactions = async () => {
  try {
    const now = new Date();
    const dueTransactions = await RecurringTransaction.find({
      nextDueDate: { $lte: now },
      isActive: true
    }).populate('user');

    let processedCount = 0;

    for (const transaction of dueTransactions) {
      while (
        transaction.nextDueDate.getTime() <= now.getTime() &&
        (!transaction.endDate || transaction.nextDueDate.getTime() <= transaction.endDate.getTime())
      ) {
        const transactionData = {
          user: transaction.user._id,
          amount: transaction.amount,
          description: `${transaction.description} (Recurring)`,
          category: transaction.category,
          date: new Date(transaction.nextDueDate)   // preserve exact due date
        };

        if (transaction.type === 'expense') {
          await Expense.create(transactionData);
        } else {
          await Income.create(transactionData);
        }

        processedCount++;

        // Move to next occurrence
        transaction.nextDueDate = calculateNextDueDate(transaction.nextDueDate, transaction.frequency);
        transaction.lastProcessed = now;
      }

      // Deactivate if passed end date
      if (transaction.endDate && transaction.nextDueDate.getTime() > transaction.endDate.getTime()) {
        transaction.isActive = false;
      }

      await transaction.save();
    }

    if (processedCount > 0) {
      console.log(`Processed ${processedCount} recurring transaction instances`);
    }
  } catch (error) {
    console.error('Process recurring transactions error:', error);
  }
};

const calculateNextDueDate = (current, frequency) => {
  const date = new Date(current);

  switch (frequency) {
    case 'daily':   date.setDate(date.getDate() + 1); break;
    case 'weekly':  date.setDate(date.getDate() + 7); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'yearly':  date.setFullYear(date.getFullYear() + 1); break;
    default:        date.setDate(date.getDate() + 1);
  }

  return date;
};

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions
};