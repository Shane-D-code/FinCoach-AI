import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Wifi, WifiOff, Shield, HelpCircle, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { user, updateUser, language, setLanguage, isOffline, setIsOffline, theme, toggleTheme } = useApp();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    incomeType: user.incomeType,
    monthlyIncome: user.monthlyIncome,
    riskProfile: user.riskProfile
  });
  const [showConsent, setShowConsent] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  const quizQuestions = [
    {
      question: 'How do you usually spend money?',
      options: ['Very carefully', 'Moderately', 'Freely', 'Impulsively']
    },
    {
      question: 'How often do you check your bank balance?',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
    },
    {
      question: 'What\'s your savings goal?',
      options: ['Emergency fund', 'Big purchase', 'Retirement', 'Just saving']
    },
    {
      question: 'How do you feel about investing?',
      options: ['Very interested', 'Somewhat interested', 'Cautious', 'Not interested']
    },
    {
      question: 'Your approach to budgeting?',
      options: ['Strict budget', 'Loose guidelines', 'Mental tracking', 'No budget']
    }
  ];

  const handleSave = () => {
    updateUser(formData);
    console.log('Settings saved:', formData);
  };

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      console.log('Quiz completed:', newAnswers);
      setQuizStep(0);
      setQuizAnswers([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <User className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Income Type</label>
            <select
              value={formData.incomeType}
              onChange={(e) => setFormData({ ...formData, incomeType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="gig">Gig/Freelance</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="self-employed">Self-employed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Income</label>
            <input
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData({ ...formData, monthlyIncome: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            <span>Save Changes</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Globe className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Language</h3>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="hi">हिन्दी</option>
          </select>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            {language === 'en' && 'Language preference saved'}
            {language === 'es' && 'Preferencia de idioma guardada'}
            {language === 'hi' && 'भाषा प्राथमिकता सहेजी गई'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              {isOffline ? <WifiOff className="text-purple-600" size={24} /> : <Wifi className="text-purple-600" size={24} />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Offline Mode</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Enable offline mode</span>
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isOffline ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  isOffline ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            When enabled, the app will use cached data
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
            <HelpCircle className="text-orange-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personalization Quiz</h3>
        </div>
        {quizStep < quizQuestions.length && quizAnswers.length === quizStep ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Question {quizStep + 1} of {quizQuestions.length}
            </p>
            <p className="text-lg text-gray-900 dark:text-white font-semibold">
              {quizQuestions[quizStep].question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizQuestions[quizStep].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-transparent hover:border-orange-500 rounded-lg text-left transition-all"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Complete our quick quiz to personalize your experience
            </p>
            <button
              onClick={() => {
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Start Quiz
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
            <Shield className="text-red-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Privacy & Security</h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">Data Consent Status</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Your data is encrypted and securely stored. We never share your personal information.
            </p>
            <button
              onClick={() => setShowConsent(!showConsent)}
              className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
            >
              {showConsent ? 'Hide' : 'View'} Privacy Policy
            </button>
            {showConsent && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2">
                  We collect minimal data necessary to provide our services. Your financial data is:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Encrypted at rest and in transit</li>
                  <li>Never sold to third parties</li>
                  <li>Used only for your personal financial insights</li>
                  <li>Deletable at any time upon request</li>
                </ul>
              </div>
            )}
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Masked Data:</strong> Sensitive account numbers are displayed as ****1234 for your security
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/register";
            }}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <Shield size={20} />
            <span>Reset Onboarding</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
