const mongoose = require('mongoose');

const videoSummarySchema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: true
    },
    keyPoints: [{
        type: String
    }],
    topics: [{
        type: String
    }],
    duration: {
        type: String // e.g., "5 min read"
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('VideoSummary', videoSummarySchema);
