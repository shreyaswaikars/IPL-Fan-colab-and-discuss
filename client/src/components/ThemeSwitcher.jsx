import React from 'react';
import { useFan } from '../context/FanContext.jsx';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useFan();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-sm"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        padding: 0,
        borderRadius: '50%',
        fontSize: '1.1rem',
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
