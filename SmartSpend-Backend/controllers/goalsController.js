const User = require('../models/user');

// Get all goals for the authenticated user
const getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('goals');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.goals || []);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new savings/financial goal
const createGoal = async (req, res) => {
  const { name, targetAmount, targetDate, category } = req.body;

  // Basic input validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ message: 'Goal name is required' });
  }

  if (!targetAmount || isNaN(targetAmount) || Number(targetAmount) <= 0) {
    return res.status(400).json({ message: 'Target amount must be a positive number' });
  }

  if (!targetDate || isNaN(Date.parse(targetDate))) {
    return res.status(400).json({ message: 'Valid target date is required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newGoal = {
      name: name.trim(),
      targetAmount: Number(targetAmount),
      targetDate: new Date(targetDate),
      category: category || 'general',
      currentAmount: 0,
      completed: false
    };

    user.goals.push(newGoal);
    await user.save();

    // Return the newly created goal (last item in array)
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error while creating goal' });
  }
};

// Update an existing goal
const updateGoal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const goal = user.goals.id(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const { name, targetAmount, currentAmount, targetDate, category, completed } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Invalid goal name' });
      }
      goal.name = name.trim();
    }

    if (targetAmount !== undefined) {
      if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
        return res.status(400).json({ message: 'Target amount must be positive' });
      }
      goal.targetAmount = Number(targetAmount);
    }

    if (currentAmount !== undefined) {
      if (isNaN(currentAmount) || Number(currentAmount) < 0) {
        return res.status(400).json({ message: 'Current amount cannot be negative' });
      }
      goal.currentAmount = Number(currentAmount);
    }

    if (targetDate !== undefined) {
      if (isNaN(Date.parse(targetDate))) {
        return res.status(400).json({ message: 'Invalid target date format' });
      }
      goal.targetDate = new Date(targetDate);
    }

    if (category !== undefined) {
      goal.category = category;
    }

    if (completed !== undefined) {
      goal.completed = !!completed;
    }

    // Optional: auto-update completed status based on amounts
    if (goal.currentAmount >= goal.targetAmount) {
      goal.completed = true;
    }

    await user.save();
    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const goal = user.goals.id(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    user.goals.pull(req.params.id);
    await user.save();

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add contribution to a goal
const addToGoal = async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const goal = user.goals.id(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.completed) {
      return res.status(400).json({ message: 'Cannot add to a completed goal' });
    }

    goal.currentAmount += Number(amount);

    // Auto-mark as completed if target reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.completed = true;
    }

    await user.save();
    res.json(goal);
  } catch (error) {
    console.error('Add to goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addToGoal
};