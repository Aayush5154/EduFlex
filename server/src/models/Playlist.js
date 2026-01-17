const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Playlist title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    thumbnail: {
        type: String,
        default: ''
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['mathematics', 'science', 'language', 'technology', 'arts', 'other'],
        default: 'other'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    totalVideos: {
        type: Number,
        default: 0
    },
    totalDuration: {
        type: Number, // in seconds
        default: 0
    },
    enrolledCount: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for videos
playlistSchema.virtual('videos', {
    ref: 'Video',
    localField: '_id',
    foreignField: 'playlist'
});

module.exports = mongoose.model('Playlist', playlistSchema);
