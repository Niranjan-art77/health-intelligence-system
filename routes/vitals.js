const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vitals = require('../models/Vitals');
const Patient = require('../models/Patient');

router.get('/patient/:userId', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.userId });
  if (!patient) return res.json([]);
  const vitals = await Vitals.find({ patient: patient._id }).sort({ recordedAt: -1 }).limit(30);
  res.json(vitals);
});

router.post('/', auth, async (req, res) => {
  const vital = new Vitals({ ...req.body, recordedBy: req.user.id });
  await vital.save();
  res.status(201).json(vital);
});

router.get('/:id', auth, async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.json([]);
  const vitals = await Vitals.find({ patient: patient._id }).sort({ recordedAt: -1 }).limit(30);
  res.json(vitals);
});

module.exports = router;
