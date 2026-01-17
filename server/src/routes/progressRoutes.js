const express = require('express');
const router = express.Router();
const {
    updateProgress,
    getPlaylistProgress,
    getAllProgress,
    syncProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllProgress);
router.get('/playlist/:playlistId', protect, getPlaylistProgress);
router.post('/', protect, updateProgress);
router.post('/sync', protect, syncProgress);

module.exports = router;
