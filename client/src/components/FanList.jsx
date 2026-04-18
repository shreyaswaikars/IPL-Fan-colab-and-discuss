import React from 'react';
import { useFan } from '../context/FanContext.jsx';
import TeamBadge from './TeamBadge.jsx';

export default function FanList({ fans = [] }) {
  const { fan: myFan } = useFan();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {fans.length === 0 && (
        <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '16px 0' }}>
          No fans online yet
        </p>
      )}
      {fans.map((f) => {
        const isMe = f.id === myFan?.id;
        const initials = f.displayName?.slice(0, 2).toUpperCase() || '??';
        return (
          <div
            key={f.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', borderRadius: 'var(--radius-md)',
              background: isMe ? 'rgba(var(--team-rgb,99,102,241),0.08)' : 'transparent',
              border: isMe ? '1px solid rgba(var(--team-rgb,99,102,241),0.2)' : '1px solid transparent',
              transition: 'background 0.2s',
            }}
          >
            <div
              className="fan-avatar online"
              style={{
                background: f.teamColors?.primaryColor
                  ? `${f.teamColors.primaryColor}33`
                  : 'rgba(var(--team-rgb,99,102,241),0.2)',
                color: f.teamColors?.primaryColor || 'var(--team-primary)',
                border: `2px solid ${f.teamColors?.primaryColor || 'var(--team-primary)'}66`,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="text-sm font-semibold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.displayName}
                </span>
                {isMe && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>you</span>}
              </div>
              {f.teamId && (
                <TeamBadge teamId={f.teamId} primaryColor={f.teamColors?.primaryColor} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
