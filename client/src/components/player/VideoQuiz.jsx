import { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, Trophy, RefreshCw, ArrowRight } from 'lucide-react';
import { aiAPI } from '../../api/api';
import { clsx } from 'clsx';

const VideoQuiz = ({ videoId, videoTitle }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [bestScore, setBestScore] = useState(null);

    const fetchQuiz = async () => {
        if (!videoId) return;

        setLoading(true);
        setError(null);
        try {
            const res = await aiAPI.getQuiz(videoId);
            setQuiz(res.data.data.quiz);
            setBestScore(res.data.data.bestScore);
        } catch (err) {
            setError('Failed to load quiz');
            console.error('Quiz error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (questionIndex, answerIndex) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }));
    };

    const handleSubmit = async () => {
        const answers = Object.entries(selectedAnswers).map(([questionIndex, selectedAnswer]) => ({
            questionIndex: parseInt(questionIndex),
            selectedAnswer
        }));

        try {
            const res = await aiAPI.submitQuiz(videoId, answers);
            setResults(res.data.data);
            setSubmitted(true);
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    const handleRetry = () => {
        setSelectedAnswers({});
        setSubmitted(false);
        setResults(null);
        setCurrentQuestion(0);
    };

    useEffect(() => {
        if (isExpanded && !quiz && !loading) {
            fetchQuiz();
        }
    }, [isExpanded, videoId]);

    const question = quiz?.questions?.[currentQuestion];
    const totalQuestions = quiz?.questions?.length || 0;
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-green-500/20">
                        <Brain className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="font-medium text-white">Quiz</span>
                    {bestScore !== null && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Best: {bestScore}%
                        </span>
                    )}
                </div>
                <svg
                    className={clsx(
                        'w-5 h-5 text-gray-400 transition-transform',
                        isExpanded && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
                            <span className="ml-2 text-gray-400">Loading quiz...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4">
                            <p className="text-red-400 text-sm mb-2">{error}</p>
                            <button onClick={fetchQuiz} className="text-green-400 hover:text-green-300 text-sm">
                                Try again
                            </button>
                        </div>
                    ) : submitted && results ? (
                        /* Results View */
                        <div className="space-y-4">
                            <div className="text-center py-6">
                                <div className={clsx(
                                    'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
                                    results.attempt.percentScore >= 80
                                        ? 'bg-green-500/20'
                                        : results.attempt.percentScore >= 50
                                            ? 'bg-yellow-500/20'
                                            : 'bg-red-500/20'
                                )}>
                                    <Trophy className={clsx(
                                        'w-10 h-10',
                                        results.attempt.percentScore >= 80
                                            ? 'text-green-400'
                                            : results.attempt.percentScore >= 50
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                    )} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">
                                    {results.attempt.percentScore}%
                                </h3>
                                <p className="text-gray-400">
                                    {results.attempt.score} of {results.attempt.totalQuestions} correct
                                </p>
                            </div>

                            {/* Review Answers */}
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {quiz.questions.map((q, qIndex) => {
                                    const correct = results.correctAnswers.find(a => a.questionIndex === qIndex);
                                    const userAnswer = selectedAnswers[qIndex];
                                    const isCorrect = userAnswer === correct?.correctAnswer;

                                    return (
                                        <div key={qIndex} className="p-3 bg-slate-700/50 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                {isCorrect ? (
                                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="text-sm text-white">{q.question}</p>
                                                    {!isCorrect && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Correct: {q.options[correct.correctAnswer]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleRetry}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                        </div>
                    ) : quiz ? (
                        /* Quiz View */
                        <div className="space-y-4">
                            {/* Progress */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                    Question {currentQuestion + 1} of {totalQuestions}
                                </span>
                                <span className="text-gray-400">
                                    {answeredCount} answered
                                </span>
                            </div>
                            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                    style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                                />
                            </div>

                            {/* Question */}
                            {question && (
                                <div className="space-y-3">
                                    <p className="text-white font-medium">{question.question}</p>

                                    <div className="space-y-2">
                                        {question.options.map((option, optIndex) => (
                                            <button
                                                key={optIndex}
                                                onClick={() => handleSelectAnswer(currentQuestion, optIndex)}
                                                className={clsx(
                                                    'w-full text-left px-4 py-3 rounded-lg border transition-all',
                                                    selectedAnswers[currentQuestion] === optIndex
                                                        ? 'bg-green-500/20 border-green-500 text-white'
                                                        : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-slate-500'
                                                )}
                                            >
                                                <span className="mr-2 text-gray-500">{String.fromCharCode(65 + optIndex)}.</span>
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex gap-2">
                                {currentQuestion > 0 && (
                                    <button
                                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                        Previous
                                    </button>
                                )}

                                {currentQuestion < totalQuestions - 1 ? (
                                    <button
                                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Next
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={answeredCount < totalQuestions}
                                        className={clsx(
                                            'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                                            answeredCount === totalQuestions
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
                                                : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                                        )}
                                    >
                                        Submit Quiz ({answeredCount}/{totalQuestions})
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default VideoQuiz;
