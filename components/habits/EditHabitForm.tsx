import React, { useState, useEffect } from 'react';

interface EditHabitFormProps {
  initialHabit: { name: string; description: string };
  onSubmit: (name: string, description: string) => Promise<boolean | void>; // Allow boolean for success indication
  onCancel: () => void;
}

const EditHabitForm: React.FC<EditHabitFormProps> = ({ initialHabit, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialHabit.name);
  const [description, setDescription] = useState(initialHabit.description);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(initialHabit.name);
    setDescription(initialHabit.description);
  }, [initialHabit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('習慣の名前は必須です。');
      return;
    }
    setError('');
    setIsSubmitting(true);
    await onSubmit(name, description);
    setIsSubmitting(false);
    // onSubmit should handle closing the modal on success
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="editHabitName" className="block text-sm font-medium text-gray-300 mb-1">
          習慣の名前 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="editHabitName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500"
          placeholder="例: 毎朝ジョギングする"
          disabled={isSubmitting}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      <div>
        <label htmlFor="editHabitDescription" className="block text-sm font-medium text-gray-300 mb-1">
          説明（オプション）
        </label>
        <textarea
          id="editHabitDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500"
          placeholder="例: 健康のため、最低30分は走る"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex flex-col sm:flex-row-reverse sm:space-x-reverse sm:space-x-2 space-y-2 sm:space-y-0">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '変更を保存'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto justify-center bg-slate-600 hover:bg-slate-500 text-gray-200 font-semibold py-2 px-4 rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50 disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};

export default EditHabitForm;