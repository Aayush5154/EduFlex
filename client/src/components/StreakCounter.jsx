import { useState, useEffect } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { authAPI } from '../api/api';
import { clsx } from 'clsx';

const StreakCounter = () => {
    const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const fetchAndUpdateStreak = async () => {
            try {
                // First update the streak (marks today as active)
                const updateRes = await authAPI.updateStreak();
                setStreak(updateRes.data.data);

                // Trigger animation
                setAnimate(true);
                setTimeout(() => setAnimate(false), 1000);
            } catch (error) {
                console.error('Error updating streak:', error);
                // Try to just get the streak if update fails
                try {
                    const getRes = await authAPI.getStreak();
                    setStreak(getRes.data.data);
                } catch (e) {
                    console.error('Error fetching streak:', e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAndUpdateStreak();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg animate-pulse">
                <div className="w-5 h-5 bg-slate-700 rounded" />
                <div className="w-8 h-4 bg-slate-700 rounded" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {/* Current Streak */}
            <div className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300',
                streak.currentStreak > 0
                    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                    : 'bg-slate-800/50 border border-slate-700/50',
                animate && 'scale-110'
            )}>
                <Flame className={clsx(
                    'w-5 h-5 transition-all',
                    streak.currentStreak > 0 ? 'text-orange-400' : 'text-gray-500',
                    animate && 'animate-pulse'
                )} />
                <div className="flex flex-col">
                    <span className={clsx(
                        'text-lg font-bold leading-none',
                        streak.currentStreak > 0 ? 'text-orange-400' : 'text-gray-400'
                    )}>
                        {streak.currentStreak}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Day{streak.currentStreak !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Longest Streak */}
            {streak.longestStreak > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">
                        {streak.longestStreak}
                    </span>
                </div>
            )}
        </div>
    );
};

export default StreakCounter;
