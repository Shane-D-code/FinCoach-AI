import { useState, useEffect } from 'react';

interface DailySpendEntry {
  date: string;
  amount: number;
  category: string;
}

interface DailySpendProps {
  onSpendAdded: (newEntry: DailySpendEntry) => void;
  onDoneForToday?: () => void;
  forceShow?: boolean;
}

export default function DailySpend({ onSpendAdded, onDoneForToday, forceShow }: DailySpendProps) {
  const [showModal, setShowModal] = useState(false);
  const [dismissedToday, setDismissedToday] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (forceShow) {
      setShowModal(true);
    } else {
      // Check if user has entered spend for today or dismissed popup
      const today = new Date().toISOString().split('T')[0];
      const dailySpends: DailySpendEntry[] = JSON.parse(localStorage.getItem('dailySpends') || '[]');
      const hasTodaySpend = dailySpends.some(spend => spend.date === today);
      const dismissedToday = localStorage.getItem('popupDismissedDate') === today;
      if (!hasTodaySpend && !dismissedToday) {
        setShowModal(true);
      }
    }
  }, [forceShow]);

  const addSpend = () => {
    const amount = parseFloat(formData.amount);
    if (amount > 0 && formData.category) {
      const today = new Date().toISOString().split('T')[0];
      const newEntry: DailySpendEntry = {
        date: today,
        amount,
        category: formData.category
      };

      // Get existing entries
      const dailySpends: DailySpendEntry[] = JSON.parse(localStorage.getItem('dailySpends') || '[]');
      // Add new entry
      dailySpends.push(newEntry);
      // Save back to localStorage
      localStorage.setItem('dailySpends', JSON.stringify(dailySpends));

      setMessage('Spend added successfully!');
      setFormData({ amount: '', category: '' });
      onSpendAdded(newEntry);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const doneForToday = () => {
    // Mark popup as dismissed for today
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('popupDismissedDate', today);
    setDismissedToday(true);
    setShowModal(false);
    if (onDoneForToday) onDoneForToday();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Spent</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="0.00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Bills & Utilities">Bills & Utilities</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Personal Care">Personal Care</option>
          <option value="Home & Garden">Home & Garden</option>
          <option value="Travel">Travel</option>
          <option value="Insurance">Insurance</option>
          <option value="Investments">Investments</option>
          <option value="Gifts & Donations">Gifts & Donations</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={addSpend}
          disabled={!formData.amount || !formData.category}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Spend
        </button>
        <button
          type="button"
          onClick={doneForToday}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Done for Today
        </button>
      </div>
      {message && (
        <p className="mt-4 text-center text-green-600">{message}</p>
      )}
    </div>
  );

  return (
    <div>
      {(forceShow || showModal) && !dismissedToday && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Enter Today's Spending</h3>
            {formContent}
          </div>
        </div>
      )}
    </div>
  );
}
