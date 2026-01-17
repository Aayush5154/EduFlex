import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BookOpen, Tag, Clock } from 'lucide-react';
import { aiAPI } from '../../api/api';
import { clsx } from 'clsx';

const VideoSummary = ({ videoId, videoTitle }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchSummary = async () => {
        if (!videoId) return;

        setLoading(true);
        setError(null);
        try {
            const res = await aiAPI.getSummary(videoId);
            setSummary(res.data.data);
        } catch (err) {
            setError('Failed to generate summary');
            console.error('Summary error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await aiAPI.regenerateSummary(videoId);
            setSummary(res.data.data);
        } catch (err) {
            setError('Failed to regenerate summary');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isExpanded && !summary && !loading) {
            fetchSummary();
        }
    }, [isExpanded, videoId]);

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="font-medium text-white">AI Summary</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        Beta
                    </span>
                </div>
                <svg
                    className={clsx(
                        'w-5 h-5 text-gray-400 transition-transform',
                        isExpanded && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                            <span className="ml-2 text-gray-400">Generating summary...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4">
                            <p className="text-red-400 text-sm mb-2">{error}</p>
                            <button
                                onClick={fetchSummary}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    ) : summary ? (
                        <>
                            {/* Summary Text */}
                            <div className="space-y-2">
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {summary.summary}
                                </p>
                                {summary.duration && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {summary.duration}
                                    </div>
                                )}
                            </div>

                            {/* Key Points */}
                            {summary.keyPoints?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-green-400" />
                                        Key Points
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {summary.keyPoints.map((point, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Topics */}
                            {summary.topics?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-blue-400" />
                                        Topics Covered
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {summary.topics.map((topic, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Regenerate Button */}
                            <button
                                onClick={handleRegenerate}
                                disabled={loading}
                                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Regenerate Summary
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={fetchSummary}
                            className="w-full py-3 border border-dashed border-slate-600 rounded-lg text-gray-400 hover:text-white hover:border-slate-500 transition-colors"
                        >
                            Click to generate AI summary
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoSummary;
