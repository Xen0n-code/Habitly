
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import HabitDetailPage from './pages/HabitDetailPage';
import { useAuthStatus } from './hooks/useAuthStatus';
import LoginPage from './pages/LoginPage';

const App: React.FC = () => {
  const { user, loading } = useAuthStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-xl text-gray-300">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/habits/:habitId" element={user ? <HabitDetailPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="text-center py-4 text-sm text-slate-500">
        © 2024 Habitly. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
    