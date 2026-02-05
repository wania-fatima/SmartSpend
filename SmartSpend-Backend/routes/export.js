const express = require('express');
const {
  exportExpenses,
  exportIncome,
  exportBudgets,
  exportFinancialReport
} = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/expenses', exportExpenses);
router.get('/income', exportIncome);
router.get('/budgets', exportBudgets);
router.get('/report', exportFinancialReport);

module.exports = router;