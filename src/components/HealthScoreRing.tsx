import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getHealthScoreColor, getGradeFromScore } from '../utils/formatters';

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}

export const HealthScoreRing = ({ 
  score, 
  size = 200, 
  strokeWidth = 12,
  animated = true 
}: HealthScoreRingProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;
  const color = getHealthScoreColor(score);
  const grade = getGradeFromScore(score);

  useEffect(() => {
    if (animated) {
      let start = 0;
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setDisplayScore(Math.round(easeOutQuart * score));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    } else {
      setDisplayScore(score);
    }
  }, [score, animated]);

  const gradeLabels = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Needs Work'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <div className="text-4xl font-bold" style={{ color }}>
            {displayScore}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {gradeLabels[grade]}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HealthScoreRing;
