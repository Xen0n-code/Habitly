import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { 
  getHabitById, 
  getStreakData, 
  checkInHabit, 
  getHabitLeaderboard, 
  joinHabit,
  updateHabit,
  undoCheckIn
} from '../services/firebaseService';
import type { Habit, StreakData } from '../types';
import { getLocalDateString } from '../types';
import StreakDisplay from '../components/habits/StreakDisplay';
import Leaderboard from '../components/habits/Leaderboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import EditHabitForm from '../components/habits/EditHabitForm'; // New component for editing

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

const EditIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);


const HabitDetailPage: React.FC = () => {
  const { habitId } = useParams<{ habitId: string }>();
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const location = useLocation();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [leaderboard, setLeaderboard] = useState<StreakData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [joinAttempted, setJoinAttempted] = useState(false);


  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (!habitId || !user) return;
    setIsLoading(true);
    try {
      let currentHabit = await getHabitById(habitId);
      setHabit(currentHabit);

      let userIsParticipant = currentHabit?.participantUids.includes(user.uid) ?? false;

      // Handle auto-join from invite link
      // Only run auto-join on initial load or if specifically triggered
      if (isInitialLoad && currentHabit && location.hash.includes(`/habits/${habitId}/join`) && !userIsParticipant && !joinAttempted) {
        setJoinAttempted(true); 
        setIsJoining(true);
        const joinSuccess = await joinHabit(habitId, user.uid);
        setIsJoining(false);
        
        currentHabit = await getHabitById(habitId); // Re-fetch habit to get updated participant list
        setHabit(currentHabit);
        userIsParticipant = currentHabit?.participantUids.includes(user.uid) ?? false;
        
        if (joinSuccess) {
          // Successfully joined
        } else {
          alert("招待リンクからの参加に失敗しました。習慣が存在しないか、既にメンバーかもしれません。");
        }
        navigate(`/habits/${habitId}`, { replace: true }); 
      }

      if (userIsParticipant && currentHabit) {
        const currentStreakData = await getStreakData(habitId, user.uid);
        setStreakData(currentStreakData);
      } else {
        setStreakData(null); 
      }
      
      const currentLeaderboardData = await getHabitLeaderboard(habitId);
      setLeaderboard(currentLeaderboardData);

    } catch (error) {
      console.error("習慣詳細のデータ取得エラー:", error);
      setHabit(null); 
    } finally {
      setIsLoading(false);
    }
  }, [habitId, user, navigate, location.hash, joinAttempted]); // Added location.hash and joinAttempted

  useEffect(() => {
    setJoinAttempted(false); // Reset for new habitId
  }, [habitId]);

  useEffect(() => {
    fetchData(true); // Pass true for initial load check
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
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); 
      const currentLeaderboard = await getHabitLeaderboard(habitId);
      setLeaderboard(currentLeaderboard);
    }
  };

  const handleUndoCheckIn = async () => {
    if (!habitId || !user || !streakData) return;
    const confirmUndo = window.confirm("本日のチェックイン記録を取り消しますか？");
    if (!confirmUndo) return;

    const updatedStreak = await undoCheckIn(habitId, user.uid);
    if (updatedStreak) {
      setStreakData(updatedStreak);
      const currentLeaderboard = await getHabitLeaderboard(habitId);
      setLeaderboard(currentLeaderboard);
      alert("本日の記録を取り消しました。");
    } else {
      alert("記録の取り消しに失敗しました。");
    }
  };
  
  const handleJoinHabit = async () => {
    if (!habitId || !user) return;
    setIsJoining(true);
    const success = await joinHabit(habitId, user.uid);
    if (success) {
      await fetchData(); // Re-fetch all data
    } else {
      alert("習慣への参加に失敗しました。");
    }
    setIsJoining(false);
  };

  const handleEditHabit = async (name: string, description: string) => {
    if (!habit || !habitId) return false;
    const success = await updateHabit(habitId, { name, description });
    if (success) {
      setHabit(prev => prev ? { ...prev, name, description } : null);
      setIsEditModalOpen(false);
      alert("習慣を更新しました。");
      return true;
    } else {
      alert("習慣の更新に失敗しました。");
      return false;
    }
  };

  const generateInviteLink = () => {
    if (!habit) return "";
    // Ensure hash is used correctly for HashRouter compatibility
    return `${window.location.origin}${window.location.pathname}#/habits/${habit.id}/join`;
  };

  const copyInviteLink = () => {
    const link = generateInviteLink();
    if (!link) {
        alert('招待リンクの生成に失敗しました。');
        return;
    }
    navigator.clipboard.writeText(link).then(() => {
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
    }).catch(err => {
      console.error('リンクのコピーに失敗しました: ', err);
      alert('リンクのコピーに失敗しました。');
    });
  };


  if (isLoading && !habit) { // Show full page spinner only if no habit data yet
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><LoadingSpinner /></div>;
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
  const isOwner = user && habit.ownerId === user.uid;


  return (
    <div className="container mx-auto p-4 relative">
      {showConfetti && (
        Array.from({ length: 50 }).map((_, index) => (
          <div
            key={index}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 20 + 40}%`, 
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          />
        ))
      )}

      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeftIcon />
          全ての習慣に戻る
        </Link>
      </div>

      <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-300 mb-2 sm:mb-0">{habit.name}</h1>
            <div className="flex space-x-2">
              {isOwner && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm flex items-center"
                  aria-label="習慣を編集"
                >
                  <EditIcon />
                  <span className="ml-1.5 hidden sm:inline">編集</span>
                </button>
              )}
              <button 
                onClick={copyInviteLink}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm flex items-center"
              >
                <ShareIcon />
                <span className="ml-1.5 hidden sm:inline">{inviteLinkCopied ? "コピー完了" : "招待"}</span>
              </button>
            </div>
        </div>
        {habit.description && <p className="text-gray-400 mb-6 whitespace-pre-wrap">{habit.description}</p>}
        
        {isParticipant && streakData ? (
          <StreakDisplay
            streak={streakData.currentStreak}
            lastCheckInDate={streakData.lastCheckInDate}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
          />
        ) : user && !isParticipant ? (
           <div className="text-center py-6">
            <p className="text-lg text-gray-300 mb-4">この習慣にまだ参加していません。</p>
            <button
              onClick={handleJoinHabit}
              disabled={isJoining || isLoading} // Disable if loading main data too
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isJoining ? '参加処理中...' : 'この習慣に参加する'}
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">ログインしてこの習慣に参加または進捗を確認してください。</p>
        )}
      </div>
      
      {isLoading && <div className="my-4"><LoadingSpinner/></div>}
      {!isLoading && isParticipant && <Leaderboard leaderboard={leaderboard} currentUser={user} />}

      {isEditModalOpen && habit && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="習慣を編集">
          <EditHabitForm
            initialHabit={{ name: habit.name, description: habit.description || '' }}
            onSubmit={handleEditHabit}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default HabitDetailPage;