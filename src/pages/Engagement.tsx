import { motion } from 'framer-motion';
import { Trophy, Users, Bell, Heart, TrendingUp } from 'lucide-react';
import { leaderboard, alerts } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function Engagement() {
  const { user } = useApp();

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community & Engagement</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect, compete, and grow together</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trophy size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Leaderboard</h3>
              <p className="text-yellow-100">See how you rank!</p>
            </div>
          </div>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * entry.rank }}
                className={`p-4 rounded-xl backdrop-blur-sm ${
                  entry.rank === 1
                    ? 'bg-white/30 border-2 border-white shadow-lg'
                    : 'bg-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </span>
                    <div>
                      <p className="font-bold">{entry.name}</p>
                      <p className="text-sm text-yellow-100">{entry.streak} day streak</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{entry.savings.toLocaleString()}</p>
                    <p className="text-xs text-yellow-100">saved</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Bell className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * alert.id }}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'warning'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : alert.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                } ${!alert.read ? 'ring-2 ring-blue-500 ring-opacity-50' : 'opacity-70'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className={`font-semibold ${
                    alert.type === 'warning'
                      ? 'text-red-800 dark:text-red-200'
                      : alert.type === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {alert.message}
                  </p>
                  {!alert.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{alert.date}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
            <Users className="text-purple-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Community Support</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Help Sarah reach her goal', needed: 500, raised: 320, supporters: 12 },
            { name: 'Emergency fund for John', needed: 1000, raised: 750, supporters: 25 },
            { name: 'Support Maria\'s education', needed: 2000, raised: 1200, supporters: 38 }
          ].map((campaign, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">{campaign.name}</h4>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round((campaign.raised / campaign.needed) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    style={{ width: `${(campaign.raised / campaign.needed) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ₹{campaign.raised} of ₹{campaign.needed}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {campaign.supporters} supporters
                </span>
              </div>
              <button
                onClick={() => console.log('Donate clicked')}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Heart size={16} />
                <span>Support</span>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Anonymous Spending Comparison</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { category: 'Groceries', you: 400, average: 450 },
            { category: 'Dining Out', you: 300, average: 350 },
            { category: 'Entertainment', you: 150, average: 200 }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">{item.category}</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">You</p>
                  <p className="text-2xl font-bold text-blue-600">₹{item.you}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Community Avg</p>
                  <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">₹{item.average}</p>
                </div>
                {item.you < item.average && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    You're saving ₹{item.average - item.you}!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
