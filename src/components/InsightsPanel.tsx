import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Lightbulb, ArrowRight, X } from 'lucide-react';
import { Insight } from '../types/insights';
import { formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface InsightsPanelProps {
  insights: Insight[];
  onMarkAsRead?: (id: string) => void;
  maxDisplay?: number;
}

export const InsightsPanel = ({ insights, onMarkAsRead, maxDisplay = 5 }: InsightsPanelProps) => {
  const navigate = useNavigate();
  const unreadInsights = insights.filter(i => !i.read).slice(0, maxDisplay);

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getColor = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'success':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'info':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'tip':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    }
  };

  const handleAction = (insight: Insight) => {
    if (insight.action?.route) {
      navigate(insight.action.route);
    }
    if (onMarkAsRead) {
      onMarkAsRead(insight.id);
    }
  };

  if (unreadInsights.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <p className="text-gray-400 text-center py-8">
          You're all caught up! Check back later for new insights.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        {unreadInsights.length > 0 && (
          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
            {unreadInsights.length} new
          </span>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {unreadInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getColor(insight.type)} relative group`}
            >
              {onMarkAsRead && (
                <button
                  onClick={() => onMarkAsRead(insight.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {insight.title && (
                    <h4 className="font-medium text-white mb-1">{insight.title}</h4>
                  )}
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {insight.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(insight.createdAt, 'relative')}
                    </span>
                    {insight.action && (
                      <button
                        onClick={() => handleAction(insight)}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {insight.action.label}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InsightsPanel;
