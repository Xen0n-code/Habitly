
import React from 'react';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, loading } = useAuthStatus();

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-lg">認証情報を確認中...</p></div>;
  }
  
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">Habitlyへようこそ！</h1>
      <p className="text-lg text-gray-300 mb-8 max-w-md">
        新しい習慣を身につけ、友達と競い合いながら目標を達成しましょう。
        まずはGoogleアカウントでサインインしてください。
      </p>
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 flex items-center space-x-2 disabled:opacity-50"
      >
        <i className="fab fa-google"></i>
        <span>Googleでサインイン</span>
      </button>
    </div>
  );
};

export default LoginPage;
    