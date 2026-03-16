const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bed = require('../models/Bed');

router.get('/', auth, async (req, res) => {
  const beds = await Bed.find().populate({ path: 'patient', populate: { path: 'user', select: '-password' } });
  res.json(beds);
});

router.post('/', auth, async (req, res) => {
  const bed = new Bed(req.body);
  await bed.save();
  res.status(201).json(bed);
});

router.put('/:id', auth, async (req, res) => {
  const bed = await Bed.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
  res.json(bed);
});

// Seed default beds if none exist
router.post('/seed', auth, async (req, res) => {
  const count = await Bed.countDocuments();
  if (count > 0) return res.json({ message: 'Beds already exist', count });
  const beds = [];
  const wards = ['Ward A', 'Ward B', 'Ward C', 'ICU'];
  const types = ['GENERAL', 'GENERAL', 'GENERAL', 'ICU'];
  for (let i = 0; i < 20; i++) {
    const ward = wards[i % 4];
    beds.push({ bedNumber: `${ward.replace(' ', '')}-${String(i + 1).padStart(3, '0')}`, ward, type: types[i % 4], status: i % 3 === 0 ? 'OCCUPIED' : 'AVAILABLE' });
  }
  await Bed.insertMany(beds);
  res.json({ message: 'Beds seeded', count: beds.length });
});

module.exports = router;
