import React, { useEffect, useRef } from 'react';

const EVENT_ICONS = {
  SIX: '💥', FOUR: '🏏', WICKET: '🎯', FIFTY: '👏',
  CENTURY: '🏆', MATCH_START: '🔔', MATCH_END: '🏅',
};

export default function AICommentator({ commentary = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentary.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {commentary.length === 0 && (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🤖</div>
          <p className="text-xs">AI commentator is watching...</p>
        </div>
      )}
      {commentary.map((item) => (
        <div key={item.id} className="ai-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1rem' }}>🤖</span>
            <span
              className="badge"
              style={{
                background: 'rgba(99,102,241,0.2)',
                color: '#a78bfa',
                border: '1px solid rgba(99,102,241,0.35)',
                fontSize: '0.65rem',
              }}
            >
              {EVENT_ICONS[item.event?.type] || '📢'} AI COMMENTATOR
            </span>
            <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
              {new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm" style={{ lineHeight: 1.5, color: 'var(--text-primary)', fontStyle: 'italic' }}>
            "{item.commentary}"
          </p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
