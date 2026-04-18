const fs = require('fs');
const path = require('path');

const GUESTS_FILE = path.join(__dirname, '../data/guests.json');

function readGuests() {
  try {
    if (!fs.existsSync(GUESTS_FILE)) return [];
    const raw = fs.readFileSync(GUESTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function logGuest(fanProfile) {
  try {
    const guests = readGuests();
    guests.push(fanProfile);
    fs.writeFileSync(GUESTS_FILE, JSON.stringify(guests, null, 2), 'utf-8');
    console.log(`[GuestLog] Registered: ${fanProfile.displayName} <${fanProfile.email}> (Team: ${fanProfile.teamId})`);
  } catch (err) {
    console.error('[GuestLog] Failed to write guest log:', err.message);
  }
}

function getAllGuests() {
  return readGuests();
}

module.exports = { logGuest, getAllGuests };
