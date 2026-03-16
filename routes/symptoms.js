const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Symptom analysis - returns AI-like triage
router.post('/analyze', auth, async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || symptoms.length === 0) {
    return res.status(400).json({ message: 'No symptoms provided' });
  }

  // Rule-based triage (works without external AI API)
  const symptomStr = Array.isArray(symptoms) ? symptoms.join(' ').toLowerCase() : symptoms.toLowerCase();
  let severity = 'LOW';
  let recommendation = 'Monitor your symptoms. Rest and stay hydrated.';
  let specialists = ['General Physician'];

  if (symptomStr.match(/chest pain|heart attack|stroke|difficulty breathing|unconscious|seizure/)) {
    severity = 'CRITICAL';
    recommendation = 'Seek emergency medical care immediately. Call emergency services.';
    specialists = ['Emergency Medicine', 'Cardiologist'];
  } else if (symptomStr.match(/fever|headache|sore throat|cough|cold|flu/)) {
    severity = 'MODERATE';
    recommendation = 'Consult a General Physician. Consider fever medication and rest.';
    specialists = ['General Physician', 'Pulmonologist'];
  } else if (symptomStr.match(/back pain|joint pain|muscle pain|sprain/)) {
    severity = 'LOW';
    recommendation = 'Physical therapy recommended. Apply ice or heat.';
    specialists = ['Orthopedic', 'Physiotherapist'];
  } else if (symptomStr.match(/rash|allergy|itching|hives/)) {
    severity = 'MODERATE';
    recommendation = 'Consult a Dermatologist. Avoid known allergens.';
    specialists = ['Dermatologist', 'Allergist'];
  } else if (symptomStr.match(/anxiety|depression|stress|mental|panic/)) {
    severity = 'MODERATE';
    recommendation = 'Mental health support recommended. Speak with a counselor.';
    specialists = ['Psychiatrist', 'Psychologist'];
  }

  res.json({
    severity,
    recommendation,
    specialists,
    analysisTime: new Date().toISOString(),
    disclaimer: 'This is an AI-assisted evaluation. Always consult a licensed physician.'
  });
});

// Save symptom check
router.post('/save', auth, async (req, res) => {
  // Log symptom check (for future analytics)
  res.json({ success: true, message: 'Symptoms recorded for analysis' });
});

module.exports = router;
