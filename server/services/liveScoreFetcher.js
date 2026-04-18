/**
 * Live Score & Schedule Fetcher — scrapes Cricbuzz for real IPL match data.
 */

const https = require('https');
const http = require('http');

// Simple in-memory cache
let cache = { data: null, fetchedAt: 0 };
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

// IPL team short name → our internal team IDs
const TEAM_ALIAS = {
  'RCB': 'RCB', 'DC': 'DC', 'MI': 'MI', 'CSK': 'CSK',
  'KKR': 'KKR', 'GT': 'GT', 'RR': 'RR', 'SRH': 'SRH',
  'PBKS': 'PBKS', 'LSG': 'LSG',
  'Royal Challengers Bengaluru': 'RCB',
  'Delhi Capitals': 'DC',
  'Mumbai Indians': 'MI',
  'Chennai Super Kings': 'CSK',
  'Kolkata Knight Riders': 'KKR',
  'Gujarat Titans': 'GT',
  'Rajasthan Royals': 'RR',
  'Sunrisers Hyderabad': 'SRH',
  'Punjab Kings': 'PBKS',
  'Lucknow Super Giants': 'LSG',
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function parseOgScore(html) {
  const ogMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  if (!ogMatch) return null;
  return ogMatch[1];
}

function parseScoreFragment(fragment) {
  // Match "TEAM SCORE/WICKETS (OVERS)" or "TEAM SCORE/WICKETS"
  const m = fragment.match(/([A-Z]+)\s+(\d+\/\d+)(?:\s*\(([^)]+)\))?/i);
  if (!m) return null;
  
  const teamAbbr = m[1].toUpperCase();
  const score = parseInt(m[2].split('/')[0]);
  const wickets = parseInt(m[2].split('/')[1] || 0);
  
  // Try to extract overs from the parentheses part
  let overs = 0;
  if (m[3]) {
    const overMatch = m[3].match(/(\d+(?:\.\d+)?)/);
    if (overMatch) overs = parseFloat(overMatch[1]);
  }

  return { teamAbbr, score, wickets, overs };
}

function parseLiveMatchPage(html, matchUrl) {
  const ogDesc = parseOgScore(html);
  if (!ogDesc) return null;

  const slugMatch = matchUrl.match(/\/([a-z]+)-vs-([a-z]+)-\d+/i);
  const team1Short = slugMatch ? slugMatch[1].toUpperCase() : null;
  const team2Short = slugMatch ? slugMatch[2].toUpperCase() : null;

  // Find all score-like patterns: e.g. "DC 16/2 (2.2)" or "RCB 175/8"
  const scoreRegex = /([A-Z]{2,5})\s+(\d+\/\d+)(?:\s*\([^)]+\))?/gi;
  const allScores = [];
  let sm;
  while ((sm = scoreRegex.exec(ogDesc)) !== null) {
    const data = parseScoreFragment(sm[0]);
    if (data) allScores.push(data);
  }

  const team1Id = TEAM_ALIAS[team1Short] || team1Short;
  const team2Id = TEAM_ALIAS[team2Short] || team2Short;

  const result = {
    team1Short: team1Id,
    team2Short: team2Id,
    battingTeamId: null,
    team1Score: { score: 0, wickets: 0, overs: 0 },
    team2Score: { score: 0, wickets: 0, overs: 0 },
    battersStr: '',
    recentBalls: []
  };

  allScores.forEach(s => {
    const mappedId = TEAM_ALIAS[s.teamAbbr] || s.teamAbbr;
    if (mappedId === team1Id) {
      result.team1Score = { score: s.score, wickets: s.wickets, overs: s.overs };
    } else if (mappedId === team2Id) {
      result.team2Score = { score: s.score, wickets: s.wickets, overs: s.overs };
    }
  });

  // The first team mentioned in og:description is usually the one currently batting
  if (allScores.length > 0) {
    result.battingTeamId = TEAM_ALIAS[allScores[0].teamAbbr] || allScores[0].teamAbbr;
  }

  const battersMatch = ogDesc.match(/\(([A-Z][^)]+\d+\(\d+\)[^)]*)\)/);
  result.battersStr = battersMatch ? battersMatch[1].trim() : '';
  
  const recentMatch = html.match(/Recent\s*:\s*([\d\s.WNwdnb]+)/i);
  result.recentBalls = recentMatch 
    ? recentMatch[1].trim().split(/\s+/).filter(b => b && b !== '...').slice(-6)
    : [];

  return result;
}

