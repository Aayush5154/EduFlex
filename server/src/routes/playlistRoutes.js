const express = require('express');
const router = express.Router();
const {
    getPlaylists,
    getPlaylist,
    createPlaylist,
    enrollPlaylist,
    getMyPlaylists,
    deletePlaylist
} = require('../controllers/playlistController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getPlaylists);
router.get('/teacher/me', protect, getMyPlaylists);
router.get('/:id', getPlaylist);
router.post('/', protect, createPlaylist);
router.post('/:id/enroll', protect, enrollPlaylist);
router.delete('/:id', protect, deletePlaylist);

module.exports = router;

