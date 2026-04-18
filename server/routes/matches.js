const express = require('express');
const router = express.Router();
const matches = require('../data/matches.json');
const teams = require('../data/teams.json');
const { fetchLiveIplScores } = require('../services/liveScoreFetcher');

// Enrich match with team metadata
function enrichMatch(match) {
  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, t]));
  return {
    ...match,
    team1: { ...match.team1, ...(teamsMap[match.team1.id] || { name: match.team1.id, shortName: match.team1.id, primaryColor: '#666', crestEmoji: '🏏' }) },
    team2: { ...match.team2, ...(teamsMap[match.team2.id] || { name: match.team2.id, shortName: match.team2.id, primaryColor: '#666', crestEmoji: '🏏' }) },
  };
}

async function getMergedMatches() {
  try {
    const liveData = await fetchLiveIplScores();
    if (!liveData.matches || liveData.matches.length === 0) return [];
    
    return liveData.matches.map(rm => {
      // Find if this real match corresponds to a mock match to preserve any hardcoded events
      // (though we prioritize real-world status)
      const existingMock = matches.find(mm => 
        (mm.team1.id === rm.team1 && mm.team2.id === rm.team2) ||
        (mm.team1.id === rm.team2 && mm.team2.id === rm.team1)
      );

      return {
        id: rm.id,
        status: rm.status,
        team1: { 
          id: rm.team1, 
          score: rm.team1Score?.score || 0, 
          wickets: rm.team1Score?.wickets || 0, 
          overs: rm.team1Score?.overs || 0 
        },
        team2: { 
          id: rm.team2, 
          score: rm.team2Score?.score || 0, 
          wickets: rm.team2Score?.wickets || 0, 
          overs: rm.team2Score?.overs || 0 
        },
        battingTeam: rm.battingTeamId,
        venue: existingMock ? existingMock.venue : 'IPL Venue',
        time: rm.status === 'LIVE' ? 'LIVE NOW' : (rm.status === 'COMPLETED' ? 'RESULT' : (existingMock ? existingMock.time : 'TBA')),
        events: existingMock ? existingMock.events : [],
        currentOver: rm.recentBalls && rm.recentBalls.length > 0 ? { overNo: Math.ceil((rm.battingTeamId === rm.team1 ? rm.team1Score?.overs : rm.team2Score?.overs) || 0), balls: rm.recentBalls } : null
      };
    });
  } catch (e) {
    console.error("Error fetching live matches:", e);
    return [];
  }
}

// GET /api/matches
router.get('/', async (req, res) => {
  const merged = await getMergedMatches();
  const enriched = merged.map(enrichMatch);
  // Sort: LIVE first, then UPCOMING, then COMPLETED
  const order = { LIVE: 0, UPCOMING: 1, COMPLETED: 2 };
  enriched.sort((a, b) => order[a.status] - order[b.status]);
  res.json({ matches: enriched });
});

// GET /api/matches/:id
router.get('/:id', async (req, res) => {
  const merged = await getMergedMatches();
  const match = merged.find((m) => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json({ match: enrichMatch(match) });
});

// GET /api/matches/:id/events
router.get('/:id/events', async (req, res) => {
  const merged = await getMergedMatches();
  const match = merged.find((m) => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json({ events: match.events });
});

module.exports = router;
