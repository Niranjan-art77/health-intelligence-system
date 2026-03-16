const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// GET /api/messages/:roomId - Get messages in a room
router.get('/:roomId', auth, async (req, res) => {
  const messages = await Message.find({ roomId: req.params.roomId })
    .populate('sender', 'fullName role profileImage')
    .sort({ createdAt: 1 })
    .limit(100);
  res.json(messages);
});

// POST /api/messages - Send a message
router.post('/', auth, async (req, res) => {
  const message = new Message({ ...req.body, sender: req.user.id });
  await message.save();
  await message.populate('sender', 'fullName role profileImage');
  res.status(201).json(message);
});

// GET /api/messages/rooms/my - Get all conversation rooms for user
router.get('/rooms/my', auth, async (req, res) => {
  const messages = await Message.find({
    $or: [{ sender: req.user.id }, { receiver: req.user.id }]
  }).populate('sender', 'fullName role').populate('receiver', 'fullName role').sort({ createdAt: -1 });
  
  // Unique rooms
  const rooms = {};
  messages.forEach(m => {
    if (!rooms[m.roomId]) rooms[m.roomId] = m;
  });
  res.json(Object.values(rooms));
});

// PUT /api/messages/:id/seen - Mark message as seen
router.put('/:id/seen', auth, async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, { isSeen: true, seenAt: new Date() });
  res.json({ success: true });
});

module.exports = router;
