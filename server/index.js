require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const matchesRouter = require('./routes/matches');
const fansRouter = require('./routes/fans');
const liveScoreRouter = require('./routes/liveScore');
const { initMatchRoomHandlers } = require('./sockets/matchRoom');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'], credentials: true }));
app.use(express.json());

// REST Routes
app.use('/api/matches', matchesRouter);
app.use('/api/fans', fansRouter);
app.use('/api/live-score', liveScoreRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static client files in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`[Socket] Fan connected: ${socket.id}`);
  initMatchRoomHandlers(io, socket);
  socket.on('disconnect', () => {
    console.log(`[Socket] Fan disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🏏 IPL Fan Platform Server running on http://localhost:${PORT}`);
  console.log(`   AI Commentator: ${process.env.GEMINI_API_KEY ? '✅ Gemini connected' : '⚠️  No API key — using fallback commentary'}`);
  console.log(`   Socket.io: ✅ Ready\n`);
});

module.exports = { app, io };
