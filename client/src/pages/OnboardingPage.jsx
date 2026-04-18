import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFan } from '../context/FanContext.jsx';
import { registerGuest } from '../api/matchesApi.js';

const TEAMS = [
  { id: 'MI',   name: 'Mumbai Indians',           shortName: 'MI',   crestEmoji: '🔵', primaryColor: '#004BA0', secondaryColor: '#D1AB3E', textColor: '#FFFFFF' },
  { id: 'CSK',  name: 'Chennai Super Kings',       shortName: 'CSK',  crestEmoji: '🟡', primaryColor: '#F5A623', secondaryColor: '#1A237E', textColor: '#1A1A1A' },
  { id: 'RCB',  name: 'Royal Challengers Bengaluru', shortName: 'RCB', crestEmoji: '🔴', primaryColor: '#CC0000', secondaryColor: '#000000', textColor: '#FFFFFF' },
  { id: 'KKR',  name: 'Kolkata Knight Riders',     shortName: 'KKR',  crestEmoji: '🟣', primaryColor: '#3A225D', secondaryColor: '#D4AF37', textColor: '#FFFFFF' },
  { id: 'DC',   name: 'Delhi Capitals',             shortName: 'DC',   crestEmoji: '🔷', primaryColor: '#0078BC', secondaryColor: '#EF1C25', textColor: '#FFFFFF' },
  { id: 'PBKS', name: 'Punjab Kings',               shortName: 'PBKS', crestEmoji: '🦁', primaryColor: '#ED1B24', secondaryColor: '#A7A9AC', textColor: '#FFFFFF' },
  { id: 'RR',   name: 'Rajasthan Royals',           shortName: 'RR',   crestEmoji: '💗', primaryColor: '#EA1A85', secondaryColor: '#254AA5', textColor: '#FFFFFF' },
  { id: 'SRH',  name: 'Sunrisers Hyderabad',        shortName: 'SRH',  crestEmoji: '🧡', primaryColor: '#F7A721', secondaryColor: '#000000', textColor: '#1A1A1A' },
  { id: 'GT',   name: 'Gujarat Titans',             shortName: 'GT',   crestEmoji: '🦅', primaryColor: '#1B2A5E', secondaryColor: '#C8A951', textColor: '#FFFFFF' },
  { id: 'LSG',  name: 'Lucknow Super Giants',       shortName: 'LSG',  crestEmoji: '🦊', primaryColor: '#A72056', secondaryColor: '#00A9E0', textColor: '#FFFFFF' },
];

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '99,102,241';
}

