const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    playlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Note content is required'],
        maxlength: 2000
    },
    timestamp: {
        type: Number, // Video timestamp in seconds
        default: 0
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for efficient queries
noteSchema.index({ user: 1, video: 1 });
noteSchema.index({ user: 1, playlist: 1 });
noteSchema.index({ user: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
