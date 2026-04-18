const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { logGuest, getAllGuests } = require('../middleware/guestLogger');

// In-memory active fans (keyed by socket-session fan id)
const activeFans = new Map();

// POST /api/fans/register
router.post('/register', async (req, res) => {
  const { displayName, name, email, teamId } = req.body;

  // Validation
  if (!displayName || !name || !email || !teamId) {
    return res.status(400).json({ error: 'displayName, name, email, and teamId are required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const fanId = uuidv4();
  const fanProfile = {
    id: fanId,
    displayName: displayName.trim(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    teamId,
    registeredAt: new Date().toISOString(),
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  };

  // Log to persistent store
  await logGuest(fanProfile);

  // Return fan token (without sensitive PII)
  res.status(201).json({
    fan: {
      id: fanProfile.id,
      displayName: fanProfile.displayName,
      teamId: fanProfile.teamId,
      registeredAt: fanProfile.registeredAt,
    },
  });
});

// GET /api/fans/online — list active fans across all rooms
router.get('/online', (req, res) => {
  const roomMap = {};
  activeFans.forEach((fan) => {
    if (!roomMap[fan.matchId]) roomMap[fan.matchId] = [];
    roomMap[fan.matchId].push({ id: fan.id, displayName: fan.displayName, teamId: fan.teamId });
  });
  res.json({ rooms: roomMap });
});

// Internal: expose activeFans map for socket use
router.activeFans = activeFans;

module.exports = router;
