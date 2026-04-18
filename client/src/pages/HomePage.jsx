import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFan } from '../context/FanContext.jsx';
import { getMatches, getLiveScore } from '../api/matchesApi.js';
import MatchCard from '../components/MatchCard.jsx';
import LiveTicker from '../components/LiveTicker.jsx';
import TeamBadge from '../components/TeamBadge.jsx';
import ThemeSwitcher from '../components/ThemeSwitcher.jsx';

export default function HomePage() {
  const { fan, clearFanProfile } = useFan();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMatches();
        setMatches(data.matches || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load matches');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const liveMatches = matches.filter((m) => m.status === 'LIVE');
  const upcomingMatches = matches.filter((m) => m.status === 'UPCOMING');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  const totalFans = matches.reduce((sum, m) => sum + (m.fanCount || 0), 0);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          🏏 <span>IPL</span> Fan Zone
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeSwitcher />
          {fan?.teamId && (
            <TeamBadge teamId={fan.teamId} primaryColor={fan.teamColors?.primaryColor} />
          )}
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {fan?.displayName}
          </span>
          <button
            id="logout-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => { clearFanProfile(); navigate('/onboarding'); }}
          >
            Leave
          </button>
        </div>
      </nav>

      <div className="container">
        {/* Live ticker */}
        {liveMatches.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <LiveTicker matches={matches} />
          </div>
        )}

        {/* Hero */}
        <div className="home-hero">
          <h1>
            Your Matchday<br />
            <span className="hero-gradient-text">Starts Here</span>
          </h1>
          <p className="text-secondary text-lg" style={{ marginBottom: '24px' }}>
            React to every six. Chat with fans. Live cricket, together.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <p className="text-3xl font-extrabold text-team">{liveMatches.length}</p>
              <p className="text-xs text-muted">Live Now</p>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <p className="text-3xl font-extrabold" style={{ color: 'var(--green)' }}>{totalFans.toLocaleString()}</p>
              <p className="text-xs text-muted">Fans Online</p>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <p className="text-3xl font-extrabold" style={{ color: 'var(--amber)' }}>{upcomingMatches.length}</p>
              <p className="text-xs text-muted">Upcoming</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '24px', textAlign: 'center' }}>
            <p className="text-sm" style={{ color: 'var(--live-red)' }}>{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="matches-grid" style={{ marginBottom: '32px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '200px' }} />
            ))}
          </div>
        )}

        {/* Live Matches */}
        {!loading && liveMatches.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <p className="matches-section-title">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--live-red)', animation: 'pulse-live 1.5s infinite', display: 'inline-block' }} />
              Live Now
            </p>
            <div className="matches-grid">
              {liveMatches.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        {!loading && upcomingMatches.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <p className="matches-section-title">⏰ Upcoming</p>
            <div className="matches-grid">
              {upcomingMatches.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* Completed Matches */}
        {!loading && completedMatches.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <p className="matches-section-title">✅ Recent Results</p>
            <div className="matches-grid">
              {completedMatches.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* My Team Spotlight */}
        {!loading && fan?.teamId && (
          <section style={{ marginBottom: '48px' }}>
            <p className="matches-section-title">
              {fan.teamColors?.primaryColor ? '⭐' : '🏏'} My Team
            </p>
            <div
              className="glass-card"
              style={{
                padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: '16px',
                borderColor: `${fan.teamColors?.primaryColor || 'var(--team-primary)'}44`,
                background: `rgba(var(--team-rgb,99,102,241),0.06)`,
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>
                {matches.find((m) => m.team1.id === fan.teamId || m.team2.id === fan.teamId)?.team1.id === fan.teamId
                  ? matches.find((m) => m.team1.id === fan.teamId)?.team1.crestEmoji
                  : matches.find((m) => m.team2.id === fan.teamId)?.team2.crestEmoji || '🏏'}
              </span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--team-primary)', marginBottom: '4px' }}>
                  {fan.teamId} Fan
                </p>
                {(() => {
                  const teamMatch = matches.find((m) => m.team1.id === fan.teamId || m.team2.id === fan.teamId);
                  if (!teamMatch) return <p className="text-xs text-muted">No matches scheduled</p>;
                  if (teamMatch.status === 'LIVE') return (
                    <p className="text-xs text-secondary">
                      🔴 Playing now vs {teamMatch.team1.id === fan.teamId ? teamMatch.team2.shortName : teamMatch.team1.shortName}
                    </p>
                  );
                  if (teamMatch.status === 'UPCOMING') return (
                    <p className="text-xs text-secondary">
                      ⏰ Next: vs {teamMatch.team1.id === fan.teamId ? teamMatch.team2.shortName : teamMatch.team1.shortName} · {teamMatch.time}
                    </p>
                  );
                  return <p className="text-xs text-secondary">Last result: {teamMatch.result || 'Match completed'}</p>;
                })()}
              </div>
              {(() => {
                const teamMatch = matches.find(
                  (m) => (m.team1.id === fan.teamId || m.team2.id === fan.teamId) && m.status === 'LIVE'
                );
                return teamMatch ? (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => navigate(`/match/${teamMatch.id}`)}
                    id="my-team-watch-btn"
                  >
                    Watch Live →
                  </button>
                ) : null;
              })()}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
