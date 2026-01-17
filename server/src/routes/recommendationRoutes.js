const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @desc    Get personalized playlist recommendations
// @route   GET /api/recommendations
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const recommendations = await aiService.getRecommendations(req.user.id, limit);

        res.json({
            success: true,
            data: recommendations,
            meta: {
                algorithm: 'collaborative-content-hybrid',
                userId: req.user.id
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get learning path suggestions
// @route   GET /api/recommendations/learning-path
router.get('/learning-path', async (req, res) => {
    try {
        const suggestions = await aiService.getSuggestedLearningPath(req.user.id);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get estimated completion time for a playlist
// @route   GET /api/recommendations/estimate/:playlistId
router.get('/estimate/:playlistId', async (req, res) => {
    try {
        const estimate = await aiService.getEstimatedCompletionTime(
            req.params.playlistId,
            req.user.id
        );

        if (!estimate) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        res.json({
            success: true,
            data: estimate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
