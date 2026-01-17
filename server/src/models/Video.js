const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    thumbnail: {
        type: String,
        default: ''
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    playlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist',
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    isDownloadable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Video', videoSchema);
