const Income = require('../models/income');
const { ObjectId } = require('mongoose').Types;

// Get all incomes for the logged-in user
const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new income
const createIncome = async (req, res) => {
  const { source, amount, date, type, description } = req.body;
  console.log('Creating income with data:', req.body);

  try {
    const income = await Income.create({
      user: req.user.id,
      source,
      amount,
      date,
      type,
      description,
    });
    console.log('Income created:', income._id);
    res.status(201).json(income);
  } catch (error) {
    console.error('Income creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update income
const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income || income.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Income not found' });
    }

    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete income
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income || income.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Income not found' });
    }

    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: 'Income removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get total income (optional: for dashboard summary)
const getTotalIncome = async (req, res) => {
  try {
    const result = await Income.aggregate([
      { $match: { user: new ObjectId(req.user.id) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const total = result.length > 0 ? result[0].total : 0;
    res.json({ totalIncome: total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  getTotalIncome,
};