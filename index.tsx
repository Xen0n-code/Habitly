import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated for React 19
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { HashRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("ルート要素が見つかりませんでした。");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);