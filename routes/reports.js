const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const Patient = require('../models/Patient');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/reports/patient/:userId
router.get('/patient/:userId', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.userId });
  if (!patient) return res.json([]);
  const reports = await Report.find({ patient: patient._id })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .sort({ createdAt: -1 });
  res.json(reports);
});

// POST /api/reports/upload - Upload a medical report
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  const patient = await Patient.findOne({ user: req.body.patientId || req.user.id });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  let fileUrl = req.body.fileUrl;
  let cloudinaryId = null;

  if (req.file) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'nova-health-reports', resource_type: 'raw' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        stream.write(req.file.buffer);
        stream.end();
      });
      fileUrl = uploadResult.secure_url;
      cloudinaryId = uploadResult.public_id;
    } catch (err) {
      console.error('Cloudinary upload failed:', err.message);
      // If Cloudinary fails, still create the report without a file URL
    }
  }

  const report = new Report({
    patient: patient._id,
    title: req.body.title || 'Medical Report',
    type: req.body.type || 'OTHER',
    fileUrl,
    cloudinaryId,
    description: req.body.description,
    doctor: req.body.doctorId
  });
  await report.save();
  res.status(201).json(report);
});

// GET /api/reports/:id
router.get('/:id', auth, async (req, res) => {
  const report = await Report.findById(req.params.id).populate({ path: 'patient', populate: { path: 'user', select: '-password' } });
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
});

// DELETE /api/reports/:id
router.delete('/:id', auth, async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (report?.cloudinaryId) {
    await cloudinary.uploader.destroy(report.cloudinaryId, { resource_type: 'raw' }).catch(() => {});
  }
  res.json({ success: true });
});

module.exports = router;
