const express = require('express');
const router = express.Router();
const { getLeaderboard, addXP, getMyXP } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeaderboard);
router.get('/me', getMyXP);
router.post('/xp', addXP);

module.exports = router;
