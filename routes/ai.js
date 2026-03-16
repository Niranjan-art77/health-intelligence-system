const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const HEALTH_TIPS = [
  { tip: "Drink at least 8 glasses of water daily to maintain optimal hydration.", category: "Hydration" },
  { tip: "Aim for 7-9 hours of quality sleep each night for cellular repair.", category: "Sleep" },
  { tip: "Walk 10,000 steps per day to reduce cardiovascular risk by 30%.", category: "Activity" },
  { tip: "Eat a rainbow of vegetables daily for diverse micronutrient intake.", category: "Nutrition" },
  { tip: "Practice 10 minutes of deep breathing to reduce cortisol levels.", category: "Mental Health" },
  { tip: "Limit screen time before bed to improve melatonin production.", category: "Sleep" },
  { tip: "Include omega-3 rich foods like salmon or walnuts for brain health.", category: "Nutrition" },
  { tip: "Schedule regular health checkups even when you feel healthy.", category: "Prevention" },
  { tip: "Manage stress through mindfulness meditation or yoga.", category: "Mental Health" },
  { tip: "Limit processed foods and added sugars to reduce inflammation.", category: "Nutrition" },
  { tip: "Take brief movement breaks every hour to counteract sedentary behavior.", category: "Activity" },
  { tip: "Stay socially connected - strong relationships boost immunity.", category: "Mental Health" },
  { tip: "Wash hands regularly to prevent 80% of common infectious diseases.", category: "Prevention" },
  { tip: "Maintain a consistent meal schedule to regulate your metabolism.", category: "Nutrition" },
  { tip: "Practice gratitude daily to improve mental resilience.", category: "Mental Health" }
];

// GET /api/ai/health-tip - Daily health tip
router.get('/health-tip', auth, async (req, res) => {
  const dayIndex = new Date().getDate() % HEALTH_TIPS.length;
  res.json(HEALTH_TIPS[dayIndex]);
});

// POST /api/ai/health-score - Calculate health risk score
router.post('/health-score', auth, async (req, res) => {
  const { age, bmi, bloodPressure, smokingStatus, exerciseFrequency, conditions } = req.body;
  let score = 100;

  if (age > 60) score -= 10;
  else if (age > 40) score -= 5;
  if (bmi > 30) score -= 15;
  else if (bmi > 25) score -= 8;
  if (smokingStatus === 'current') score -= 20;
  else if (smokingStatus === 'former') score -= 8;
  if (exerciseFrequency === 'never') score -= 12;
  else if (exerciseFrequency === 'rarely') score -= 6;
  if (conditions && conditions.length > 0) score -= conditions.length * 5;
  if (bloodPressure === 'high') score -= 10;

  const riskLevel = score >= 80 ? 'LOW' : score >= 60 ? 'MODERATE' : score >= 40 ? 'HIGH' : 'CRITICAL';
  const recommendations = [];
  if (bmi > 25) recommendations.push('Maintain a healthy weight through diet and exercise');
  if (smokingStatus === 'current') recommendations.push('Quit smoking to significantly improve heart health');
  if (exerciseFrequency === 'never' || exerciseFrequency === 'rarely') recommendations.push('Increase physical activity to at least 150 minutes per week');

  res.json({ score: Math.max(10, score), riskLevel, recommendations });
});

// POST /api/ai/diet-recommendations
router.post('/diet-recommendations', auth, async (req, res) => {
  const { conditions, bloodGroup, weight, height } = req.body;
  const recommendations = {
    avoid: ['Processed foods', 'Excessive salt', 'Sugary beverages'],
    include: ['Leafy greens', 'Lean proteins', 'Whole grains', 'Fresh fruits'],
    meals: {
      breakfast: 'Oatmeal with berries and nuts',
      lunch: 'Grilled chicken salad with olive oil dressing',
      dinner: 'Steamed fish with quinoa and vegetables',
      snacks: 'Fresh fruits, nuts, or yogurt'
    }
  };

  if (conditions?.includes('diabetes')) {
    recommendations.avoid.push('High glycemic index foods', 'White bread', 'Sugary snacks');
    recommendations.include.push('Fiber-rich foods', 'Bitter gourd', 'Fenugreek');
  }
  if (conditions?.includes('hypertension')) {
    recommendations.avoid.push('High sodium foods', 'Alcohol', 'Caffeine');
    recommendations.include.push('Potassium-rich foods', 'Bananas', 'Spinach');
  }

  res.json(recommendations);
});

// POST /api/ai/doctor-recommendation
router.post('/doctor-recommendation', auth, async (req, res) => {
  const { symptoms, age, gender } = req.body;
  const Doctor = require('../models/Doctor');
  const symptomStr = (Array.isArray(symptoms) ? symptoms.join(' ') : symptoms || '').toLowerCase();

  let specialization = 'General';
  if (symptomStr.match(/heart|chest|cardiac/)) specialization = 'Cardiologist';
  else if (symptomStr.match(/skin|rash|acne/)) specialization = 'Dermatologist';
  else if (symptomStr.match(/bone|joint|fracture/)) specialization = 'Orthopedic';
  else if (symptomStr.match(/eye|vision|sight/)) specialization = 'Ophthalmologist';
  else if (symptomStr.match(/child|pediatric|kid/)) specialization = 'Pediatrician';

  const doctors = await Doctor.find()
    .populate('user', '-password')
    .sort({ rating: -1 })
    .limit(5);

  res.json({ specialization, recommendations: doctors });
});

// POST /api/ai/chat - AI Chatbot
router.post('/chat', auth, async (req, res) => {
  const { message } = req.body;
  const msg = (message || '').toLowerCase();
  let reply = "I'm Nova AI, your health intelligence assistant. I can help with health tips, symptom information, medication reminders, and care navigation. What can I do for you?";

  if (msg.match(/appointment|book|schedule/)) {
    reply = "To book an appointment, go to **Doctor Directory** and select your preferred doctor. You can filter by specialty and check real-time availability.";
  } else if (msg.match(/medication|medicine|pill|reminder/)) {
    reply = "I can track your medication schedule. Visit **Prescriptions** to set up smart reminders that will notify you when it's time to take your medicine.";
  } else if (msg.match(/report|test|result/)) {
    reply = "Your medical reports are stored securely in the **Reports** section. You can upload, view, and download PDF versions anytime.";
  } else if (msg.match(/emergency|sos|urgent/)) {
    reply = "🚨 For emergencies, press the **Emergency SOS** button on your dashboard immediately. Emergency responders will be notified with your location and medical records.";
  } else if (msg.match(/health score|score/)) {
    reply = "Your health score is calculated from vitals, medication adherence, and appointment history. Check the **Health Score Dashboard** for a detailed breakdown.";
  } else if (msg.match(/diet|food|nutrition|eat/)) {
    reply = "For personalized diet recommendations, visit the **AI Diet** section. I'll analyze your health profile and provide meal suggestions based on your conditions.";
  }

  res.json({ reply, timestamp: new Date().toISOString() });
});

module.exports = router;
