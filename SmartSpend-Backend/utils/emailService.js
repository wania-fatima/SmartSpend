const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"SmartSpend" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  passwordReset: (resetLink) => `
    <h3>Password Reset Request</h3>
    <p>You requested to reset your SmartSpend password.</p>

    <p>Click the link below to reset your password:</p>

    <a href="${resetLink}" style="color: blue; font-weight: bold;">
      Reset Password
    </a>

    <p>This link will expire in 1 hour.</p>

    <p>If you did not request this, please ignore this email.</p>
  `,

  budgetAlert: (userName, category, spent, budget) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6b6b;">Budget Alert ⚠️</h2>
      <p>Hi ${userName},</p>
      <p>You've exceeded your budget for <strong>${category}</strong>!</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Spent:</strong> $${spent.toFixed(2)}</p>
        <p><strong>Budget:</strong> $${budget.toFixed(2)}</p>
        <p><strong>Over Budget:</strong> $${(spent - budget).toFixed(2)}</p>
      </div>
      <p>Please review your expenses and adjust your spending accordingly.</p>
      <a href="${process.env.FRONTEND_URL}/budget"
         style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
        View Budget
      </a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">SmartSpend - Personal Finance Management</p>
    </div>
  `,

  welcome: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Welcome to SmartSpend! 🎉</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for joining SmartSpend! We're excited to help you manage your finances better.</p>
      <p>Get started by:</p>
      <ul>
        <li>Setting up your budget categories</li>
        <li>Adding your income sources</li>
        <li>Tracking your expenses</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/dashboard"
         style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
        Get Started
      </a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">SmartSpend - Personal Finance Management</p>
    </div>
  `
};

module.exports = {
  sendEmail,
  emailTemplates
};
