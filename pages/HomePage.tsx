
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { createHabit, getUserHabits } from '../services/firebaseService';
import type { Habit } from '../types';
import AddHabitForm from '../components/habits/AddHabitForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const HomePage: React.FC = () => {
  const { user } = useAuthStatus();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHabits = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const userHabits = await getUserHabits(user.uid);
      setHabits(userHabits);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleAddHabit = async (name: string, description?: string) => {
    if (user) {
      const newHabit = await createHabit(user.uid, name, description);
      if (newHabit) {
        setHabits(prevHabits => [...prevHabits, newHabit]);
        setIsModalOpen(false);
        // Optionally, navigate to the new habit's page or show success message
      } else {
        alert("習慣の作成に失敗しました。");
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-400">あなたの習慣</h1>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-10 bg-slate-800 rounded-lg shadow-xl">
          <p className="text-xl text-gray-400 mb-4">まだ習慣が登録されていません。</p>
          <p className="text-gray-500">右下の「+」ボタンから新しい習慣を追加しましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <Link key={habit.id} to={`/habits/${habit.id}`} className="block group">
              <div className="bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:bg-slate-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <h2 className="text-2xl font-semibold text-blue-300 mb-2 group-hover:text-blue-200">{habit.name}</h2>
                <p className="text-gray-400 text-sm truncate">{habit.description || '説明がありません'}</p>
                <div className="mt-4 text-xs text-slate-500">
                  参加者: {habit.participantUids.length}人
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-pink-500 hover:bg-pink-600 text-white font-bold p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75"
        aria-label="新しい習慣を追加"
      >
        <PlusIcon />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新しい習慣を追加">
        <AddHabitForm onSubmit={handleAddHabit} />
      </Modal>
    </div>
  );
};

export default HomePage;
    