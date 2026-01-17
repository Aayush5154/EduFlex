const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
    watchedSeconds: {
        type: Number,
        default: 0
    },
    totalSeconds: {
        type: Number,
        default: 0
    },
    percentComplete: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    lastWatchedAt: {
        type: Date,
        default: Date.now
    },
    syncedFromOffline: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for unique user-video progress
progressSchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
