const Playlist = require('../models/Playlist');
const Video = require('../models/Video');
const User = require('../models/User');

// @desc    Get all playlists (teacher playlists + user's own playlists)
// @route   GET /api/playlists
// @access  Public (with optional auth for user's own playlists)
exports.getPlaylists = async (req, res) => {
    try {
        const { myOnly } = req.query;

        // Get current user ID if authenticated
        let currentUserId = null;
        if (req.user) {
            currentUserId = req.user._id ? req.user._id.toString() : req.user.id;
        }

        let playlists;

        // If myOnly is true, show only user's own playlists (both public and private)
        if (myOnly === 'true' && currentUserId) {
            playlists = await Playlist.find({ teacher: currentUserId })
                .populate('teacher', 'name email role')
                .sort('-createdAt');
        } else {
            // Default: Show all public playlists
            playlists = await Playlist.find({ isPublished: true })
                .populate('teacher', 'name email role')
                .sort('-createdAt');

            // Filter to include:
            // 1. Playlists created by teachers (public)
            // 2. User's own public playlists (if logged in)
            playlists = playlists.filter(playlist => {
                if (!playlist.teacher) return false;

                const creatorId = playlist.teacher._id.toString();
                const creatorRole = playlist.teacher.role;

                // Include if created by a teacher
                if (creatorRole === 'teacher') return true;

                // Include user's own public playlists
                if (currentUserId && creatorId === currentUserId) return true;

                return false;
            });
        }

        res.status(200).json({
            success: true,
            count: playlists.length,
            data: playlists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching playlists',
            error: error.message
        });
    }
};

// @desc    Get single playlist with videos
// @route   GET /api/playlists/:id
// @access  Public
exports.getPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate('teacher', 'name email');

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        const videos = await Video.find({ playlist: req.params.id })
            .sort('order');

        res.status(200).json({
            success: true,
            data: {
                ...playlist.toObject(),
                videos
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching playlist',
            error: error.message
        });
    }
};

// @desc    Create playlist
// @route   POST /api/playlists
// @access  Private (Teacher)
exports.createPlaylist = async (req, res) => {
    try {
        req.body.teacher = req.user.id;
        const playlist = await Playlist.create(req.body);

        res.status(201).json({
            success: true,
            data: playlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating playlist',
            error: error.message
        });
    }
};

// @desc    Enroll in playlist
// @route   POST /api/playlists/:id/enroll
// @access  Private (Student)
exports.enrollPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        const user = await User.findById(req.user.id);

        // Check if already enrolled
        if (user.enrolledPlaylists.includes(playlist._id)) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this playlist'
            });
        }

        // Enroll user
        user.enrolledPlaylists.push(playlist._id);
        await user.save();

        // Increment enrolled count
        playlist.enrolledCount += 1;
        await playlist.save();

        res.status(200).json({
            success: true,
            message: 'Successfully enrolled in playlist'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error enrolling in playlist',
            error: error.message
        });
    }
};

// @desc    Get teacher's playlists
// @route   GET /api/playlists/teacher/me
// @access  Private (Teacher)
exports.getMyPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ teacher: req.user.id })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: playlists.length,
            data: playlists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching your playlists',
            error: error.message
        });
    }
};

// @desc    Delete playlist (only by creator)
// @route   DELETE /api/playlists/:id
// @access  Private (Owner only)
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        // Check if user is the creator
        if (playlist.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this playlist'
            });
        }

        // Delete all videos in the playlist
        await Video.deleteMany({ playlist: req.params.id });

        // Delete the playlist
        await Playlist.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Playlist deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting playlist',
            error: error.message
        });
    }
};

