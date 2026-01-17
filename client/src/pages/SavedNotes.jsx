import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Pin, Trash2, Search, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { notesAPI } from '../api/api';
import { clsx } from 'clsx';

const SavedNotes = () => {
    const [notes, setNotes] = useState([]);
    const [pinnedNotes, setPinnedNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const [allRes, pinnedRes] = await Promise.all([
                notesAPI.getAll(),
                notesAPI.getPinned()
            ]);
            setNotes(allRes.data.data || []);
            setPinnedNotes(pinnedRes.data.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await notesAPI.delete(noteId);
            setNotes(notes.filter(n => n._id !== noteId));
            setPinnedNotes(pinnedNotes.filter(n => n._id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleTogglePin = async (noteId) => {
        try {
            const res = await notesAPI.togglePin(noteId);
            fetchNotes(); // Refresh to update pinned status
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    const filteredNotes = notes.filter(note =>
        note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.video?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.playlist?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group notes by playlist
    const groupedNotes = filteredNotes.reduce((acc, note) => {
        const playlistTitle = note.playlist?.title || 'Uncategorized';
        if (!acc[playlistTitle]) {
            acc[playlistTitle] = [];
        }
        acc[playlistTitle].push(note);
        return acc;
    }, {});

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner message="Loading your notes..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Saved Notes</h1>
                        <p className="text-gray-400">All your notes in one place</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 w-64"
                        />
                    </div>
                </div>

                {/* Pinned Notes Section */}
                {pinnedNotes.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Pin className="w-5 h-5 text-yellow-400" />
                            Pinned Notes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pinnedNotes.map((note) => (
                                <div
                                    key={note._id}
                                    className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
                                >
                                    <p className="text-gray-200 text-sm line-clamp-3 mb-3">
                                        {note.content}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={`/playlist/${note.playlist?._id}/video/${note.video?._id}`}
                                            className="text-xs text-primary-400 hover:underline flex items-center gap-1"
                                        >
                                            {note.video?.title || 'Go to video'}
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                        <button
                                            onClick={() => handleTogglePin(note._id)}
                                            className="p-1 text-yellow-400 hover:text-yellow-300"
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Notes by Playlist */}
                {Object.keys(groupedNotes).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupedNotes).map(([playlistTitle, playlistNotes]) => (
                            <div key={playlistTitle}>
                                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary-400" />
                                    {playlistTitle}
                                    <span className="text-sm text-gray-400 font-normal">
                                        ({playlistNotes.length} notes)
                                    </span>
                                </h2>
                                <div className="space-y-3">
                                    {playlistNotes.map((note) => (
                                        <div
                                            key={note._id}
                                            className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-gray-200 text-sm whitespace-pre-wrap">
                                                        {note.content}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                        {note.video?.title && (
                                                            <Link
                                                                to={`/playlist/${note.playlist?._id}/video/${note.video?._id}`}
                                                                className="text-primary-400 hover:underline"
                                                            >
                                                                {note.video.title}
                                                            </Link>
                                                        )}
                                                        <span>
                                                            {new Date(note.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleTogglePin(note._id)}
                                                        className={clsx(
                                                            'p-1.5 rounded transition-colors',
                                                            note.isPinned
                                                                ? 'text-yellow-400 hover:text-yellow-300'
                                                                : 'text-gray-400 hover:text-gray-300'
                                                        )}
                                                    >
                                                        <Pin className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note._id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-xl p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
                        <p className="text-gray-400 mb-4">
                            Start taking notes while watching videos to see them here.
                        </p>
                        <Link
                            to="/playlists"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                        >
                            Browse Courses
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SavedNotes;
