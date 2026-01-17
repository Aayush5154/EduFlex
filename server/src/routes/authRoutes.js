const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateStreak, getStreak } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/streak', protect, getStreak);
router.post('/streak', protect, updateStreak);

module.exports = router;
