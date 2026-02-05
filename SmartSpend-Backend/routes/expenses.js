const express = require('express');
const {
  getExpenses,
  getRecentExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardStats,
  getAnalytics,
  getSpendingByCategory,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getExpenses);
router.get('/recent', getRecentExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/spending', getSpendingByCategory);

module.exports = router;