export default function OnboardingPage() {
  const { setFanProfile } = useFan();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=identity, 2=team, 3=welcome
  const [form, setForm] = useState({ displayName: '', name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Preview team color on hover/select
  useEffect(() => {
    if (selectedTeam) {
      document.documentElement.style.setProperty('--team-primary', selectedTeam.primaryColor);
      document.documentElement.style.setProperty('--team-secondary', selectedTeam.secondaryColor);
      document.documentElement.style.setProperty('--team-rgb', hexToRgb(selectedTeam.primaryColor));
    }
  }, [selectedTeam]);

  function validate() {
    const errs = {};
    if (!form.displayName.trim()) errs.displayName = 'Display name is required';
    else if (form.displayName.trim().length < 2) errs.displayName = 'At least 2 characters';
    if (!form.name.trim()) errs.name = 'Full name is required';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!emailRe.test(form.email)) errs.email = 'Enter a valid email address';
    return errs;
  }

  function handleStep1Submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  }

  async function handleTeamSelect(team) {
    setSelectedTeam(team);
    setLoading(true);
    setApiError('');
    try {
      const data = await registerGuest({
        displayName: form.displayName.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        teamId: team.id,
      });
      setFanProfile({
        ...data.fan,
        teamColors: {
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
          textColor: team.textColor,
        },
      });
      setStep(3);
      setTimeout(() => navigate('/matches'), 2000);
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="onboarding-wrap">
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(var(--team-rgb,99,102,241),0.08) 0%, transparent 70%)', pointerEvents: 'none', transition: 'background 0.5s' }} />

      <div className="glass-card onboarding-card animate-slide-up">
        {/* Step indicators */}
        <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step-dot${s === step ? ' active' : s < step ? ' done' : ''}`} />
          ))}
        </div>

        {/* Step 1: Identity */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏏</div>
              <h1 className="text-3xl font-extrabold" style={{ letterSpacing: '-0.03em', marginBottom: '8px' }}>
                Join the <span className="text-team">IPL Fan Zone</span>
              </h1>
              <p className="text-secondary text-sm">React to live matches. Chat with fans. Experience cricket together.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="displayName">Fan Name (shown in chat)</label>
                <input
                  id="displayName" className={`input${errors.displayName ? ' error' : ''}`}
                  placeholder="e.g. RohitFan99" value={form.displayName}
                  onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                  maxLength={30}
                />
                {errors.displayName && <span className="form-error">{errors.displayName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName" className={`input${errors.name ? ' error' : ''}`}
                  placeholder="Your full name" value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  maxLength={80}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email" type="email" className={`input${errors.email ? ' error' : ''}`}
                  placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  maxLength={200}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>

            <div>
              <button id="step1-continue-btn" type="submit" className="btn btn-primary btn-lg w-full">
                Continue →
              </button>
              <p className="text-xs text-muted" style={{ marginTop: '10px', textAlign: 'center' }}>
                By continuing you agree to our fan community guidelines
              </p>
            </div>
          </form>
        )}

        {/* Step 2: Team Selection */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 className="text-2xl font-extrabold" style={{ marginBottom: '6px', letterSpacing: '-0.02em' }}>
                Pick Your <span className="text-team">Team</span>
              </h2>
              <p className="text-sm text-secondary">Your team colors will define your fan experience</p>
            </div>

            {apiError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)' }}>
                <p className="text-sm" style={{ color: 'var(--live-red)' }}>{apiError}</p>
              </div>
            )}

            <div className="team-grid">
              {TEAMS.map((team) => {
                const rgb = hexToRgb(team.primaryColor);
                const isSelected = selectedTeam?.id === team.id;
                return (
                  <div
                    key={team.id}
                    className={`team-select-card${isSelected ? ' selected' : ''}`}
                    style={{
                      '--card-team-primary': team.primaryColor,
                      '--card-team-rgb': rgb,
                    }}
                    onClick={() => !loading && handleTeamSelect(team)}
                    id={`team-btn-${team.id}`}
                  >
                    <div className="team-crest">{team.crestEmoji}</div>
                    <div style={{ textAlign: 'center' }}>
                      <p className="text-xs font-extrabold" style={{ color: team.primaryColor }}>{team.shortName}</p>
                      <p className="text-xs text-muted" style={{ lineHeight: 1.3, marginTop: '2px' }}>{team.name.split(' ').slice(-1)[0]}</p>
                    </div>
                    {isSelected && loading && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Joining...</span>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ alignSelf: 'flex-start' }}>
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Welcome */}
        {step === 3 && selectedTeam && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '4rem', animation: 'reaction-burst 0.6s ease' }}>{selectedTeam.crestEmoji}</div>
            <div>
              <h2 className="text-2xl font-extrabold" style={{ marginBottom: '8px' }}>
                Welcome, <span className="text-team">{form.displayName}</span>!
              </h2>
              <p className="text-secondary text-sm">
                You're rooting for <strong style={{ color: selectedTeam.primaryColor }}>{selectedTeam.name}</strong>
              </p>
            </div>
            <div className="animate-glow-pulse" style={{ padding: '12px 24px', borderRadius: 'var(--radius-full)', background: `${selectedTeam.primaryColor}22`, border: `1px solid ${selectedTeam.primaryColor}55`, color: selectedTeam.primaryColor, fontWeight: 700 }}>
              🏏 Taking you to the Fan Zone...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
