const express = require('express');
const {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  getTotalIncome,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getIncomes)
  .post(createIncome);

router.route('/:id')
  .put(updateIncome)
  .delete(deleteIncome);

router.get('/total', getTotalIncome);

module.exports = router;