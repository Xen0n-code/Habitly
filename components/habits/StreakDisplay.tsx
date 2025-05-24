import React, { useState } from 'react';
import { getLocalDateString } from '../../types';

interface StreakDisplayProps {
  streak: number;
  lastCheckInDate: string | null; // YYYY-MM-DD
  onCheckIn: () => void;
  onUndoCheckIn: () => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className || "w-12 h-12"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);


const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, lastCheckInDate, onCheckIn, onUndoCheckIn }) => {
  const [isIncremented, setIsIncremented] = useState(false);
  const todayString = getLocalDateString(new Date());
  const alreadyCheckedInToday = lastCheckInDate === todayString;

  const handlePress = () => {
    if (!alreadyCheckedInToday) {
      onCheckIn();
      setIsIncremented(true);
      setTimeout(() => setIsIncremented(false), 400); // Animation duration
    }
  };
  
  let message = "クリックして今日の達成を記録！";
  if (alreadyCheckedInToday) {
    message = "今日の分は達成済みです！素晴らしい！";
  } else if (lastCheckInDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = getLocalDateString(yesterday);
    if (lastCheckInDate === yesterdayString) {
      message = "昨日も達成！今日も続けよう！";
    } else {
       message = "久しぶり！今日からまた頑張ろう！";
    }
  }


  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl shadow-xl text-center">
      <p className="text-lg text-gray-300 mb-2">現在の連続日数</p>
      <button
        onClick={handlePress}
        disabled={alreadyCheckedInToday}
        className={`
          w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56
          rounded-full flex flex-col items-center justify-center 
          font-bold text-6xl md:text-7xl lg:text-8xl
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-4
          ${isIncremented ? 'animate-streak-pop' : ''}
          ${alreadyCheckedInToday 
            ? 'bg-green-600 text-white cursor-not-allowed ring-green-500' 
            : 'bg-pink-500 hover:bg-pink-600 text-white ring-pink-400 transform hover:scale-105'
          }
        `}
        aria-label={alreadyCheckedInToday ? "達成済み" : "達成を記録"}
      >
        {alreadyCheckedInToday && streak > 0 ? <CheckIcon className="w-16 h-16 md:w-20 md:h-20 mb-1"/> : null}
        {streak}
      </button>
      <p className="mt-6 text-md text-gray-300">{message}</p>
      {!alreadyCheckedInToday && streak > 0 && (
        <p className="mt-2 text-sm text-yellow-400">素晴らしい継続です！</p>
      )}
       {streak === 0 && !alreadyCheckedInToday && (
        <p className="mt-2 text-sm text-gray-400">最初の1歩を踏み出そう！</p>
      )}
      {alreadyCheckedInToday && streak > 0 && (
        <button
          onClick={onUndoCheckIn}
          className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center"
          aria-label="今日の記録を取り消す"
        >
          <UndoIcon className="w-5 h-5 mr-1.5" />
          今日の記録を取り消す
        </button>
      )}
    </div>
  );
};

export default StreakDisplay;