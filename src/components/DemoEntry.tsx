import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DemoEntry() {
  const navigate = useNavigate();

  const handleStartFresh = () => {
    localStorage.clear();
    navigate('/register');
  };

  const handleContinue = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to FinCoach AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose how you'd like to proceed
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleStartFresh}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>🌱 Start Fresh (New User)</span>
          </button>

          <button
            onClick={handleContinue}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>📊 Continue to Dashboard</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Demo Mode - Development Only
        </p>
      </motion.div>
    </div>
  );
}
