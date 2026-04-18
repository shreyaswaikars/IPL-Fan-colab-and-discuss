import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFan } from '../context/FanContext.jsx';
import TeamBadge from './TeamBadge.jsx';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoom({ messages = [], onSend, connected }) {
  const { fan } = useFan();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const msg = input.trim();
    if (!msg || !connected) return;
    onSend(msg);
    setInput('');
  }, [input, onSend, connected]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span style={{ fontSize: '1rem' }}>💬</span>
        <span className="text-sm font-semibold">Fan Chat</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: connected ? 'var(--green)' : 'var(--text-muted)', flexShrink: 0 }} />
          <span className="text-xs text-muted">{connected ? 'Live' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '8px' }}>
            <span style={{ fontSize: '2rem' }}>💬</span>
            <p className="text-sm">Be the first to react!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.fan?.id === fan?.id;
          const teamColor = msg.fan?.teamColors?.primaryColor;
          return (
            <div
              key={msg.id}
              className={`chat-message${isMe ? ' own' : ''}`}
              style={{ '--msg-team-color': teamColor || 'var(--team-primary)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="text-xs font-bold" style={{ color: teamColor || 'var(--team-primary)' }}>
                  {msg.fan?.displayName || 'Fan'}
                </span>
                {msg.fan?.teamId && (
                  <TeamBadge teamId={msg.fan.teamId} primaryColor={teamColor} />
                )}
                <span className="text-xs text-muted" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{msg.message}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? 'Type a message...' : 'Connecting...'}
          disabled={!connected}
          maxLength={500}
          id="chat-input"
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSend}
          disabled={!input.trim() || !connected}
          id="chat-send-btn"
          style={{ flexShrink: 0 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
