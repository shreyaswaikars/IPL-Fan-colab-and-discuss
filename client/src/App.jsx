import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useFan } from './context/FanContext.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import MatchRoomPage from './pages/MatchRoomPage.jsx';

function App() {
  const { fan } = useFan();

  return (
    <Routes>
      <Route
        path="/"
        element={fan ? <Navigate to="/matches" replace /> : <Navigate to="/onboarding" replace />}
      />
      <Route
        path="/onboarding"
        element={fan ? <Navigate to="/matches" replace /> : <OnboardingPage />}
      />
      <Route
        path="/matches"
        element={fan ? <HomePage /> : <Navigate to="/onboarding" replace />}
      />
      <Route
        path="/match/:id"
        element={fan ? <MatchRoomPage /> : <Navigate to="/onboarding" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
