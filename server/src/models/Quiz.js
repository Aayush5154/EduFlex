const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    playlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist',
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswer: {
            type: Number, // Index of correct option
            required: true
        },
        explanation: String
    }],
    generatedBy: {
        type: String,
        enum: ['ai', 'manual'],
        default: 'ai'
    }
}, {
    timestamps: true
});

// Quiz attempt schema for tracking user scores
const quizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    answers: [{
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean
    }],
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    percentScore: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

quizAttemptSchema.index({ user: 1, video: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = { Quiz, QuizAttempt };
