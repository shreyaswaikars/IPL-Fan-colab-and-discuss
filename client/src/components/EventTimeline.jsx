import React from 'react';

const EVENT_ICONS = {
  SIX: '💥', FOUR: '🏏', WICKET: '🎯', FIFTY: '👏',
  CENTURY: '🏆', OVER_COMPLETE: '📊', MATCH_START: '🔔', MATCH_END: '🏅',
};

export default function EventTimeline({ events = [], onEventClick, highlightedId }) {
  if (!events.length) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
        <p className="text-sm">No events yet</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {[...events].reverse().map((event) => (
        <div
          key={event.id}
          className={`event-item${highlightedId === event.id ? ' highlighted' : ''}`}
          onClick={() => onEventClick?.(event)}
        >
          <div className={`event-icon event-${event.type}`}>
            {EVENT_ICONS[event.type] || '📌'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              {event.type !== 'OVER_COMPLETE' && event.type !== 'MATCH_START' && event.type !== 'MATCH_END' && (
                <span
                  className="badge"
                  style={{
                    background: 'rgba(var(--team-rgb,99,102,241),0.15)',
                    color: 'var(--team-primary)',
                    border: '1px solid rgba(var(--team-rgb,99,102,241),0.25)',
                    fontSize: '0.65rem',
                  }}
                >
                  {event.type}
                </span>
              )}
              <span className="text-xs text-muted">Over {event.over}</span>
            </div>
            {event.player && (
              <p className="text-sm font-semibold" style={{ marginBottom: '2px' }}>{event.player}</p>
            )}
            <p className="text-xs text-secondary" style={{ lineHeight: 1.4 }}>{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
