import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { FanProvider } from './context/FanContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FanProvider>
        <App />
      </FanProvider>
    </BrowserRouter>
  </React.StrictMode>
);
