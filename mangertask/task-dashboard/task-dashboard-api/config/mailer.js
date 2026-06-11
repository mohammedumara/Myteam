const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTaskAssignedEmail = async (toEmail, toName, taskTitle, assignedBy, dueDate, priority) => {
  try {
    await transporter.sendMail({
      from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4f6ef7; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">⊛ TaskFlow</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a1f36;">Hello ${toName}! 👋</h2>
            <p style="color: #64748b;">You have been assigned a new task:</p>
            <div style="background: #f8faff; border-left: 4px solid #4f6ef7; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1f36; margin: 0 0 8px 0;">${taskTitle}</h3>
              <p style="margin: 4px 0; color: #64748b;"><strong>Assigned by:</strong> ${assignedBy}</p>
              <p style="margin: 4px 0; color: #64748b;"><strong>Priority:</strong> ${priority}</p>
              <p style="margin: 4px 0; color: #64748b;"><strong>Due Date:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}</p>
            </div>
            <a href="http://localhost:5173" style="display: inline-block; background: #4f6ef7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Task →</a>
          </div>
        </div>
      `,
    });
    console.log(`Email sent to ${toEmail}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendStatusChangedEmail = async (toEmail, toName, taskTitle, newStatus) => {
  try {
    await transporter.sendMail({
      from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Task Status Updated: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4f6ef7; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">⊛ TaskFlow</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a1f36;">Task Update 🔔</h2>
            <p style="color: #64748b;">Status of your task has been updated:</p>
            <div style="background: #f8faff; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1f36; margin: 0 0 8px 0;">${taskTitle}</h3>
              <p style="margin: 4px 0; color: #64748b;"><strong>New Status:</strong> ${newStatus}</p>
            </div>
            <a href="http://localhost:5173" style="display: inline-block; background: #4f6ef7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Task →</a>
          </div>
        </div>
      `,
    });
    console.log(`Status email sent to ${toEmail}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendWelcomeEmail = async (toEmail, toName, password) => {
  try {
    await transporter.sendMail({
      from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Welcome to TaskFlow! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8faff; padding: 20px;">
          <div style="background: #4f6ef7; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">⊛ TaskFlow</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h2 style="color: #1a1f36; margin-top: 0;">Welcome to TaskFlow, ${toName}! 🎉</h2>
            <p style="color: #64748b;">Your account has been created successfully. Here are your login details:</p>
            <div style="background: #f8faff; border-left: 4px solid #4f6ef7; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 4px 0; color: #64748b;"><strong>Email:</strong> ${toEmail}</p>
              <p style="margin: 4px 0; color: #64748b;"><strong>Password:</strong> ${password}</p>
            </div>
            <p style="color: #64748b;">Please login and change your password immediately.</p>
            <a href="http://localhost:5173" style="display: inline-block; background: #4f6ef7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;">Login Now →</a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">This is an automated message from TaskFlow. Please do not reply.</p>
          </div>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${toEmail}`);
  } catch (err) {
    console.error('Welcome email error:', err.message);
  }
};

module.exports = { sendTaskAssignedEmail, sendStatusChangedEmail, sendWelcomeEmail };