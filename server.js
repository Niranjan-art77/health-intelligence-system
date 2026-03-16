const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
require('express-async-errors');

const app = express();
const server = http.createServer(app);

// --- Allowed origins (Frontend URLs) ---
const ALLOWED_ORIGINS = [
  'https://hospital-intelligence-system.vercel.app',
  'https://nova-health-ai.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

// --- Socket.io Setup (must use http server, not app) ---
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// --- CORS Middleware ---
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(null, true); // Allow all in case of new deploy URLs
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight for all routes
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Database ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/beds', require('./routes/beds'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/symptoms', require('./routes/symptoms'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/ai', require('./routes/ai'));

// --- Health Check ---
app.get('/', (req, res) => {
  res.json({ 
    status: 'active', 
    message: 'Nova Health AI Backend is running',
    version: '2.1.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// --- Socket.io Events ---
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    if (roomId) {
      socket.join(roomId);
    }
  });

  socket.on('leave-room', (roomId) => {
    if (roomId) socket.leave(roomId);
  });

  socket.on('send-message', (messageData) => {
    if (messageData?.roomId) {
      socket.to(messageData.roomId).emit('new-message', messageData);
    }
  });

  socket.on('typing', ({ roomId, userId, isTyping }) => {
    if (roomId) socket.to(roomId).emit('user-typing', { userId, isTyping });
  });

  socket.on('mark-seen', (messageId) => {
    if (messageId) socket.broadcast.emit('message-seen', messageId);
  });

  socket.on('error', (err) => {
    console.error(`Socket error from ${socket.id}:`, err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Disconnected: ${socket.id} — Reason: ${reason}`);
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// --- Start Server — MUST listen on 0.0.0.0 for Railway ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nova Health Backend running on port ${PORT}`);
  console.log(`📡 Socket.io enabled`);
  console.log(`🌐 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
