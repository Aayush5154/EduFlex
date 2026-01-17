import { useState, useEffect } from 'react';
import { Trophy, Flame, Medal, Crown, Star, TrendingUp, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { leaderboardAPI } from '../api/api';
import { clsx } from 'clsx';

const getRankIcon = (rank) => {
    switch (rank) {
        case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
        case 2: return <Medal className="w-6 h-6 text-gray-300" />;
        case 3: return <Medal className="w-6 h-6 text-amber-600" />;
        default: return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank}</span>;
    }
};

const getRankBg = (rank) => {
    switch (rank) {
        case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
        case 2: return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/30';
        case 3: return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
        default: return 'bg-slate-800/50 border-slate-700/50';
    }
};

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await leaderboardAPI.getLeaderboard();
            setLeaderboard(res.data.data.leaderboard);
            setCurrentUser(res.data.data.currentUser);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner message="Loading leaderboard..." />
            </Layout>
        );
    }

    const xpProgress = currentUser ? ((currentUser.xpPoints % 500) / 500) * 100 : 0;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-4">
                        <Trophy className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 font-medium">Leaderboard</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Top Learners</h1>
                    <p className="text-gray-400">Compete with other students and climb the ranks!</p>
                </div>

                {/* Your Stats Card */}
                {currentUser && (
                    <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-2xl p-6 border border-primary-500/30">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {currentUser.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="text-primary-400">Rank #{currentUser.rank}</span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-purple-400">Level {currentUser.level}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
                                    <Zap className="w-6 h-6" />
                                    {currentUser.xpPoints} XP
                                </div>
                                <div className="flex items-center gap-1 text-orange-400 text-sm">
                                    <Flame className="w-4 h-4" />
                                    {currentUser.streak} day streak
                                </div>
                            </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Progress to Level {currentUser.level + 1}</span>
                                <span className="text-primary-400">{currentUser.xpToNextLevel} XP to go</span>
                            </div>
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${xpProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* XP Guide */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Earn XP By
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-sm">
                        <div className="bg-slate-700/50 rounded-lg p-2">
                            <div className="text-green-400 font-bold">+10 XP</div>
                            <div className="text-gray-400">Daily Login</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2">
                            <div className="text-blue-400 font-bold">+25 XP</div>
                            <div className="text-gray-400">Video Done</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2">
                            <div className="text-yellow-400 font-bold">+15 XP</div>
                            <div className="text-gray-400">Todo Done</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2">
                            <div className="text-orange-400 font-bold">+5 XP</div>
                            <div className="text-gray-400">Streak/day</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2">
                            <div className="text-purple-400 font-bold">+50 XP</div>
                            <div className="text-gray-400">Quiz Pass</div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            Top 20 Students
                        </h3>
                    </div>

                    <div className="divide-y divide-slate-700/50">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((student) => (
                                <div
                                    key={student.id}
                                    className={clsx(
                                        'flex items-center justify-between p-4 transition-colors',
                                        student.isCurrentUser
                                            ? 'bg-primary-500/10 border-l-4 border-primary-500'
                                            : 'hover:bg-slate-700/30',
                                        getRankBg(student.rank)
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}
                                        <div className="w-10 flex justify-center">
                                            {getRankIcon(student.rank)}
                                        </div>

                                        {/* Avatar & Name */}
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                                                student.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                                    student.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                                        student.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                                                            'bg-gradient-to-br from-slate-500 to-slate-600'
                                            )}>
                                                {student.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <div className={clsx(
                                                    'font-medium',
                                                    student.isCurrentUser ? 'text-primary-300' : 'text-white'
                                                )}>
                                                    {student.name}
                                                    {student.isCurrentUser && (
                                                        <span className="ml-2 text-xs bg-primary-500 px-2 py-0.5 rounded-full">You</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-400">Level {student.level}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-1 text-orange-400">
                                            <Flame className="w-4 h-4" />
                                            <span className="text-sm">{student.streak}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-yellow-400 font-bold">{student.xpPoints} XP</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                No students on the leaderboard yet. Be the first!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Leaderboard;
