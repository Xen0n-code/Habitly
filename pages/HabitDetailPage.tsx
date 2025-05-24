
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { getHabitById, getStreakData, checkInHabit, getHabitLeaderboard, joinHabit } from '../services/firebaseService';
import type { Habit, StreakData, UserProfile } from '../types';
import { getLocalDateString } from '../types';
import StreakDisplay from '../components/habits/StreakDisplay';
import Leaderboard from '../components/habits/Leaderboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ArrowLeftIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const ShareIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0v-.093c0-.655.536-1.186 1.186-1.186h4.104a1.186 1.186 0 0 0 1.186-1.186V6.076a1.186 1.186 0 0 0-1.186-1.186H8.403a1.186 1.186 0 0 0-1.186 1.186v1.536Zm0 0c.093 0 .185.003.276.01M3.823 15.354a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0v-.093c0-.655.536-1.186 1.186-1.186h3.332a1.186 1.186 0 0 0 1.186-1.186V9.861a1.186 1.186 0 0 0-1.186-1.186H5.009a1.186 1.186 0 0 0-1.186 1.186v1.536Zm0 0c.093 0 .185.003.276.01m8.65-2.212a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0v-.093c0-.655.536-1.186 1.186-1.186h4.104a1.186 1.186 0 0 0 1.186-1.186V6.076a1.186 1.186 0 0 0-1.186-1.186H13.66a1.186 1.186 0 0 0-1.186 1.186v1.536Zm0 0c.093 0 .185.003.276.01M15 18.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0v-.093c0-.655-.536-1.186-1.186-1.186h-3.332a1.186 1.186 0 0 0-1.186-1.186v-1.536a1.186 1.186 0 0 0 1.186-1.186h3.332a1.186 1.186 0 0 0 1.186 1.186v1.536Zm0 0c.093 0 .185.003.276.01" />
  </svg>
);


const HabitDetailPage: React.FC = () => {
  const { habitId } = useParams<{ habitId: string }>();
  const { user } = useAuthStatus();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [leaderboard, setLeaderboard] = useState<StreakData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);


  const fetchData = useCallback(async () => {
    if (!habitId || !user) return;
    setIsLoading(true);
    try {
      const currentHabit = await getHabitById(habitId);
      setHabit(currentHabit);

      if (currentHabit && currentHabit.participantUids.includes(user.uid)) {
        const currentStreakData = await getStreakData(habitId, user.uid);
        setStreakData(currentStreakData);
      } else if (currentHabit) {
        // User is not a participant, but habit exists
        setStreakData(null); 
      }
      
      const currentLeaderboard = await getHabitLeaderboard(habitId);
      setLeaderboard(currentLeaderboard);

    } catch (error) {
      console.error("習慣詳細のデータ取得エラー:", error);
      setHabit(null); // Ensure habit is null on error
    } finally {
      setIsLoading(false);
    }
  }, [habitId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckIn = async () => {
    if (!habitId || !user || !streakData) return;
    const todayString = getLocalDateString(new Date());
    if (streakData.lastCheckInDate === todayString) {
      alert("今日は既にチェックイン済みです！");
      return;
    }

    const updatedStreak = await checkInHabit(habitId, user.uid);
    if (updatedStreak) {
      setStreakData(updatedStreak);
      // Trigger confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // Confetti lasts for 3 seconds
      // Refresh leaderboard
      const currentLeaderboard = await getHabitLeaderboard(habitId);
      setLeaderboard(currentLeaderboard);
    }
  };
  
  const handleJoinHabit = async () => {
    if (!habitId || !user) return;
    setIsJoining(true);
    const success = await joinHabit(habitId, user.uid);
    if (success) {
      // Re-fetch all data to reflect joined status
      await fetchData();
    } else {
      alert("習慣への参加に失敗しました。");
    }
    setIsJoining(false);
  };

  const generateInviteLink = () => {
    if (!habit) return "";
    return `${window.location.origin}${window.location.pathname}#/habits/${habit.id}/join`;
  };

  const copyInviteLink = () => {
    const link = generateInviteLink();
    navigator.clipboard.writeText(link).then(() => {
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
    }).catch(err => {
      console.error('リンクのコピーに失敗しました: ', err);
      alert('リンクのコピーに失敗しました。');
    });
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  if (!habit) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl text-red-400">習慣が見つかりません</h2>
        <Link to="/" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <ArrowLeftIcon /> ホームに戻る
        </Link>
      </div>
    );
  }

  const isParticipant = user && habit.participantUids.includes(user.uid);

  return (
    <div className="container mx-auto p-4 relative">
      {showConfetti && (
        Array.from({ length: 50 }).map((_, index) => (
          <div
            key={index}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 20 + 40}%`, // start around the counter
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          />
        ))
      )}

      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeftIcon />
          全ての習慣に戻る
        </Link>
      </div>

      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-4xl font-bold text-blue-300 mb-2 md:mb-0">{habit.name}</h1>
            <button 
              onClick={copyInviteLink}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center"
            >
              <ShareIcon />
              <span className="ml-2">{inviteLinkCopied ? "コピーしました！" : "招待リンクをコピー"}</span>
            </button>
        </div>
        {habit.description && <p className="text-gray-400 mb-6">{habit.description}</p>}
        
        {isParticipant && streakData ? (
          <StreakDisplay
            streak={streakData.currentStreak}
            lastCheckInDate={streakData.lastCheckInDate}
            onCheckIn={handleCheckIn}
          />
        ) : user && !isParticipant ? (
           <div className="text-center py-6">
            <p className="text-lg text-gray-300 mb-4">この習慣にまだ参加していません。</p>
            <button
              onClick={handleJoinHabit}
              disabled={isJoining}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isJoining ? '参加処理中...' : 'この習慣に参加する'}
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">ログインしてこの習慣に参加または進捗を確認してください。</p>
        )}
      </div>
      
      {isParticipant && <Leaderboard leaderboard={leaderboard} currentUser={user} />}
    </div>
  );
};

export default HabitDetailPage;
    