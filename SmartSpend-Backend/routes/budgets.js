const express = require('express');
const { getBudgets, setBudget, deleteBudget, getBudgetAlerts } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getBudgets);
router.post('/', setBudget);
router.delete('/:category', deleteBudget);
router.get('/alerts', getBudgetAlerts);

module.exports = router;