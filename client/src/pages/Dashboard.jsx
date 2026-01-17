import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Plus,
    Sparkles,
    BookOpen,
    Clock,
    Users,
    TrendingUp,
    CheckCircle,
    PlayCircle,
    Filter
} from 'lucide-react';
import Layout from '../components/Layout';
import PlaylistCard from '../components/PlaylistCard';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CreatePlaylistModal from '../components/modals/CreatePlaylistModal';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { playlistsAPI, analyticsAPI, recommendationsAPI } from '../api/api';
import { cachePlaylists, getCachedPlaylists } from '../db/db';

const categories = [
    'All',
    'Next.js',
    'React.js',
    'MySQL',
    'MongoDB',
    'Prisma',
    'Tailwind',
    'Node.js',
    'Supabase'
];

const Dashboard = () => {
    const { user, isTeacher } = useAuth();
    const { isOnline } = useOffline();
    const [playlists, setPlaylists] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [isOnline, isTeacher]);

    const fetchData = async () => {
        try {
            if (isOnline) {
                // Fetch playlists
                const playlistRes = isTeacher
                    ? await playlistsAPI.getMyPlaylists()
                    : await playlistsAPI.getAll();
                setPlaylists(playlistRes.data.data);
                await cachePlaylists(playlistRes.data.data);

                // Fetch analytics
                const statsRes = isTeacher
                    ? await analyticsAPI.getTeacherStats()
                    : await analyticsAPI.getStudentStats();
                setStats(statsRes.data.data);

                // Fetch AI recommendations (students only)
                if (!isTeacher) {
                    try {
                        const recRes = await recommendationsAPI.get();
                        setRecommendations(recRes.data.data || []);
                    } catch (e) {
                        console.log('Recommendations not available');
                    }
                }
            } else {
                const cached = await getCachedPlaylists();
                setPlaylists(cached);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            const cached = await getCachedPlaylists();
            setPlaylists(cached);
        } finally {
            setLoading(false);
        }
    };

    const filteredPlaylists = playlists.filter(playlist => {
        const matchesSearch = playlist.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            playlist.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' ||
            playlist.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            playlist.title?.toLowerCase().includes(selectedCategory.toLowerCase());
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner message="Loading your dashboard..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            Learning Made Easy - <span className="text-primary-400">EduFlex</span>
                        </h1>
                        <p className="text-gray-400">
                            {isTeacher ? 'Manage your courses and track student progress' : 'Discover, learn, and grow at your own pace'}
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for a course"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 w-64"
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isTeacher ? (
                            <>
                                <StatCard icon={BookOpen} label="Total Courses" value={stats.totalPlaylists} color="primary" />
                                <StatCard icon={PlayCircle} label="Total Videos" value={stats.totalVideos} color="blue" />
                                <StatCard icon={Users} label="Enrolled Students" value={stats.enrolledStudents} color="green" />
                                <StatCard icon={Clock} label="Watch Time (mins)" value={stats.totalWatchTime} color="orange" />
                            </>
                        ) : (
                            <>
                                <StatCard icon={BookOpen} label="Enrolled Courses" value={stats.enrolledPlaylists} color="primary" />
                                <StatCard icon={Clock} label="Watch Time (mins)" value={stats.totalWatchTime} color="blue" />
                                <StatCard icon={CheckCircle} label="Completed Videos" value={stats.completedVideos} color="green" />
                                <StatCard icon={TrendingUp} label="Videos Watched" value={stats.videosWatched} color="orange" />
                            </>
                        )}
                    </div>
                )}

                {/* AI Recommendations Section */}
                {!isTeacher && recommendations.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">Recommended for You</h2>
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">AI Powered</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.slice(0, 3).map((playlist) => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                    showReason={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Playlists Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">
                            {isTeacher ? 'Your Courses' : 'All Courses'}
                        </h2>
                        <div className="flex items-center gap-2">
                            {!isOnline && (
                                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                                    Showing cached data
                                </span>
                            )}
                            {isTeacher && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Playlist
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredPlaylists.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPlaylists.map((playlist) => (
                                <PlaylistCard
                                    key={playlist._id || playlist.id}
                                    playlist={playlist}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {searchQuery || selectedCategory !== 'All'
                                    ? 'No courses found'
                                    : isTeacher
                                        ? 'No courses yet'
                                        : 'No courses available'}
                            </h3>
                            <p className="text-gray-400">
                                {searchQuery || selectedCategory !== 'All'
                                    ? 'Try adjusting your filters'
                                    : isTeacher
                                        ? 'Start creating your first course!'
                                        : 'Check back later for new courses.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <CreatePlaylistModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchData();
                    }}
                />
            )}
        </Layout>
    );
};

export default Dashboard;
