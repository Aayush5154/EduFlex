const Video = require('../models/Video');
const Playlist = require('../models/Playlist');

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
exports.getVideos = async (req, res) => {
    try {
        const videos = await Video.find()
            .populate('playlist', 'title')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: videos.length,
            data: videos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching videos',
            error: error.message
        });
    }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
exports.getVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('playlist', 'title teacher');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching video',
            error: error.message
        });
    }
};

// @desc    Create video
// @route   POST /api/videos
// @access  Private (Teacher)
exports.createVideo = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.body.playlist);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        // Check if user is the playlist owner
        if (playlist.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add videos to this playlist'
            });
        }

        const video = await Video.create(req.body);

        // Update playlist stats
        playlist.totalVideos += 1;
        playlist.totalDuration += video.duration || 0;
        await playlist.save();

        res.status(201).json({
            success: true,
            data: video
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating video',
            error: error.message
        });
    }
};
