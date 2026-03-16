const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// GET /api/doctors - List all doctors
router.get('/', auth, async (req, res) => {
  const { specialization, status } = req.query;
  const filter = {};
  if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
  if (status) filter.availabilityStatus = status;
  const doctors = await Doctor.find(filter).populate('user', '-password').sort({ rating: -1 });
  res.json(doctors);
});

// GET /api/doctors/:id
router.get('/:id', auth, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('user', '-password');
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
});

// PUT /api/doctors/:id/availability - Update availability status
router.put('/:id/availability', auth, async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { availabilityStatus: req.body.status },
    { new: true }
  ).populate('user', '-password');
  res.json(doctor);
});

// POST /api/doctors/:id/rate - Rate a doctor
router.post('/:id/rate', auth, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  const { rating } = req.body;
  const newTotalRatings = doctor.totalRatings + 1;
  const newRating = ((doctor.rating * doctor.totalRatings) + Number(rating)) / newTotalRatings;
  doctor.rating = Math.round(newRating * 10) / 10;
  doctor.totalRatings = newTotalRatings;
  await doctor.save();
  res.json({ success: true, rating: doctor.rating });
});

// GET /api/doctors/my-profile
router.get('/my-profile', auth, async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', '-password');
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  res.json(doctor);
});

module.exports = router;
