const express = require('express');
const router = express.Router();
const { getVideos, getVideo, createVideo } = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getVideos);
router.get('/:id', getVideo);
router.post('/', protect, createVideo);

module.exports = router;
