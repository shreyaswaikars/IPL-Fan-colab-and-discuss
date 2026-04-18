const { generateCommentary } = require('../agents/commentator');

// In-memory room state: matchId -> { fans: Map, reactions: Map, messages: [] }
const rooms = new Map();

function getOrCreateRoom(matchId) {
  if (!rooms.has(matchId)) {
    rooms.set(matchId, {
      fans: new Map(),     // socketId -> fan profile
      reactions: {},       // eventId -> { emoji: count }
      messages: [],        // last 200 messages
      aiCommentary: [],    // last 20 AI commentary items
    });
  }
  return rooms.get(matchId);
}

function initMatchRoomHandlers(io, socket) {
  let currentMatchId = null;
  let currentFan = null;

  // Join a match room
  socket.on('join-room', ({ matchId, fan }) => {
    if (!matchId || !fan) return;

    // Leave old room if any
    if (currentMatchId) {
      socket.leave(currentMatchId);
      const oldRoom = rooms.get(currentMatchId);
      if (oldRoom) {
        oldRoom.fans.delete(socket.id);
        io.to(currentMatchId).emit('room-update', {
          fans: Array.from(oldRoom.fans.values()),
          fanCount: oldRoom.fans.size,
        });
        io.to(currentMatchId).emit('fan-left', { fan: currentFan });
      }
    }

    currentMatchId = matchId;
    currentFan = fan;

    socket.join(matchId);
    const room = getOrCreateRoom(matchId);
    room.fans.set(socket.id, fan);

    // Send current state to joining fan
    socket.emit('room-state', {
      fans: Array.from(room.fans.values()),
      messages: room.messages.slice(-50),
      reactions: room.reactions,
      aiCommentary: room.aiCommentary.slice(-10),
    });

    // Broadcast fan joined to others
    socket.to(matchId).emit('fan-joined', { fan });
    io.to(matchId).emit('room-update', {
      fans: Array.from(room.fans.values()),
      fanCount: room.fans.size,
    });

    console.log(`[Room:${matchId}] ${fan.displayName} (${fan.teamId}) joined. Total: ${room.fans.size}`);
  });

  // Send a chat message
  socket.on('send-message', ({ matchId, message }) => {
    if (!matchId || !message || !currentFan) return;
    const room = rooms.get(matchId);
    if (!room) return;

    const msgObj = {
      id: `msg-${Date.now()}-${socket.id.slice(0, 4)}`,
      fan: currentFan,
      message: message.trim().slice(0, 500),
      timestamp: new Date().toISOString(),
    };

    room.messages.push(msgObj);
    if (room.messages.length > 200) room.messages.shift();

    io.to(matchId).emit('new-message', msgObj);
  });

  // Send a reaction to a match event
  socket.on('send-reaction', ({ matchId, eventId, emoji }) => {
    if (!matchId || !emoji || !currentFan) return;
    const room = rooms.get(matchId);
    if (!room) return;

    const key = eventId || 'general';
    if (!room.reactions[key]) room.reactions[key] = {};
    room.reactions[key][emoji] = (room.reactions[key][emoji] || 0) + 1;

    io.to(matchId).emit('reaction-update', {
      eventId: key,
      emoji,
      fan: currentFan,
      counts: room.reactions[key],
    });
  });

  // Trigger AI commentary for a match event
  socket.on('trigger-ai-event', async ({ matchId, event, matchContext }) => {
    if (!matchId || !event) return;
    const room = rooms.get(matchId);
    if (!room) return;

    try {
      const commentary = await generateCommentary(matchContext, event);
      const commentaryObj = {
        id: `ai-${Date.now()}`,
        event,
        commentary,
        timestamp: new Date().toISOString(),
      };

      room.aiCommentary.push(commentaryObj);
      if (room.aiCommentary.length > 20) room.aiCommentary.shift();

      io.to(matchId).emit('ai-commentary', commentaryObj);
    } catch (err) {
      console.error('[AI] Commentary generation failed:', err.message);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (currentMatchId) {
      const room = rooms.get(currentMatchId);
      if (room) {
        room.fans.delete(socket.id);
        io.to(currentMatchId).emit('fan-left', { fan: currentFan });
        io.to(currentMatchId).emit('room-update', {
          fans: Array.from(room.fans.values()),
          fanCount: room.fans.size,
        });
      }
    }
  });
}

module.exports = { initMatchRoomHandlers, rooms };
