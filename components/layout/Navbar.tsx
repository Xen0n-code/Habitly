
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStatus } from '../../hooks/useAuthStatus';

const Navbar: React.FC = () => {
  const { user, signOut, loading } = useAuthStatus();

  return (
    <nav className="bg-slate-800 shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
          Habitly
        </Link>
        <div className="flex items-center">
          {loading ? (
            <span className="text-sm text-gray-400">読み込み中...</span>
          ) : user ? (
            <>
              {user.photoURL && (
                <img src={user.photoURL} alt="User Avatar" className="w-8 h-8 rounded-full mr-3 border-2 border-blue-500"/>
              )}
              <span className="text-gray-300 mr-4 hidden sm:inline">{user.displayName || 'ユーザー'}</span>
              <button
                onClick={signOut}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                サインアウト
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Googleでサインイン
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
    