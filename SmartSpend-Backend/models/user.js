const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profile: {
    avatar: String,
    phone: String,
    currency: { type: String, default: 'USD' },
    dateFormat: { type: String, default: 'MM/dd/yyyy' },
    theme: { type: String, default: 'light' }
  },
  goals: [{
    name: String,
    targetAmount: Number,
    currentAmount: { type: Number, default: 0 },
    targetDate: Date,
    category: String,
    completed: { type: Boolean, default: false }
  }],
  notifications: {
    emailAlerts: { type: Boolean, default: true },
    budgetAlerts: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false }
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  console.log('Hashing password for user:', this.email);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Password hashed, length:', this.password.length);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);