const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Planning', 'Active', 'Delayed', 'Completed', 'Cancelled'], default: 'Active' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  start_date: { type: Date },
  end_date: { type: Date },
  color: { type: String, default: '#4f6ef7' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);