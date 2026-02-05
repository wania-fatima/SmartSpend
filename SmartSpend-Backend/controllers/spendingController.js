const Expense = require('../models/expense'); // assuming you have this model

const getSpendingByCategory = async (req, res) => {
  try {
    const spending = await Expense.aggregate([
      {
        $match: {
          user: req.user.id,
          // Optional: only current month
          // createdAt: { $gte: new Date(new Date().setDate(1)) }
        }
      },
      {
        $group: {
          _id: { $toLower: "$category" }, // case-insensitive
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(spending);
  } catch (error) {
    console.error('Error getting spending by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSpendingByCategory };