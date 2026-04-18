import React from 'react';

function getBallClass(ball) {
  if (ball === '6') return 'ball ball-6';
  if (ball === '4') return 'ball ball-4';
  if (ball === 'W') return 'ball ball-W';
  return 'ball';
}

function getBallDisplay(ball) {
  if (ball === '6') return '6';
  if (ball === '4') return '4';
  if (ball === 'W') return 'W';
  if (ball === '0') return '•';
  return ball;
}

export default function Scorecard({ match }) {
  if (!match) return null;

  const { team1, team2, battingTeam, target, currentOver, crr, rrr, status, inningsCompleted, innings1Summary } = match;

  const batting = battingTeam === team1.id ? team1 : team2;
  const bowling = battingTeam === team1.id ? team2 : team1;

  const isLive = status === 'LIVE';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="scorecard" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Live Match Score */}
      {isLive && (
        <>
          {/* Batting team */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Batting</span>
              <span style={{ fontSize: '1rem' }}>{batting.crestEmoji}</span>
              <span className="text-sm font-bold" style={{ color: batting.primaryColor }}>{batting.shortName}</span>
            </div>
            <div className="score-display" style={{ color: 'var(--text-primary)' }}>
              {batting.score}/{batting.wickets}
              <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {' '}({batting.overs} ov)
              </span>
            </div>
            {target && (
              <div className="text-sm" style={{ marginTop: '6px', color: 'var(--amber)', fontWeight: 600 }}>
                Need {target - batting.score} off {Math.ceil((20 - batting.overs) * 6)} balls
              </div>
            )}
          </div>

          {/* Current over */}
          {currentOver && (
            <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-xs text-muted font-semibold" style={{ marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Over {currentOver.overNo}
              </p>
              <div className="over-balls">
                {currentOver.balls.map((b, i) => (
                  <div key={i} className={getBallClass(b)}>{getBallDisplay(b)}</div>
                ))}
              </div>
            </div>
          )}

          {/* CRR / RRR */}
          {(crr || rrr) && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {crr && (
                <div style={{ flex: 1, padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <p className="text-xs text-muted">CRR</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>{crr.toFixed(2)}</p>
                </div>
              )}
              {rrr && (
                <div style={{ flex: 1, padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <p className="text-xs text-muted">RRR</p>
                  <p className="text-lg font-bold" style={{ color: rrr > 12 ? 'var(--live-red)' : 'var(--amber)' }}>{rrr.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}

          {/* Bowling team score if 2nd innings */}
          {inningsCompleted >= 1 && innings1Summary && (
            <div style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-xs text-muted font-semibold" style={{ marginBottom: '4px', textTransform: 'uppercase' }}>1st Innings</p>
              <p className="text-sm">
                <span style={{ color: bowling.primaryColor, fontWeight: 700 }}>{bowling.shortName}</span>
                {' '}{innings1Summary.score}/{innings1Summary.wickets} ({innings1Summary.overs} ov)
              </p>
              <p className="text-xs text-muted">{innings1Summary.topScorer} · {innings1Summary.topBowler}</p>
            </div>
          )}
        </>
      )}

      {/* Completed match */}
      {isCompleted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <p className="text-xs text-muted font-semibold" style={{ marginBottom: '6px', textTransform: 'uppercase' }}>1st Innings</p>
            <p className="text-base font-bold">
              <span style={{ color: team1.primaryColor }}>{team1.shortName}</span>
              {' '}{team1.score}/{team1.wickets} ({team1.overs} ov)
            </p>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <p className="text-xs text-muted font-semibold" style={{ marginBottom: '6px', textTransform: 'uppercase' }}>2nd Innings</p>
            <p className="text-base font-bold">
              <span style={{ color: team2.primaryColor }}>{team2.shortName}</span>
              {' '}{team2.score}/{team2.wickets} ({team2.overs} ov)
            </p>
          </div>
          {match.result && (
            <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--green)' }}>🏆 {match.result}</p>
            </div>
          )}
        </div>
      )}

      {/* Venue */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
        <span className="text-sm">📍</span>
        <p className="text-xs text-muted">{match.venue}</p>
      </div>
    </div>
  );
}
