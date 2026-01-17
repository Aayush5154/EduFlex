import { useState, useEffect } from 'react';
import { Download, Play, Trash2, Clock, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDownloadedVideos, removeDownloadedVideo } from '../db/db';
import { clsx } from 'clsx';

const Downloads = () => {
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);

    useEffect(() => {
        const fetchDownloads = async () => {
            const videos = await getDownloadedVideos();
            setDownloads(videos);
            setLoading(false);
        };
        fetchDownloads();
    }, []);

    const handleRemove = async (videoId) => {
        setRemoving(videoId);
        await removeDownloadedVideo(videoId);
        setDownloads(prev => prev.filter(v => v.id !== videoId));
        setRemoving(null);
    };

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner message="Loading downloads..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Downloads</h1>
                    <p className="text-gray-400">
                        Videos saved for offline viewing ({downloads.length} videos)
                    </p>
                </div>

                {downloads.length > 0 ? (
                    <div className="space-y-4">
                        {downloads.map((video) => (
                            <div
                                key={video.id}
                                className="glass-card p-4 flex items-center gap-4 group hover:bg-white/10 transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-40 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={video.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop'}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white mb-1 line-clamp-2">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Download className="w-4 h-4" />
                                            Downloaded
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(video.downloadedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/playlist/${video.playlistId}/video/${video.videoId}`}
                                        className="btn-primary py-2 px-4 flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Play
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(video.id)}
                                        disabled={removing === video.id}
                                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        {removing === video.id ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center">
                        <Download className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No downloaded videos
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Download videos to watch them offline without an internet connection.
                        </p>
                        <Link to="/playlists" className="btn-primary inline-flex items-center gap-2">
                            Browse Courses
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Downloads;
