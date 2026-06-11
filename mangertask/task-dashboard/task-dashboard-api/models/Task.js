const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  // assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

assigned_to: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Under Review', 'Completed', 'On Hold', 'Cancelled'], default: 'Pending' },
  due_date: { type: Date },
  progress: { type: Number, default: 0 },
  project: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);