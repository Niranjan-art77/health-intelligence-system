const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'DOCTOR', 'PATIENT', 'STAFF'], default: 'PATIENT' },
  phone: String,
  address: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  profileImage: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
