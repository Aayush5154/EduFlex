const Progress = require('../models/Progress');
const User = require('../models/User');

// @desc    Update video progress
// @route   POST /api/progress
// @access  Private
exports.updateProgress = async (req, res) => {
    try {
        const { videoId, playlistId, watchedSeconds, totalSeconds, isCompleted } = req.body;

        const percentComplete = totalSeconds > 0
            ? Math.round((watchedSeconds / totalSeconds) * 100)
            : 0;

        const progress = await Progress.findOneAndUpdate(
            { user: req.user.id, video: videoId },
            {
                user: req.user.id,
                video: videoId,
                playlist: playlistId,
                watchedSeconds,
                totalSeconds,
                percentComplete,
                isCompleted: isCompleted || percentComplete >= 95,
                lastWatchedAt: new Date(),
                syncedFromOffline: req.body.syncedFromOffline || false
            },
            { upsert: true, new: true }
        );

        // Update user's total watch time
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { totalWatchTime: watchedSeconds }
        });

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating progress',
            error: error.message
        });
    }
};

// @desc    Get user's progress for a playlist
// @route   GET /api/progress/playlist/:playlistId
// @access  Private
exports.getPlaylistProgress = async (req, res) => {
    try {
        const progress = await Progress.find({
            user: req.user.id,
            playlist: req.params.playlistId
        });

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching progress',
            error: error.message
        });
    }
};

// @desc    Get user's all progress
// @route   GET /api/progress
// @access  Private
exports.getAllProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.user.id })
            .populate('video', 'title thumbnail')
            .populate('playlist', 'title')
            .sort('-lastWatchedAt');

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching progress',
            error: error.message
        });
    }
};

// @desc    Sync offline progress (batch)
// @route   POST /api/progress/sync
// @access  Private
exports.syncProgress = async (req, res) => {
    try {
        const { progressData } = req.body;

        const results = await Promise.all(
            progressData.map(async (item) => {
                const percentComplete = item.totalSeconds > 0
                    ? Math.round((item.watchedSeconds / item.totalSeconds) * 100)
                    : 0;

                return Progress.findOneAndUpdate(
                    { user: req.user.id, video: item.videoId },
                    {
                        user: req.user.id,
                        video: item.videoId,
                        playlist: item.playlistId,
                        watchedSeconds: item.watchedSeconds,
                        totalSeconds: item.totalSeconds,
                        percentComplete,
                        isCompleted: percentComplete >= 95,
                        lastWatchedAt: new Date(item.lastWatchedAt),
                        syncedFromOffline: true
                    },
                    { upsert: true, new: true }
                );
            })
        );

        res.status(200).json({
            success: true,
            message: `Synced ${results.length} progress records`,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error syncing progress',
            error: error.message
        });
    }
};
