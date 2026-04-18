const BASE = '/api';

export async function getMatches() {
  const res = await fetch(`${BASE}/matches`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json(); // { matches: [...] }
}

export async function getMatch(id) {
  const res = await fetch(`${BASE}/matches/${id}`);
  if (!res.ok) throw new Error('Match not found');
  return res.json(); // { match: {...} }
}

export async function registerGuest({ displayName, name, email, teamId }) {
  const res = await fetch(`${BASE}/fans/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, name, email, teamId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data; // { fan: { id, displayName, teamId, registeredAt } }
}

export async function getLiveScore() {
  const res = await fetch(`${BASE}/live-score`);
  if (!res.ok) throw new Error('Failed to fetch live score');
  return res.json();
}
