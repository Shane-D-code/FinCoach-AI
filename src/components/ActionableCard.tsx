import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionableCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
  color?: string;
  gradient?: string;
}

export const ActionableCard = ({
  title,
  description,
  icon: Icon,
  action,
  color = 'indigo',
  gradient = 'from-indigo-500 to-purple-500'
}: ActionableCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (action.onClick) {
      action.onClick();
    } else if (action.route) {
      navigate(action.route);
    }
  };

  const colorClasses = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40',
    green: 'bg-green-500/10 border-green-500/20 hover:border-green-500/40',
    blue: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
    purple: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all group ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo
      }`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{description}</p>

        <button className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors flex items-center gap-2">
          {action.label}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ActionableCard;
