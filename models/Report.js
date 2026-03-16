const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['LAB', 'RADIOLOGY', 'PRESCRIPTION', 'DISCHARGE', 'OTHER'], default: 'OTHER' },
  fileUrl: String,
  cloudinaryId: String,
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  description: String,
  status: { type: String, enum: ['PENDING', 'REVIEWED', 'ARCHIVED'], default: 'PENDING' },
  isConfidential: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
