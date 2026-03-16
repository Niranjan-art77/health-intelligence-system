const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { fullName, email, password, role, specialization, phone } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({ fullName, email, password: hashedPassword, role: role || 'PATIENT', phone });
  await user.save();

  // Create role-specific profile
  if (user.role === 'PATIENT') {
    const patient = new Patient({ user: user._id });
    await patient.save();
    const token = generateToken(user);
    const userData = { id: String(user._id), fullName: user.fullName, email: user.email, role: user.role, token };
    return res.status(201).json({ success: true, user: userData });
  } else if (user.role === 'DOCTOR') {
    const doctor = new Doctor({ user: user._id, specialization: specialization || 'General' });
    await doctor.save();
    const token = generateToken(user);
    const userData = { id: String(user._id), fullName: user.fullName, email: user.email, role: user.role, token };
    return res.status(201).json({ success: true, user: userData });
  }

  const token = generateToken(user);
  const userData = { id: String(user._id), fullName: user.fullName, email: user.email, role: user.role, token };
  res.status(201).json({ success: true, user: userData });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);
  const userData = { id: String(user._id), fullName: user.fullName, email: user.email, role: user.role, token };
  res.json({ success: true, user: userData });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ success: true, user });
});

module.exports = router;
