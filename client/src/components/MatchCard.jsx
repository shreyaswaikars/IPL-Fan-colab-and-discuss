import React from 'react';
import { useNavigate } from 'react-router-dom';
import TeamBadge from './TeamBadge.jsx';

function StatusBadge({ status }) {
  if (status === 'LIVE') return <span className="badge badge-live">LIVE</span>;
  if (status === 'UPCOMING') return <span className="badge badge-upcoming">⏰ UPCOMING</span>;
  return <span className="badge badge-completed">✅ COMPLETED</span>;
}

export default function MatchCard({ match }) {
  const navigate = useNavigate();
  const { team1, team2, status, venue, time, result, fanCount, target, crr, rrr } = match;

  const handleClick = () => {
    if (status !== 'UPCOMING') navigate(`/match/${match.id}`);
  };

  return (
    <div
      className={`glass-card${status !== 'UPCOMING' ? ' glass-card-interactive' : ''}`}
      onClick={handleClick}
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
      id={`match-card-${match.id}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StatusBadge status={status} />
        {status === 'LIVE' && fanCount > 0 && (
          <span className="text-xs text-muted">👥 {fanCount.toLocaleString()} fans</span>
        )}
        {status === 'UPCOMING' && (
          <span className="text-xs text-muted">{time}</span>
        )}
      </div>

      {/* Teams & Score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* Team 1 */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.6rem' }}>{team1.crestEmoji}</span>
            <div>
              <p className="text-xs text-muted">{team1.shortName}</p>
              {status !== 'UPCOMING' && (
                <p className="text-lg font-extrabold" style={{ color: team1.primaryColor, lineHeight: 1 }}>
                  {team1.score !== null ? `${team1.score}/${team1.wickets}` : '-'}
                </p>
              )}
            </div>
          </div>
          {status !== 'UPCOMING' && team1.overs !== null && (
            <p className="text-xs text-muted">({team1.overs} ov)</p>
          )}
        </div>

        {/* VS */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <p className="text-xs text-muted font-bold">VS</p>
          {status === 'LIVE' && target && (
            <div style={{ marginTop: '4px' }}>
              <p className="text-xs" style={{ color: 'var(--amber)', fontWeight: 700 }}>T: {target}</p>
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', justifyContent: 'flex-end' }}>
            <div>
              <p className="text-xs text-muted">{team2.shortName}</p>
              {status !== 'UPCOMING' && (
                <p className="text-lg font-extrabold" style={{ color: team2.primaryColor, lineHeight: 1 }}>
                  {team2.score !== null ? `${team2.score}/${team2.wickets}` : '-'}
                </p>
              )}
            </div>
            <span style={{ fontSize: '1.6rem' }}>{team2.crestEmoji}</span>
          </div>
          {status !== 'UPCOMING' && team2.overs !== null && (
            <p className="text-xs text-muted">({team2.overs} ov)</p>
          )}
        </div>
      </div>

      {/* Live CRR/RRR */}
      {status === 'LIVE' && (crr || rrr) && (
        <div style={{ display: 'flex', gap: '12px' }}>
          {crr && <span className="text-xs" style={{ color: 'var(--green)', fontWeight: 700 }}>CRR: {crr.toFixed(2)}</span>}
          {rrr && <span className="text-xs" style={{ color: 'var(--amber)', fontWeight: 700 }}>RRR: {rrr.toFixed(2)}</span>}
        </div>
      )}

      {/* Result */}
      {result && (
        <p className="text-xs font-semibold" style={{ color: 'var(--green)', background: 'rgba(34,197,94,0.08)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,197,94,0.2)' }}>
          🏆 {result}
        </p>
      )}

      {/* Venue */}
      <p className="text-xs text-muted">📍 {venue}</p>

      {/* CTA */}
      {status !== 'UPCOMING' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--team-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
          <span>{status === 'LIVE' ? 'Join the Fan Room' : 'View Match'}</span>
          <span>→</span>
        </div>
      )}
    </div>
  );
}
