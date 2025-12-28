import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function YearlySpend() {
  const [yearlySpend, setYearlySpend] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(yearlySpend) > 0) {
      localStorage.setItem('yearlySpend', yearlySpend);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Yearly Spending Setup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What is your approximate yearly spending?</label>
            <input
              type="number"
              value={yearlySpend}
              onChange={(e) => setYearlySpend(e.target.value)}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
