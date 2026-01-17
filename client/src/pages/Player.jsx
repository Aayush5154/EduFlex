import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Check,
    Plus,
    Play,
    Clock
} from 'lucide-react';
import Layout from '../components/Layout';
import VideoPlayer from '../components/VideoPlayer';
import NotesPanel from '../components/player/NotesPanel';
import VideoSummary from '../components/player/VideoSummary';
import VideoQuiz from '../components/player/VideoQuiz';
import VideoChatbot from '../components/player/VideoChatbot';
import AddVideoModal from '../components/player/AddVideoModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { playlistsAPI, progressAPI } from '../api/api';
import { cacheVideos, getCachedVideos } from '../db/db';
import { clsx } from 'clsx';

const Player = () => {
    const { playlistId, videoId } = useParams();
    const navigate = useNavigate();
    const { user, isTeacher } = useAuth();
    const { isOnline } = useOffline();

    const [playlist, setPlaylist] = useState(null);
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [videoProgress, setVideoProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showAddVideoModal, setShowAddVideoModal] = useState(false);

    // Check if current user owns this playlist
    const isOwner = user && playlist?.teacher &&
        (playlist.teacher._id === user.id || playlist.teacher._id === user._id ||
            playlist.teacher === user.id || playlist.teacher === user._id);

    useEffect(() => {
        fetchPlaylistData();
    }, [playlistId, isOnline]);

    useEffect(() => {
        if (videos.length > 0 && !currentVideo) {
            const firstIncomplete = videos.find(v => !videoProgress[v._id]?.isCompleted) || videos[0];
            if (videoId) {
                const targetVideo = videos.find(v => v._id === videoId);
                setCurrentVideo(targetVideo || firstIncomplete);
            } else {
                setCurrentVideo(firstIncomplete);
            }
        }
    }, [videos, videoId, videoProgress]);

    const fetchPlaylistData = async () => {
        try {
            if (isOnline) {
                const res = await playlistsAPI.getOne(playlistId);
                setPlaylist(res.data.data);
                setVideos(res.data.data.videos || []);
                await cacheVideos(res.data.data.videos || [], playlistId);

                // Fetch progress
                try {
                    const progressRes = await progressAPI.getPlaylistProgress(playlistId);
                    const progressMap = {};
                    progressRes.data.data.forEach(p => {
                        progressMap[p.video] = p;
                    });
                    setVideoProgress(progressMap);
                } catch (e) {
                    console.log('Progress fetch error:', e);
                }
            } else {
                const cached = await getCachedVideos(playlistId);
                setVideos(cached);
            }
        } catch (error) {
            console.error('Error fetching playlist:', error);
            const cached = await getCachedVideos(playlistId);
            setVideos(cached);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoSelect = (video) => {
        setCurrentVideo(video);
        navigate(`/playlist/${playlistId}/video/${video._id}`, { replace: true });
    };

    const handleVideoComplete = () => {
        if (currentVideo) {
            setVideoProgress(prev => ({
                ...prev,
                [currentVideo._id]: { ...prev[currentVideo._id], isCompleted: true, percentComplete: 100 }
            }));
        }
    };

    const handleCompleteAndContinue = () => {
        handleVideoComplete();
        const currentIndex = videos.findIndex(v => v._id === currentVideo?._id);
        if (currentIndex < videos.length - 1) {
            handleVideoSelect(videos[currentIndex + 1]);
        }
    };

    const getCompletionPercentage = () => {
        if (videos.length === 0) return 0;
        const completed = Object.values(videoProgress).filter(p => p.isCompleted).length;
        return Math.round((completed / videos.length) * 100);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner message="Loading course..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col lg:flex-row gap-6 h-full -mx-6 lg:-mx-8 -my-6 lg:-my-8">
                {/* Left Sidebar - Video List */}
                <div className={clsx(
                    'bg-slate-900 border-r border-slate-700/50 transition-all duration-300',
                    sidebarCollapsed ? 'lg:w-16' : 'lg:w-80',
                    'flex-shrink-0'
                )}>
                    <div className="p-4 border-b border-slate-700/50">
                        <div className="flex items-center justify-between">
                            {!sidebarCollapsed && (
                                <div>
                                    <h2 className="font-semibold text-white line-clamp-2">
                                        {playlist?.title || 'Playlist'}
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {getCompletionPercentage()}% Complete
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                {sidebarCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {!sidebarCollapsed && (
                        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                            {videos.map((video, index) => {
                                const progress = videoProgress[video._id];
                                const isActive = currentVideo?._id === video._id;
                                const isCompleted = progress?.isCompleted;

                                return (
                                    <button
                                        key={video._id}
                                        onClick={() => handleVideoSelect(video)}
                                        className={clsx(
                                            'w-full text-left p-3 border-b border-slate-700/30 transition-colors flex items-start gap-3',
                                            isActive
                                                ? 'bg-primary-500/20 border-l-2 border-l-primary-500'
                                                : 'hover:bg-slate-800'
                                        )}
                                    >
                                        <div className={clsx(
                                            'w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                                            isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-slate-700 text-gray-400'
                                        )}>
                                            {isCompleted ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <span className="text-xs">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx(
                                                'text-sm line-clamp-2',
                                                isActive ? 'text-white font-medium' : 'text-gray-300'
                                            )}>
                                                {video.title}
                                            </p>
                                            {video.duration && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDuration(video.duration)}
                                                </span>
                                            )}
                                        </div>
                                        {isActive && <Play className="w-4 h-4 text-primary-400 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Center - Video Player */}
                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <Link
                        to="/playlists"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to courses
                    </Link>

                    <h1 className="text-2xl font-bold text-white mb-4">
                        {playlist?.title}
                    </h1>

                    {currentVideo ? (
                        <>
                            <VideoPlayer
                                video={currentVideo}
                                playlistId={playlistId}
                                onComplete={handleVideoComplete}
                            />

                            <div className="mt-4">
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    {currentVideo.title}
                                </h2>

                                <div className="flex flex-wrap gap-3 mt-4">
                                    <button
                                        onClick={handleCompleteAndContinue}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Complete and continue
                                    </button>
                                    {isOwner && (
                                        <button
                                            onClick={() => setShowAddVideoModal(true)}
                                            className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Video
                                        </button>
                                    )}
                                </div>

                                {/* AI Features - Summary & Quiz */}
                                <div className="mt-6 space-y-4">
                                    <VideoSummary
                                        videoId={currentVideo._id}
                                        videoTitle={currentVideo.title}
                                    />
                                    <VideoQuiz
                                        videoId={currentVideo._id}
                                        videoTitle={currentVideo.title}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-800 rounded-xl p-12 text-center">
                            <Play className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
                            <p className="text-gray-400">
                                {isOwner ? 'Add videos to this playlist to get started.' : 'Check back later for content.'}
                            </p>
                            {isOwner && (
                                <button
                                    onClick={() => setShowAddVideoModal(true)}
                                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                                >
                                    Add First Video
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Notes Panel */}
                <NotesPanel
                    video={currentVideo}
                    playlistId={playlistId}
                />
            </div>

            {/* Add Video Modal */}
            {showAddVideoModal && (
                <AddVideoModal
                    playlistId={playlistId}
                    onClose={() => setShowAddVideoModal(false)}
                    onSuccess={() => {
                        setShowAddVideoModal(false);
                        fetchPlaylistData();
                    }}
                />
            )}

            {/* Video Chatbot */}
            {currentVideo && (
                <VideoChatbot
                    videoId={currentVideo._id}
                    videoTitle={currentVideo.title}
                />
            )}
        </Layout>
    );
};

export default Player;