/**
 * Parses the live-scores listing page for all IPL matches and their status
 */
function parseIplMatchesFromListing(html) {
  const matches = [];
  
  // Pattern to find IPL match blocks: link followed by status text
  // We'll search for all <a> tags that point to IPL 2026 matches
  const linkRegex = /<a[^>]*href=["'](\/live-cricket-scores\/(\d+)\/([a-z0-9-]+-indian-premier-league-2026[^"']*))["'][^>]*>(.*?)<\/a>/gi;
  
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const url = 'https://www.cricbuzz.com' + m[1];
    const id = m[2];
    const slug = m[3];
    const linkText = m[4].trim();

    // Ignore boilerplate links that don't contain match names
    if (/Live Score\s*\||Scorecard\s*\||Full Commentary\s*\|/i.test(linkText)) continue;

    // Determine status strictly from link text
    let status = 'UPCOMING';
    // Look for confirmed score pattern or "LIVE" marker
    const hasScore = /\d+-\d+\s*\(\d+/.test(linkText) || /\d+\/\d+\s*\(\d+/.test(linkText);
    const hasLiveMarker = /LIVE/i.test(linkText);

    if (hasScore || hasLiveMarker) {
      status = 'LIVE';
    } else if (/won by|match drawn|result|beat/i.test(linkText)) {
      status = 'COMPLETED';
    } else if (/preview|starts at/i.test(linkText)) {
      status = 'UPCOMING';
    }
    
    const teamMatch = slug.match(/^([a-z0-9]+)-vs-([a-z0-9]+)/i);
    if (!teamMatch) continue;
    
    const t1Raw = teamMatch[1].toUpperCase();
    const t2Raw = teamMatch[2].toUpperCase();
    const team1 = TEAM_ALIAS[t1Raw] || t1Raw;
    const team2 = TEAM_ALIAS[t2Raw] || t2Raw;

    const matchId = `real-${id}`;
    const existing = matches.find(m => m.id === matchId);
    
    if (existing) {
      // Prioritize LIVE > COMPLETED > UPCOMING
      const priority = { 'LIVE': 3, 'COMPLETED': 2, 'UPCOMING': 1 };
      if (priority[status] > priority[existing.status]) {
        existing.status = status;
      }
    } else {
      matches.push({
        id: matchId,
        url,
        team1,
        team2,
        status,
        info: slug.replace(/-indian-premier-league-2026.*/, '').replace(/-/g, ' '),
      });
    }
  }

  return matches;
}

async function fetchLiveIplScores() {
  const now = Date.now();
  if (cache.data && (now - cache.fetchedAt) < CACHE_TTL_MS) {
    return cache.data;
  }

  try {
    const listingHtml = await fetchUrl('https://www.cricbuzz.com/cricket-match/live-scores');
    const matchesFound = parseIplMatchesFromListing(listingHtml);
    
    // For LIVE matches, fetch full details
    const liveMatches = matchesFound.filter(m => m.status === 'LIVE');
    const enrichedLive = await Promise.allSettled(
      liveMatches.map(async (m) => {
        const html = await fetchUrl(m.url);
        const details = parseLiveMatchPage(html, m.url);
        return { ...m, ...details };
      })
    );

    const finalMatches = matchesFound.map(m => {
      const enriched = enrichedLive.find(el => el.status === 'fulfilled' && el.value.url === m.url);
      return enriched ? enriched.value : m;
    });

    const payload = { 
      scores: finalMatches, // Keeping 'scores' key for backward compatibility or updating it
      matches: finalMatches, 
      fetchedAt: new Date().toISOString() 
    };
    cache = { data: payload, fetchedAt: now };
    return payload;

  } catch (err) {
    console.error('[LiveScore] Fetch failed:', err.message);
    if (cache.data) return { ...cache.data, stale: true };
    throw err;
  }
}

module.exports = { fetchLiveIplScores };
