import React from 'react';

const TICKER_EVENTS = [
  { text: '💥 Rohit Sharma hits a SIX off Jadeja! · MI vs CSK' },
  { text: '🎯 Bumrah gets Gaikwad for 64! · MI vs CSK' },
  { text: '🏏 Phil Salt drives a gorgeous FOUR · KKR vs RCB' },
  { text: '👏 Ruturaj Gaikwad FIFTY off 38 balls! · MI vs CSK' },
  { text: '📊 End of over 16: CSK 136/4 · Need 52 off 24' },
  { text: '💥 Dhoni helicopter shot for SIX! The crowd erupts!' },
  { text: '🔴 KKR vs RCB LIVE at Eden Gardens · 198 fans watching' },
  { text: '🏆 CSK beat SRH by 18 runs · Yesterday\'s result' },
];

export default function LiveTicker({ matches = [] }) {
  // Build ticker items from live match events or use defaults
  const items = matches.length > 0
    ? matches
        .filter((m) => m.status === 'LIVE')
        .flatMap((m) =>
          (m.events || []).slice(0, 3).map((e) => ({
            text: `${e.description} · ${m.team1.shortName} vs ${m.team2.shortName}`,
          }))
        )
    : TICKER_EVENTS;

  const displayItems = items.length > 0 ? items : TICKER_EVENTS;
  // Duplicate for seamless loop
  const doubled = [...displayItems, ...displayItems];

  return (
    <div className="ticker-wrapper" style={{ margin: '0 0 4px' }}>
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', padding: '0 8px' }}>
            {item.text}
            {i < doubled.length - 1 && <span style={{ margin: '0 16px', color: 'var(--text-muted)', opacity: 0.5 }}>·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
