import { useState } from 'react';
import { X, Video, Image } from 'lucide-react';
import { videosAPI } from '../../api/api';

const AddVideoModal = ({ playlistId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        videoUrl: '',
        thumbnail: '',
        description: '',
        duration: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [thumbnailMode, setThumbnailMode] = useState('auto'); // 'auto', 'upload', 'custom'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-detect YouTube thumbnail
        if (name === 'videoUrl' && value.includes('youtube.com') || value.includes('youtu.be')) {
            const videoId = extractYouTubeId(value);
            if (videoId && thumbnailMode === 'auto') {
                setFormData(prev => ({
                    ...prev,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                }));
            }
        }
    };

    const extractYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.videoUrl.trim()) {
            setError('Title and Video URL are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await videosAPI.create({
                ...formData,
                playlist: playlistId
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add video');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-cyan-400">Add Video Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Details Section */}
                    <div className="text-sm font-medium text-gray-400 mb-2">Details</div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Title <span className="text-red-400">(required)</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Video Title"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Video URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Video URL
                        </label>
                        <input
                            type="url"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            placeholder="Add URL of the Video here"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Video Preview */}
                    {formData.videoUrl && (
                        <div className="bg-slate-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Video className="w-4 h-4" />
                                <span>Filename: video.mp4</span>
                            </div>
                            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                                {formData.thumbnail ? (
                                    <img
                                        src={formData.thumbnail}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="text-gray-500 text-center">
                                        <Video className="w-12 h-12 mx-auto mb-2" />
                                        <p className="text-sm">Video preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Thumbnail
                        </label>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setThumbnailMode('upload')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${thumbnailMode === 'upload'
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-700 text-gray-400 hover:text-white'
                                    }`}
                            >
                                Upload file
                            </button>
                            <button
                                type="button"
                                onClick={() => setThumbnailMode('auto')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${thumbnailMode === 'auto'
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-700 text-gray-400 hover:text-white'
                                    }`}
                            >
                                Auto-generated
                            </button>
                            <button
                                type="button"
                                onClick={() => setThumbnailMode('custom')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${thumbnailMode === 'custom'
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-700 text-gray-400 hover:text-white'
                                    }`}
                            >
                                Test and compare
                            </button>
                        </div>
                        {thumbnailMode !== 'auto' && (
                            <input
                                type="url"
                                name="thumbnail"
                                value={formData.thumbnail}
                                onChange={handleChange}
                                placeholder="Thumbnail URL"
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                            />
                        )}
                    </div>

                    {/* Duration (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Duration (seconds)
                        </label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="300"
                            min={0}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Video'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVideoModal;
