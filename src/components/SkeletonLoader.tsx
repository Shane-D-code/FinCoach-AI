import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle' | 'chart';
  count?: number;
  className?: string;
}

export const SkeletonLoader = ({ variant = 'card', count = 1, className = '' }: SkeletonLoaderProps) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 ${className}`}>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-700 rounded w-1/4"></div>
              <div className="h-8 bg-slate-700 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-700 rounded"></div>
                <div className="h-3 bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`animate-pulse space-y-2 ${className}`}>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-4/6"></div>
          </div>
        );
      
      case 'circle':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="w-32 h-32 bg-slate-700 rounded-full"></div>
          </div>
        );
      
      case 'chart':
        return (
          <div className={`bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 ${className}`}>
            <div className="animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
              <div className="flex items-end justify-between h-48 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-700 rounded-t flex-1"
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </>
  );
};

export default SkeletonLoader;
