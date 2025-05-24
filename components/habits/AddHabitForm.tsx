
import React, { useState } from 'react';

interface AddHabitFormProps {
  onSubmit: (name: string, description?: string) => void;
}

const AddHabitForm: React.FC<AddHabitFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('習慣の名前は必須です。');
      return;
    }
    setError('');
    onSubmit(name, description);
    setName(''); // Reset form
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="habitName" className="block text-sm font-medium text-gray-300 mb-1">
          習慣の名前 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="habitName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500"
          placeholder="例: 毎朝ジョギングする"
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      <div>
        <label htmlFor="habitDescription" className="block text-sm font-medium text-gray-300 mb-1">
          説明（オプション）
        </label>
        <textarea
          id="habitDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500"
          placeholder="例: 健康のため、最低30分は走る"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        習慣を追加する
      </button>
    </form>
  );
};

export default AddHabitForm;
    