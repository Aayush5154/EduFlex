import { useState, useEffect } from 'react';
import { Plus, Pin, Trash2, Edit2, Check, X, Clock } from 'lucide-react';
import { notesAPI } from '../../api/api';
import { clsx } from 'clsx';

const NotesPanel = ({ video, playlistId }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (video?._id) {
            fetchNotes();
        }
    }, [video?._id]);

    const fetchNotes = async () => {
        if (!video?._id) return;
        try {
            const res = await notesAPI.getVideoNotes(video._id);
            setNotes(res.data.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !video?._id) return;

        setLoading(true);
        try {
            const res = await notesAPI.create({
                videoId: video._id,
                playlistId,
                content: newNote,
                timestamp: 0 // Could be integrated with video player
            });
            setNotes([...notes, res.data.data]);
            setNewNote('');
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateNote = async (noteId) => {
        if (!editContent.trim()) return;

        try {
            await notesAPI.update(noteId, { content: editContent });
            setNotes(notes.map(n => n._id === noteId ? { ...n, content: editContent } : n));
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await notesAPI.delete(noteId);
            setNotes(notes.filter(n => n._id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleTogglePin = async (noteId) => {
        try {
            const res = await notesAPI.togglePin(noteId);
            setNotes(notes.map(n => n._id === noteId ? res.data.data : n));
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    const formatTimestamp = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-80 bg-slate-900 border-l border-slate-700/50 flex-shrink-0 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold text-white">Make Notes</h3>
            </div>

            {/* Add Note Input */}
            <div className="p-4 border-b border-slate-700/50">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add your note..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none"
                    rows={3}
                />
                <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || loading || !video}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Add Note
                </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notes.length === 0 ? (
                    <p className="text-gray-400 text-center text-sm py-8">
                        No notes yet. Start taking notes while watching!
                    </p>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note._id}
                            className={clsx(
                                'p-3 rounded-lg border transition-colors',
                                note.isPinned
                                    ? 'bg-yellow-500/10 border-yellow-500/30'
                                    : 'bg-slate-800 border-slate-700'
                            )}
                        >
                            {editingId === note._id ? (
                                <>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
                                        rows={3}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleUpdateNote(note._id)}
                                            className="p-1 bg-green-500 rounded text-white hover:bg-green-600"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditContent('');
                                            }}
                                            className="p-1 bg-slate-600 rounded text-white hover:bg-slate-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {note.timestamp > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTimestamp(note.timestamp)}
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-200 whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => handleTogglePin(note._id)}
                                            className={clsx(
                                                'p-1 rounded transition-colors',
                                                note.isPinned
                                                    ? 'text-yellow-400 hover:text-yellow-300'
                                                    : 'text-gray-400 hover:text-gray-300'
                                            )}
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(note._id);
                                                setEditContent(note.content);
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNote(note._id)}
                                            className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotesPanel;
