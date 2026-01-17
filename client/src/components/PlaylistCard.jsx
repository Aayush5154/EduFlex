import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, BookOpen, Users, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';

// Decorative accent shapes with different colors
const accentColors = [
    'from-orange-400 to-orange-500',
    'from-pink-400 to-pink-500',
    'from-green-400 to-green-500',
    'from-purple-400 to-purple-500',
    'from-blue-400 to-blue-500',
    'from-yellow-400 to-yellow-500',
    'from-red-400 to-red-500',
    'from-cyan-400 to-cyan-500'
];

const PlaylistCard = ({ playlist, progress = 0, showReason = false, isOwner = false, onDelete }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleting(true);
        try {
            await onDelete(playlist._id || playlist.id);
        } catch (error) {
            console.error('Error deleting playlist:', error);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };
    // Get a consistent color based on playlist id
    const colorIndex = (playlist._id || playlist.id || '').charCodeAt(0) % accentColors.length;
    const accentColor = accentColors[colorIndex];

    const formatDuration = (seconds) => {
        if (!seconds) return '0 min';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins} min`;
    };

    return (
        <Link
            to={`/playlist/${playlist._id || playlist.id}`}
            className="group block"
        >
            <div className="relative bg-slate-800 rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Decorative Accent Shape */}
                <div className={clsx(
                    'absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br opacity-80 blur-sm group-hover:scale-125 transition-transform duration-500',
                    accentColor
                )} />
                <div className={clsx(
                    'absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br',
                    accentColor
                )} />

                {/* Content */}
                <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-300 transition-colors">
                        {playlist.title}
                    </h3>

                    {playlist.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {playlist.description}
                        </p>
                    )}

                    {/* Chapter Count */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-primary-400" />
                            Chapter: <span className="text-white font-medium">{playlist.totalVideos || 0}</span>
                        </span>
                        {playlist.enrolledCount > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-green-400" />
                                {playlist.enrolledCount}
                            </span>
                        )}
                    </div>

                    {/* Progress bar */}
                    {progress > 0 && (
                        <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-primary-400 font-medium">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* AI Recommendation Reason */}
                    {showReason && playlist.reason && (
                        <div className="mb-4">
                            <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                {playlist.reason}
                            </span>
                        </div>
                    )}

                    {/* Teacher info */}
                    {playlist.teacher && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                    {playlist.teacher.name?.[0] || 'T'}
                                </div>
                                <span className="text-sm text-gray-400">
                                    {playlist.teacher.name || 'Instructor'}
                                </span>
                            </div>
                            {/* Delete button for owner */}
                            {isOwner && onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                    title="Delete playlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Hover Play Icon */}
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div
                        className="absolute inset-0 bg-slate-900/95 rounded-2xl flex flex-col items-center justify-center p-4 z-20"
                        onClick={(e) => e.preventDefault()}
                    >
                        <Trash2 className="w-10 h-10 text-red-400 mb-3" />
                        <h4 className="text-white font-semibold text-center mb-2">Delete Playlist?</h4>
                        <p className="text-gray-400 text-sm text-center mb-4">This will permanently delete "{playlist.title}" and all its videos.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowDeleteConfirm(false);
                                }}
                                className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default PlaylistCard;

