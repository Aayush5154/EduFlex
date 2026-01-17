const Playlist = require('../models/Playlist');
const Progress = require('../models/Progress');
const User = require('../models/User');

/**
 * AI Recommendation Service
 * Provides personalized playlist recommendations using collaborative filtering
 * and content-based filtering approaches
 */

class AIRecommendationService {
    /**
     * Get personalized playlist recommendations for a user
     * @param {string} userId - User ID
     * @param {number} limit - Number of recommendations to return
     * @returns {Promise<Array>} Recommended playlists
     */
    async getRecommendations(userId, limit = 6) {
        try {
            // Get user's watch history and preferences
            const userProgress = await Progress.find({ user: userId })
                .populate('playlist', 'category difficulty');

            const user = await User.findById(userId)
                .populate('enrolledPlaylists', 'category');

            // Extract user preferences
            const categoryScores = this.calculateCategoryScores(userProgress, user);
            const difficultyPreference = this.inferDifficultyPreference(userProgress);

            // Get all available playlists
            const allPlaylists = await Playlist.find({ isPublished: true })
                .populate('teacher', 'name');

            // Score and rank playlists
            const scoredPlaylists = allPlaylists.map(playlist => ({
                playlist,
                score: this.calculatePlaylistScore(playlist, categoryScores, difficultyPreference, user)
            }));

            // Filter out enrolled playlists and sort by score
            const enrolledIds = user.enrolledPlaylists.map(p => p._id.toString());
            const recommendations = scoredPlaylists
                .filter(item => !enrolledIds.includes(item.playlist._id.toString()))
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => ({
                    ...item.playlist.toObject(),
                    recommendationScore: Math.round(item.score * 100),
                    reason: this.getRecommendationReason(item.playlist, categoryScores)
                }));

            return recommendations;
        } catch (error) {
            console.error('AI Recommendation Error:', error);
            // Fallback to trending playlists
            return this.getTrendingPlaylists(limit);
        }
    }

    /**
     * Calculate category preference scores based on watch history
     */
    calculateCategoryScores(progressList, user) {
        const scores = {};
        const categories = ['technology', 'mathematics', 'science', 'language', 'arts', 'other'];

        // Initialize scores
        categories.forEach(cat => scores[cat] = 0);

        // Score based on progress (weighted by completion)
        progressList.forEach(progress => {
            if (progress.playlist?.category) {
                const weight = progress.percentComplete / 100;
                scores[progress.playlist.category] += weight * 2;
            }
        });

        // Boost enrolled playlist categories
        user.enrolledPlaylists?.forEach(playlist => {
            if (playlist.category) {
                scores[playlist.category] += 0.5;
            }
        });

        return scores;
    }

    /**
     * Infer user's preferred difficulty level
     */
    inferDifficultyPreference(progressList) {
        const difficultyScores = { beginner: 0, intermediate: 0, advanced: 0 };

        progressList.forEach(progress => {
            if (progress.playlist?.difficulty && progress.percentComplete > 50) {
                difficultyScores[progress.playlist.difficulty] += 1;
            }
        });

        // Find preferred difficulty
        const preferred = Object.entries(difficultyScores)
            .sort((a, b) => b[1] - a[1])[0];

        return preferred ? preferred[0] : 'beginner';
    }

    /**
     * Calculate recommendation score for a playlist
     */
    calculatePlaylistScore(playlist, categoryScores, difficultyPreference, user) {
        let score = 0;

        // Category match (0-3 points)
        score += (categoryScores[playlist.category] || 0) * 1.5;

        // Difficulty progression bonus
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        const userLevel = difficultyOrder[difficultyPreference] || 1;
        const playlistLevel = difficultyOrder[playlist.difficulty] || 1;

        // Prefer same or slightly higher difficulty
        if (playlistLevel === userLevel) {
            score += 1;
        } else if (playlistLevel === userLevel + 1) {
            score += 0.8; // Challenge bonus
        } else if (playlistLevel < userLevel) {
            score += 0.3; // Still relevant for gaps
        }

        // Popularity bonus (normalized)
        const popularityScore = Math.min(playlist.enrolledCount / 100, 1);
        score += popularityScore * 0.5;

        // Content richness bonus
        if (playlist.totalVideos >= 5) {
            score += 0.3;
        }

        // Freshness bonus (newer content)
        const daysSinceCreation = (Date.now() - new Date(playlist.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 30) {
            score += 0.2;
        }

        return score;
    }

    /**
     * Generate human-readable recommendation reason
     */
    getRecommendationReason(playlist, categoryScores) {
        const reasons = [];

        if (categoryScores[playlist.category] > 1) {
            reasons.push(`Based on your interest in ${playlist.category}`);
        }

        if (playlist.enrolledCount > 50) {
            reasons.push('Popular among learners');
        }

        if (playlist.totalVideos >= 10) {
            reasons.push('Comprehensive course');
        }

        return reasons.length > 0 ? reasons[0] : 'Recommended for you';
    }

    /**
     * Fallback: Get trending playlists
     */
    async getTrendingPlaylists(limit) {
        return Playlist.find({ isPublished: true })
            .sort({ enrolledCount: -1, createdAt: -1 })
            .limit(limit)
            .populate('teacher', 'name');
    }

    /**
     * Get learning path suggestion
     * Suggests next playlist based on completed playlists
     */
    async getSuggestedLearningPath(userId) {
        const userProgress = await Progress.find({
            user: userId,
            isCompleted: true
        }).populate('playlist', 'category difficulty');

        if (userProgress.length === 0) {
            // New user - suggest beginner content
            return Playlist.find({
                isPublished: true,
                difficulty: 'beginner'
            }).limit(3);
        }

        // Find the most completed category
        const categoryCounts = {};
        userProgress.forEach(p => {
            if (p.playlist?.category) {
                categoryCounts[p.playlist.category] = (categoryCounts[p.playlist.category] || 0) + 1;
            }
        });

        const topCategory = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'technology';

        // Suggest next level in same category
        const completedIds = userProgress.map(p => p.playlist?._id).filter(Boolean);

        return Playlist.find({
            isPublished: true,
            category: topCategory,
            _id: { $nin: completedIds }
        }).limit(3);
    }

    /**
     * Calculate estimated time to complete a playlist
     */
    async getEstimatedCompletionTime(playlistId, userId) {
        const userProgress = await Progress.find({
            user: userId,
            playlist: playlistId
        });

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return null;

        const totalDuration = playlist.totalDuration || 0;
        const watchedSeconds = userProgress.reduce((sum, p) => sum + (p.watchedSeconds || 0), 0);
        const remainingSeconds = Math.max(0, totalDuration - watchedSeconds);

        // Calculate average watch speed if user has history
        const avgSpeed = userProgress.length > 0
            ? userProgress.reduce((sum, p) => sum + (p.totalSeconds > 0 ? p.watchedSeconds / p.totalSeconds : 1), 0) / userProgress.length
            : 1;

        const estimatedMinutes = Math.round(remainingSeconds / 60 / Math.max(avgSpeed, 0.5));

        return {
            remainingMinutes: estimatedMinutes,
            percentComplete: Math.round((watchedSeconds / totalDuration) * 100) || 0,
            estimatedSessions: Math.ceil(estimatedMinutes / 30) // Assuming 30 min sessions
        };
    }
}

module.exports = new AIRecommendationService();
