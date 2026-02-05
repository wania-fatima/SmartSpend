const express = require('express');
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addToGoal
} = require('../controllers/goalsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/add', addToGoal);

module.exports = router;