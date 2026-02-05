const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Verify required environment variables early
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missing = requiredEnv.filter((v) => !process.env[v]);
if (missing.length) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
}

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Optional debug endpoints (can remove in production)
app.get('/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint',
    headers: req.headers,
    time: new Date().toISOString()
  });
});

app.get('/debug-auth', (req, res) => {
  const authHeader = req.headers.authorization;
  res.json({
    authHeader: authHeader,
    hasBearer: authHeader ? authHeader.startsWith('Bearer ') : false,
    token: authHeader ? authHeader.replace('Bearer ', '') : null
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/income', require('./routes/income'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/recurring', require('./routes/recurring'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/spending', require('./routes/spending'));     // ← added this line
app.use('/api/export', require('./routes/export'));

// Recurring transactions processor
const { processRecurringTransactions } = require('./controllers/recurringController');

// Run every hour
setInterval(processRecurringTransactions, 60 * 60 * 1000);
// Run once on server start
processRecurringTransactions();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));