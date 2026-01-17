import { useState, useEffect } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import PlaylistCard from '../components/PlaylistCard';
import CreatePlaylistModal from '../components/modals/CreatePlaylistModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { playlistsAPI } from '../api/api';
import { cachePlaylists, getCachedPlaylists } from '../db/db';

const categories = [
    'All',
    'Technology',
    'Mathematics',
    'Science',
    'Language',
    'Arts',
    'Other'
];

const Playlists = () => {
    const { isTeacher, user } = useAuth();
    const { isOnline } = useOffline();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchPlaylists();
    }, [isOnline, isTeacher]);

    const fetchPlaylists = async () => {
        try {
            if (isOnline) {
                const res = isTeacher
                    ? await playlistsAPI.getMyPlaylists()
                    : await playlistsAPI.getAll();
                setPlaylists(res.data.data);
                await cachePlaylists(res.data.data);
            } else {
                const cached = await getCachedPlaylists();
                setPlaylists(cached);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
            const cached = await getCachedPlaylists();
            setPlaylists(cached);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlaylist = async (playlistId) => {
        try {
            await playlistsAPI.delete(playlistId);
            // Remove from local state
            setPlaylists(prev => prev.filter(p => (p._id || p.id) !== playlistId));
        } catch (error) {
            console.error('Error deleting playlist:', error);
            throw error;
        }
    };

    const filteredPlaylists = playlists.filter(playlist => {
        const matchesSearch = playlist.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            playlist.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' ||
            playlist.category?.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner message="Loading playlists..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {isTeacher ? 'My Courses' : 'Explore Courses'}
                        </h1>
                        <p className="text-gray-400">
                            {isTeacher
                                ? 'Manage and create your educational content'
                                : 'Discover courses to enhance your learning'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 w-64"
                            />
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-5 h-5" />
                            Create
                        </button>
                    </div>
                </div>

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

                {/* Offline Indicator */}
                {!isOnline && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-yellow-400 text-sm">
                        You're offline. Showing cached courses.
                    </div>
                )}

                {/* Playlists Grid */}
                {filteredPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlaylists.map((playlist) => {
                            const isOwner = user && playlist.teacher &&
                                (playlist.teacher._id === user._id || playlist.teacher === user._id);
                            return (
                                <PlaylistCard
                                    key={playlist._id || playlist.id}
                                    playlist={playlist}
                                    isOwner={isOwner}
                                    onDelete={isOwner ? handleDeletePlaylist : undefined}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-xl p-12 text-center">
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No courses found
                        </h3>
                        <p className="text-gray-400 mb-4">
                            {searchQuery || selectedCategory !== 'All'
                                ? 'Try adjusting your search or filters'
                                : isTeacher
                                    ? 'Create your first course to get started!'
                                    : 'Check back later for new courses.'}
                        </p>
                        {isTeacher && !searchQuery && selectedCategory === 'All' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                            >
                                Create First Course
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <CreatePlaylistModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchPlaylists();
                    }}
                />
            )}
        </Layout>
    );
};

export default Playlists;
