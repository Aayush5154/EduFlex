const User = require('../models/User');

// XP values
const XP_VALUES = {
    DAILY_LOGIN: 10,
    VIDEO_COMPLETED: 25,
    TODO_COMPLETED: 15,
    STREAK_BONUS: 5,
    QUIZ_PASSED: 50
};

// Calculate level from XP (every 500 XP = 1 level)
const calculateLevel = (xp) => Math.floor(xp / 500) + 1;

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
    try {
        // Get top 20 students by XP
        const topStudents = await User.find({ role: 'student' })
            .select('name xpPoints level currentStreak avatar')
            .sort({ xpPoints: -1 })
            .limit(20);

        // Get current user's rank
        const currentUserId = req.user._id.toString();
        const currentUser = await User.findById(currentUserId).select('name xpPoints level currentStreak');

        // Calculate user's rank
        const userRank = await User.countDocuments({
            role: 'student',
            xpPoints: { $gt: currentUser.xpPoints }
        }) + 1;

        res.status(200).json({
            success: true,
            data: {
                leaderboard: topStudents.map((student, index) => ({
                    rank: index + 1,
                    id: student._id,
                    name: student.name,
                    xpPoints: student.xpPoints || 0,
                    level: student.level || 1,
                    streak: student.currentStreak || 0,
                    isCurrentUser: student._id.toString() === currentUserId
                })),
                currentUser: {
                    rank: userRank,
                    name: currentUser.name,
                    xpPoints: currentUser.xpPoints || 0,
                    level: currentUser.level || 1,
                    streak: currentUser.currentStreak || 0,
                    xpToNextLevel: 500 - (currentUser.xpPoints % 500)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message
        });
    }
};

// @desc    Add XP to user
// @route   POST /api/leaderboard/xp
// @access  Private
exports.addXP = async (req, res) => {
    try {
        const { action } = req.body;
        const xpToAdd = XP_VALUES[action] || 0;

        if (xpToAdd === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
        }

        const user = await User.findById(req.user.id);
        user.xpPoints = (user.xpPoints || 0) + xpToAdd;
        user.level = calculateLevel(user.xpPoints);
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                xpAdded: xpToAdd,
                totalXP: user.xpPoints,
                level: user.level,
                action
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding XP',
            error: error.message
        });
    }
};

// @desc    Get user XP stats
// @route   GET /api/leaderboard/me
// @access  Private
exports.getMyXP = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('xpPoints level currentStreak');

        const rank = await User.countDocuments({
            role: 'student',
            xpPoints: { $gt: user.xpPoints || 0 }
        }) + 1;

        res.status(200).json({
            success: true,
            data: {
                xpPoints: user.xpPoints || 0,
                level: user.level || 1,
                streak: user.currentStreak || 0,
                rank,
                xpToNextLevel: 500 - ((user.xpPoints || 0) % 500)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching XP stats',
            error: error.message
        });
    }
};

module.exports.XP_VALUES = XP_VALUES;
