import React, { useState, useCallback } from 'react';

const REACTIONS = [
  { emoji: '💥', label: 'SIX!' },
  { emoji: '🏏', label: 'FOUR!' },
  { emoji: '🎯', label: 'WICKET' },
  { emoji: '🔥', label: 'ON FIRE' },
  { emoji: '😱', label: 'SHOCKED' },
  { emoji: '👏', label: 'CLASS' },
];

export default function ReactionBar({ reactions = {}, onReact, eventId = 'general' }) {
  const [recentlyReacted, setRecentlyReacted] = useState({});

  const handleReact = useCallback((emoji) => {
    onReact?.(emoji, eventId);
    setRecentlyReacted((prev) => ({ ...prev, [emoji]: true }));
    setTimeout(() => {
      setRecentlyReacted((prev) => ({ ...prev, [emoji]: false }));
    }, 500);
  }, [onReact, eventId]);

  const eventReactions = reactions[eventId] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        React to this match
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {REACTIONS.map(({ emoji, label }) => {
          const count = eventReactions[emoji] || 0;
          const isReacted = recentlyReacted[emoji];
          return (
            <button
              key={emoji}
              className={`reaction-btn${isReacted ? ' reacted' : ''}`}
              onClick={() => handleReact(emoji)}
              title={label}
            >
              <span>{emoji}</span>
              <span className="reaction-count" style={{ color: count > 0 ? 'var(--team-primary)' : undefined }}>
                {count > 0 ? count : label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
