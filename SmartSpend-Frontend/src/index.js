import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';   // ✅ correct import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>        {/* ✅ Wrap your entire app here */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
