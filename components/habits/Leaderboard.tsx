
import React from 'react';
import type { StreakData, UserProfile } from '../../types';

interface LeaderboardProps {
  leaderboard: StreakData[];
  currentUser: UserProfile | null;
}

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 12.75 9.75H11.25A3.375 3.375 0 0 0 7.5 13.125V18.75m9 0h1.5M4.5 18.75h1.5m0 0A3.375 3.375 0 0 1 9.375 15h5.25A3.375 3.375 0 0 1 18 18.75m0 0c0 .621-.504 1.125-1.125 1.125H7.125A1.125 1.125 0 0 1 6 18.75m0 0H4.5" />
  </svg>
);


const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, currentUser }) => {
  if (leaderboard.length === 0) {
    return (
      <div className="mt-10 text-center">
        <p className="text-gray-400">まだ誰もランキングに参加していません。</p>
        <p className="text-gray-500 text-sm">友達を招待して競い合いましょう！</p>
      </div>
    );
  }

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400'; // Gold
    if (rank === 1) return 'text-gray-400';  // Silver
    if (rank === 2) return 'text-orange-400'; // Bronze
    return 'text-slate-500';
  };

  return (
    <div className="mt-12 bg-slate-800 p-6 rounded-xl shadow-xl">
      <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center">
        <TrophyIcon className="w-7 h-7 mr-3 text-yellow-400" />
        ランキング
      </h2>
      <ul className="space-y-4">
        {leaderboard.map((entry, index) => (
          <li
            key={entry.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow transition-all
              ${entry.userId === currentUser?.uid ? 'bg-blue-900 border-2 border-blue-500' : 'bg-slate-700 hover:bg-slate-600'}
            `}
          >
            <div className="flex items-center">
              <span className={`text-xl font-bold w-8 text-center mr-4 ${getRankColor(index)}`}>{index + 1}</span>
              {entry.userPhotoURL ? (
                <img src={entry.userPhotoURL} alt={entry.userName || 'User'} className="w-10 h-10 rounded-full mr-3 border-2 border-slate-600" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-slate-400 text-lg font-semibold mr-3">
                  {entry.userName ? entry.userName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <span className={`font-medium ${entry.userId === currentUser?.uid ? 'text-white' : 'text-gray-200'}`}>
                {entry.userName || '匿名ユーザー'}
                {entry.userId === currentUser?.uid && <span className="text-xs text-blue-400 ml-1">(あなた)</span>}
              </span>
            </div>
            <span className="text-xl font-bold text-pink-400">{entry.currentStreak} 日</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
    