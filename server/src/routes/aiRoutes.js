const express = require('express');
const router = express.Router();
const { Quiz, QuizAttempt } = require('../models/Quiz');
const VideoSummary = require('../models/VideoSummary');
const Video = require('../models/Video');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

/**
 * AI Content Generation Service
 * Generates summaries and quizzes based on video metadata
 * In production, this would integrate with OpenAI/Gemini API
 */

// Generate summary from video title/description (simulated AI)
const generateSummary = (video) => {
    const title = video.title || 'Video';
    const description = video.description || '';

    // Simulated AI summary generation based on video metadata
    const topics = extractTopics(title + ' ' + description);

    return {
        summary: `This video covers ${title}. ${description || 'Learn the key concepts and practical applications through hands-on examples and clear explanations.'}`,
        keyPoints: [
            `Understanding the fundamentals of ${topics[0] || 'the topic'}`,
            `Practical implementation techniques`,
            `Best practices and common patterns`,
            `Real-world use cases and examples`,
            `Tips for further learning`
        ],
        topics: topics.slice(0, 5),
        duration: '3 min read'
    };
};

// Extract topics from text
const extractTopics = (text) => {
    const techKeywords = [
        'React', 'JavaScript', 'Node.js', 'MongoDB', 'Express', 'API',
        'Frontend', 'Backend', 'Database', 'Authentication', 'Testing',
        'CSS', 'HTML', 'TypeScript', 'Next.js', 'Prisma', 'GraphQL',
        'REST', 'Hooks', 'Components', 'State Management', 'Redux'
    ];

    return techKeywords.filter(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
};

// Generate quiz questions from video metadata (simulated AI)
const generateQuizQuestions = (video) => {
    const title = video.title || 'this topic';

    // Simulated AI quiz generation - in production, use OpenAI/Gemini
    return [
        {
            question: `What is the main topic covered in "${title}"?`,
            options: [
                'Basic fundamentals and core concepts',
                'Advanced optimization techniques',
                'Testing and debugging strategies',
                'Deployment and DevOps practices'
            ],
            correctAnswer: 0,
            explanation: 'This video focuses on teaching the fundamental concepts and core principles.'
        },
        {
            question: 'Which of the following best describes the approach used in this video?',
            options: [
                'Theoretical explanations only',
                'Hands-on practical examples',
                'Code review sessions',
                'Interview preparation'
            ],
            correctAnswer: 1,
            explanation: 'The video uses practical, hands-on examples to demonstrate concepts.'
        },
        {
            question: 'What is recommended after completing this video?',
            options: [
                'Skip to advanced topics immediately',
                'Practice the concepts learned',
                'Move to a different technology',
                'Focus only on reading documentation'
            ],
            correctAnswer: 1,
            explanation: 'Practicing what you learned helps reinforce the concepts covered.'
        },
        {
            question: 'Which skill is primarily developed through this content?',
            options: [
                'Project management',
                'Technical implementation',
                'UI/UX design',
                'Marketing strategies'
            ],
            correctAnswer: 1,
            explanation: 'This content focuses on developing technical implementation skills.'
        },
        {
            question: 'What prerequisite knowledge is helpful for this video?',
            options: [
                'No prior knowledge required',
                'Basic programming fundamentals',
                'Expert-level experience',
                'Specific certification required'
            ],
            correctAnswer: 1,
            explanation: 'Basic programming knowledge helps in understanding the concepts better.'
        }
    ];
};

// @desc    Get or generate summary for a video
// @route   GET /api/ai/summary/:videoId
router.get('/summary/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        // Check if summary exists
        let summary = await VideoSummary.findOne({ video: videoId });

        if (!summary) {
            // Generate new summary
            const video = await Video.findById(videoId);
            if (!video) {
                return res.status(404).json({ success: false, message: 'Video not found' });
            }

            const generatedSummary = generateSummary(video);

            summary = await VideoSummary.create({
                video: videoId,
                ...generatedSummary
            });
        }

        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Regenerate summary for a video
// @route   POST /api/ai/summary/:videoId/regenerate
router.post('/summary/:videoId/regenerate', async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const generatedSummary = generateSummary(video);

        const summary = await VideoSummary.findOneAndUpdate(
            { video: videoId },
            { ...generatedSummary, generatedAt: new Date() },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get or generate quiz for a video
// @route   GET /api/ai/quiz/:videoId
router.get('/quiz/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        // Check if quiz exists
        let quiz = await Quiz.findOne({ video: videoId });

        if (!quiz) {
            // Generate new quiz
            const video = await Video.findById(videoId).populate('playlist');
            if (!video) {
                return res.status(404).json({ success: false, message: 'Video not found' });
            }

            const questions = generateQuizQuestions(video);

            quiz = await Quiz.create({
                video: videoId,
                playlist: video.playlist._id || video.playlist,
                questions,
                generatedBy: 'ai'
            });
        }

        // Get user's best attempt
        const bestAttempt = await QuizAttempt.findOne({
            user: req.user.id,
            video: videoId
        }).sort('-percentScore');

        res.json({
            success: true,
            data: {
                quiz,
                bestScore: bestAttempt?.percentScore || null,
                attemptCount: await QuizAttempt.countDocuments({ user: req.user.id, video: videoId })
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Submit quiz answers
// @route   POST /api/ai/quiz/:videoId/submit
router.post('/quiz/:videoId/submit', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { answers } = req.body; // Array of { questionIndex, selectedAnswer }

        const quiz = await Quiz.findOne({ video: videoId });
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        // Grade the quiz
        const gradedAnswers = answers.map(answer => ({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: quiz.questions[answer.questionIndex]?.correctAnswer === answer.selectedAnswer
        }));

        const correctCount = gradedAnswers.filter(a => a.isCorrect).length;
        const totalQuestions = quiz.questions.length;
        const percentScore = Math.round((correctCount / totalQuestions) * 100);

        // Save attempt
        const attempt = await QuizAttempt.create({
            user: req.user.id,
            quiz: quiz._id,
            video: videoId,
            answers: gradedAnswers,
            score: correctCount,
            totalQuestions,
            percentScore
        });

        res.json({
            success: true,
            data: {
                attempt,
                correctAnswers: quiz.questions.map((q, i) => ({
                    questionIndex: i,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get quiz history for user
// @route   GET /api/ai/quiz/history
router.get('/quiz/history', async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ user: req.user.id })
            .populate('video', 'title thumbnail')
            .sort('-createdAt')
            .limit(20);

        res.json({ success: true, data: attempts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
