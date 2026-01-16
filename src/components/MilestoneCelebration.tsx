import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Trophy, Star, Flame, Gift, Target, Zap, Award,
    PartyPopper, Sparkles, TrendingUp, X
} from 'lucide-react';

interface MilestoneInfo {
    id: string;
    name: string;
    description: string;
    type: string;
    targetValue: number;
    currentValue: number;
    percentage: number;
    isCompleted: boolean;
    completedDate?: string;
    estimatedCompletionDate?: string;
    daysRemaining?: number;
}

interface MilestoneCelebrationProps {
    milestone: MilestoneInfo;
    onClose: () => void;
}

const MILESTONE_ICONS: Record<string, any> = {
    first_payment: PartyPopper,
    debt_paid: Trophy,
    halfway: Star,
    quarter: Flame,
    three_quarter: Gift,
    streak: Zap,
    total_paid: Award,
    default: Sparkles
};

const MILESTONE_COLORS: Record<string, string> = {
    first_payment: 'from-blue-500 to-purple-500',
    debt_paid: 'from-yellow-400 to-orange-500',
    halfway: 'from-green-400 to-emerald-500',
    quarter: 'from-pink-400 to-rose-500',
    three_quarter: 'from-indigo-400 to-purple-500',
    streak: 'from-orange-400 to-red-500',
    total_paid: 'from-cyan-400 to-blue-500',
    default: 'from-purple-400 to-pink-500'
};

export function MilestoneCelebration({ milestone, onClose }: MilestoneCelebrationProps) {
    useEffect(() => {
        // Trigger confetti
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const Icon = MILESTONE_ICONS[milestone.type] || MILESTONE_ICONS.default;
    const colorClass = MILESTONE_COLORS[milestone.type] || MILESTONE_COLORS.default;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.5, y: 100 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, y: 100 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${colorClass} p-8 text-white relative overflow-hidden`}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"
                    />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                        className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                        <Icon size={40} />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-center mb-2"
                    >
                        🎉 Congratulations!
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center text-white/90 text-lg"
                    >
                        {milestone.name}
                    </motion.p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-600 dark:text-gray-300 text-center mb-6"
                    >
                        {milestone.description}
                    </motion.p>

                    {/* Progress Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Progress</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {milestone.percentage.toFixed(0)}%
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${milestone.percentage}%` }}
                                transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
                                className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    ${milestone.currentValue.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    ${milestone.targetValue.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Motivational Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
                    >
                        <div className="flex items-start gap-3">
                            <Sparkles className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                {getMotivationalMessage(milestone)}
                            </p>
                        </div>
                    </motion.div>

                    {/* Action Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        onClick={onClose}
                        className={`w-full py-3 px-6 bg-gradient-to-r ${colorClass} text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all`}
                    >
                        Keep Going! 💪
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Milestone Progress Card (for showing upcoming milestones)
interface MilestoneProgressProps {
    milestones: MilestoneInfo[];
    className?: string;
}

export function MilestoneProgress({ milestones, className = '' }: MilestoneProgressProps) {
    const [celebratingMilestone, setCelebratingMilestone] = useState<MilestoneInfo | null>(null);

    // Check for newly completed milestones
    useEffect(() => {
        const justCompleted = milestones.find(m =>
            m.isCompleted &&
            m.completedDate &&
            new Date(m.completedDate).getTime() > Date.now() - 5000 // Within last 5 seconds
        );

        if (justCompleted) {
            setCelebratingMilestone(justCompleted);
        }
    }, [milestones]);

    const upcomingMilestones = milestones
        .filter(m => !m.isCompleted)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

    if (upcomingMilestones.length === 0) {
        return null;
    }

    return (
        <>
            <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Target className="text-purple-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Milestones</h3>
                </div>

                <div className="space-y-4">
                    {upcomingMilestones.map((milestone, index) => {
                        const Icon = MILESTONE_ICONS[milestone.type] || MILESTONE_ICONS.default;
                        const colorClass = MILESTONE_COLORS[milestone.type] || MILESTONE_COLORS.default;

                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center text-white flex-shrink-0`}>
                                        <Icon size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {milestone.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {milestone.description}
                                        </p>

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`}
                                                    style={{ width: `${milestone.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {milestone.percentage.toFixed(0)}%
                                            </span>
                                        </div>

                                        {milestone.daysRemaining !== undefined && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Estimated: {milestone.daysRemaining} days remaining
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Celebration Modal */}
            <AnimatePresence>
                {celebratingMilestone && (
                    <MilestoneCelebration
                        milestone={celebratingMilestone}
                        onClose={() => setCelebratingMilestone(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// Helper function for motivational messages
function getMotivationalMessage(milestone: MilestoneInfo): string {
    const messages: Record<string, string[]> = {
        first_payment: [
            "Every journey begins with a single step. You've taken yours!",
            "The hardest part is starting - and you've already done it!",
            "This is the beginning of your debt-free journey. Keep it up!"
        ],
        debt_paid: [
            "One less debt to worry about! You're crushing it!",
            "Debt eliminated! Your financial freedom is getting closer!",
            "That's another victory in your debt-free journey!"
        ],
        halfway: [
            "You're halfway there! The finish line is in sight!",
            "50% complete! Your dedication is paying off!",
            "Halfway to freedom! Keep up the amazing work!"
        ],
        quarter: [
            "25% progress! You're building unstoppable momentum!",
            "Quarter of the way there! Every payment counts!",
            "Great start! You're on the path to financial freedom!"
        ],
        three_quarter: [
            "75% complete! The finish line is so close!",
            "Almost there! Your hard work is about to pay off!",
            "Just a little more! You've got this!"
        ],
        default: [
            "Amazing progress! Keep up the great work!",
            "You're doing fantastic! Stay focused on your goals!",
            "Every step forward is a step toward freedom!"
        ]
    };

    const messageList = messages[milestone.type] || messages.default;
    return messageList[Math.floor(Math.random() * messageList.length)];
}
