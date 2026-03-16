const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  message: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL', 'SUCCESS', 'APPOINTMENT', 'MEDICATION'], default: 'INFO' },
  isRead: { type: Boolean, default: false },
  link: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
