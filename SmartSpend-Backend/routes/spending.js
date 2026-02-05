const express = require('express');
const { getSpendingByCategory } = require('../controllers/spendingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getSpendingByCategory);

module.exports = router;