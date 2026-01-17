const express = require('express');
const router = express.Router();
const { getTeacherAnalytics, getStudentAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/teacher', protect, authorize('teacher'), getTeacherAnalytics);
router.get('/student', protect, getStudentAnalytics);

module.exports = router;
