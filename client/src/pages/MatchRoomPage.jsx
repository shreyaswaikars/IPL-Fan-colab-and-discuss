import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFan } from '../context/FanContext.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { getMatch, getLiveScore } from '../api/matchesApi.js';
import Scorecard from '../components/Scorecard.jsx';
import EventTimeline from '../components/EventTimeline.jsx';
import ChatRoom from '../components/ChatRoom.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import AICommentator from '../components/AICommentator.jsx';
import FanList from '../components/FanList.jsx';
import TeamBadge from '../components/TeamBadge.jsx';
import ThemeSwitcher from '../components/ThemeSwitcher.jsx';

const AI_TRIGGER_TYPES = ['SIX', 'WICKET', 'FIFTY', 'CENTURY', 'MATCH_START', 'MATCH_END'];

export default function MatchRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fan } = useFan();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [highlightedEvent, setHighlightedEvent] = useState(null);

  // Enrich fan profile with team colors for socket
  const fanForSocket = fan
    ? { id: fan.id, displayName: fan.displayName, teamId: fan.teamId, teamColors: fan.teamColors }
    : null;

  const { connected, roomState, sendMessage, sendReaction, triggerAiEvent } = useSocket(id, fanForSocket);

  useEffect(() => {
    if (!id) return;
    
    const fetchMatchData = async () => {
      try {
        const data = await getMatch(id);
        setMatch(data.match);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchMatchData();
    const interval = setInterval(fetchMatchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [id]);

  // Auto-trigger AI commentary for first AI-worthy event
  useEffect(() => {
    if (!match || !connected) return;
    const aiEvents = (match.events || []).filter((e) => AI_TRIGGER_TYPES.includes(e.type));
    if (aiEvents.length > 0 && roomState.aiCommentary.length === 0) {
      // Trigger commentary for the most recent AI-worthy event after a short delay
      setTimeout(() => {
        triggerAiEvent(aiEvents[0], match);
      }, 2000);
    }
  }, [match?.id, connected]);

  const handleEventClick = (event) => {
    setHighlightedEvent(event.id === highlightedEvent ? null : event.id);
    if (AI_TRIGGER_TYPES.includes(event.type)) {
      triggerAiEvent(event, match);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '2rem' }}>🏏</div>
        <p className="text-secondary">Loading match room...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '2.5rem' }}>😕</div>
        <p className="text-secondary">Match not found</p>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/matches')}>← Back to matches</button>
      </div>
    );
  }

  const team1Color = match.team1?.primaryColor;
  const team2Color = match.team2?.primaryColor;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button id="back-to-matches-btn" className="btn btn-ghost btn-sm" onClick={() => navigate('/matches')}>
            ← Matches
          </button>
          <ThemeSwitcher />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>{match.team1.crestEmoji}</span>
          <span className="text-sm font-extrabold" style={{ color: team1Color }}>{match.team1.shortName}</span>
          <span className="text-xs text-muted">vs</span>
          <span className="text-sm font-extrabold" style={{ color: team2Color }}>{match.team2.shortName}</span>
          <span style={{ fontSize: '1.2rem' }}>{match.team2.crestEmoji}</span>
          {match.status === 'LIVE' && <span className="badge badge-live">LIVE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: connected ? 'var(--green)' : 'var(--text-muted)' }} />
            <span className="text-xs text-muted">{roomState.fans.length} fan{roomState.fans.length !== 1 ? 's' : ''}</span>
          </div>
          {fan?.teamId && <TeamBadge teamId={fan.teamId} primaryColor={fan.teamColors?.primaryColor} />}
        </div>
      </nav>

      {/* 3-Panel Layout */}
      <div className="match-room-layout">
        {/* LEFT: Scorecard + Event Timeline */}
        <div className="match-room-panel">
          <div className="glass-card" style={{ flexShrink: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="text-sm">📊</span>
              <span className="text-sm font-semibold">Scorecard</span>
            </div>
            <Scorecard match={match} />
          </div>

          <div className="glass-card" style={{ flex: 1, minHeight: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="text-sm">📋</span>
              <span className="text-sm font-semibold">Match Events</span>
              <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>Click to react</span>
            </div>
            <div style={{ padding: '8px', overflowY: 'auto', maxHeight: '400px' }}>
              <EventTimeline
                events={match.events}
                onEventClick={handleEventClick}
                highlightedId={highlightedEvent}
              />
            </div>
          </div>
        </div>

        {/* CENTER: Chat Room */}
        <div className="match-room-center">
          <ChatRoom
            messages={roomState.messages}
            onSend={sendMessage}
            connected={connected}
          />
        </div>

        {/* RIGHT: Reactions + AI + Fan List */}
        <div className="match-room-panel match-room-right">
          {/* Reaction Bar */}
          <div className="glass-card" style={{ padding: '16px', flexShrink: 0 }}>
            <ReactionBar
              reactions={roomState.reactions}
              onReact={sendReaction}
              eventId={highlightedEvent || 'general'}
            />
            {highlightedEvent && (
              <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(var(--team-rgb,99,102,241),0.08)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="text-xs text-secondary">Reacting to selected event</p>
                <button
                  className="text-xs"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setHighlightedEvent(null)}
                >
                  ✕ Clear
                </button>
              </div>
            )}
          </div>

          {/* AI Commentator */}
          <div className="glass-card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span>🤖</span>
              <span className="text-sm font-semibold">AI Commentator</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(168,85,247,0.15)', color: '#a78bfa', marginLeft: 'auto' }}>
                GEMINI
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <AICommentator commentary={roomState.aiCommentary} />
            </div>
          </div>

          {/* Fan List */}
          <div className="glass-card" style={{ flexShrink: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👥</span>
              <span className="text-sm font-semibold">In This Room</span>
              <span className="badge badge-team" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                {roomState.fans.length}
              </span>
            </div>
            <div style={{ padding: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              <FanList fans={roomState.fans} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
