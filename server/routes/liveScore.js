const express = require('express');
const router = express.Router();
const { fetchLiveIplScores } = require('../services/liveScoreFetcher');

/**
 * GET /api/live-score
 * Returns live IPL match scores scraped from Cricbuzz.
 * Results are cached for 30 seconds server-side.
 */
router.get('/', async (req, res) => {
  try {
    const data = await fetchLiveIplScores();
    res.json(data);
  } catch (err) {
    res.status(503).json({ error: 'Live score unavailable', message: err.message });
  }
});

module.exports = router;
