import React, { createContext, useContext, useState, useEffect } from 'react';

const FanContext = createContext(null);

// Helper to convert hex color to RGB string "r,g,b"
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '99,102,241';
}

export function FanProvider({ children }) {
  const [fan, setFanState] = useState(() => {
    try {
      const stored = localStorage.getItem('ipl_fan_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('ipl_theme') || 'dark';
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ipl_theme', theme);
  }, [theme]);

  // Apply team colors to CSS root variables whenever fan changes
  useEffect(() => {
    if (fan?.teamColors) {
      const root = document.documentElement;
      root.style.setProperty('--team-primary', fan.teamColors.primaryColor);
      root.style.setProperty('--team-secondary', fan.teamColors.secondaryColor || fan.teamColors.primaryColor);
      root.style.setProperty('--team-text', fan.teamColors.textColor || '#ffffff');
      root.style.setProperty('--team-rgb', hexToRgb(fan.teamColors.primaryColor));
    }
  }, [fan]);

  const setFanProfile = (fanData) => {
    setFanState(fanData);
    localStorage.setItem('ipl_fan_profile', JSON.stringify(fanData));
  };

  const clearFanProfile = () => {
    setFanState(null);
    localStorage.removeItem('ipl_fan_profile');
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <FanContext.Provider value={{ fan, setFanProfile, clearFanProfile, hexToRgb, theme, toggleTheme }}>
      {children}
    </FanContext.Provider>
  );
}

export function useFan() {
  const ctx = useContext(FanContext);
  if (!ctx) throw new Error('useFan must be used within FanProvider');
  return ctx;
}
