import React from 'react';

export default function TeamBadge({ teamId, teamName, primaryColor, size = 'sm' }) {
  const fontSize = size === 'sm' ? '0.7rem' : '0.8rem';
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';

  return (
    <span
      className="badge"
      style={{
        background: primaryColor ? `${primaryColor}22` : 'rgba(var(--team-rgb,99,102,241),0.15)',
        color: primaryColor || 'var(--team-primary)',
        border: `1px solid ${primaryColor ? primaryColor + '55' : 'rgba(var(--team-rgb,99,102,241),0.3)'}`,
        fontSize,
        padding,
        fontWeight: 700,
      }}
    >
      {teamId || teamName}
    </span>
  );
}
