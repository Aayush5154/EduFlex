const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Progress = require('../models/Progress');

// @desc    Get teacher analytics
// @route   GET /api/analytics/teacher
// @access  Private (Teacher)
exports.getTeacherAnalytics = async (req, res) => {
    try {
        // Get teacher's playlists
        const playlists = await Playlist.find({ teacher: req.user.id });
        const playlistIds = playlists.map(p => p._id);

        // Get total enrolled students
        const enrolledStudents = await User.countDocuments({
            enrolledPlaylists: { $in: playlistIds }
        });

        // Get total watch time across all playlists
        const progressStats = await Progress.aggregate([
            { $match: { playlist: { $in: playlistIds } } },
            {
                $group: {
                    _id: null,
                    totalWatchTime: { $sum: '$watchedSeconds' },
                    completedVideos: {
                        $sum: { $cond: ['$isCompleted', 1, 0] }
                    }
                }
            }
        ]);

        const stats = progressStats[0] || { totalWatchTime: 0, completedVideos: 0 };

        res.status(200).json({
            success: true,
            data: {
                totalPlaylists: playlists.length,
                totalVideos: playlists.reduce((sum, p) => sum + p.totalVideos, 0),
                enrolledStudents,
                totalWatchTime: Math.round(stats.totalWatchTime / 60), // in minutes
                completedVideos: stats.completedVideos
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

// @desc    Get student analytics
// @route   GET /api/analytics/student
// @access  Private
exports.getStudentAnalytics = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Get progress stats
        const progressStats = await Progress.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    totalWatchTime: { $sum: '$watchedSeconds' },
                    completedVideos: {
                        $sum: { $cond: ['$isCompleted', 1, 0] }
                    },
                    totalVideos: { $sum: 1 }
                }
            }
        ]);

        const stats = progressStats[0] || {
            totalWatchTime: 0,
            completedVideos: 0,
            totalVideos: 0
        };

        res.status(200).json({
            success: true,
            data: {
                enrolledPlaylists: user.enrolledPlaylists.length,
                totalWatchTime: Math.round(stats.totalWatchTime / 60),
                completedVideos: stats.completedVideos,
                videosWatched: stats.totalVideos
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};
