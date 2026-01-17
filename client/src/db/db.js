import Dexie from 'dexie';

// Create offline database
export const db = new Dexie('EduFlexOfflineDB');

// Define schema
db.version(1).stores({
    // Cached playlists for offline access
    playlists: 'id, title, teacher, category, difficulty, updatedAt',

    // Cached videos for offline access
    videos: 'id, playlistId, title, order, videoUrl, thumbnail',

    // Offline progress to sync later
    offlineProgress: '++id, videoId, playlistId, watchedSeconds, totalSeconds, syncedAt, createdAt',

    // Downloaded videos metadata (for offline viewing)
    downloadedVideos: 'id, videoId, playlistId, title, thumbnail, downloadedAt',

    // User session cache
    userSession: 'id, token, user'
});

// Helper functions for offline data management

// Cache playlists for offline use
export const cachePlaylists = async (playlists) => {
    try {
        await db.playlists.bulkPut(
            playlists.map(p => ({
                id: p._id,
                ...p,
                updatedAt: new Date().toISOString()
            }))
        );
    } catch (error) {
        console.error('Error caching playlists:', error);
    }
};

// Get cached playlists
export const getCachedPlaylists = async () => {
    try {
        return await db.playlists.toArray();
    } catch (error) {
        console.error('Error getting cached playlists:', error);
        return [];
    }
};

// Cache videos for a playlist
export const cacheVideos = async (playlistId, videos) => {
    try {
        await db.videos.bulkPut(
            videos.map(v => ({
                id: v._id,
                playlistId,
                ...v
            }))
        );
    } catch (error) {
        console.error('Error caching videos:', error);
    }
};

// Get cached videos for a playlist
export const getCachedVideos = async (playlistId) => {
    try {
        return await db.videos.where('playlistId').equals(playlistId).toArray();
    } catch (error) {
        console.error('Error getting cached videos:', error);
        return [];
    }
};

// Save progress offline
export const saveOfflineProgress = async (progressData) => {
    try {
        await db.offlineProgress.add({
            ...progressData,
            createdAt: new Date().toISOString(),
            syncedAt: null
        });
    } catch (error) {
        console.error('Error saving offline progress:', error);
    }
};

// Get all unsent offline progress
export const getUnsyncedProgress = async () => {
    try {
        return await db.offlineProgress.where('syncedAt').equals(null).toArray();
    } catch (error) {
        console.error('Error getting unsynced progress:', error);
        return [];
    }
};

// Mark progress as synced
export const markProgressAsSynced = async (ids) => {
    try {
        await db.offlineProgress.bulkUpdate(
            ids.map(id => ({
                key: id,
                changes: { syncedAt: new Date().toISOString() }
            }))
        );
    } catch (error) {
        console.error('Error marking progress as synced:', error);
    }
};

// Clear synced progress
export const clearSyncedProgress = async () => {
    try {
        await db.offlineProgress.where('syncedAt').notEqual(null).delete();
    } catch (error) {
        console.error('Error clearing synced progress:', error);
    }
};

// Save downloaded video metadata
export const saveDownloadedVideo = async (video) => {
    try {
        await db.downloadedVideos.put({
            id: video._id,
            videoId: video._id,
            playlistId: video.playlist,
            title: video.title,
            thumbnail: video.thumbnail,
            videoUrl: video.videoUrl,
            downloadedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error saving downloaded video:', error);
        return false;
    }
};

// Get downloaded videos
export const getDownloadedVideos = async () => {
    try {
        return await db.downloadedVideos.toArray();
    } catch (error) {
        console.error('Error getting downloaded videos:', error);
        return [];
    }
};

// Check if video is downloaded
export const isVideoDownloaded = async (videoId) => {
    try {
        const video = await db.downloadedVideos.get(videoId);
        return !!video;
    } catch (error) {
        return false;
    }
};

// Remove downloaded video
export const removeDownloadedVideo = async (videoId) => {
    try {
        await db.downloadedVideos.delete(videoId);
        return true;
    } catch (error) {
        console.error('Error removing downloaded video:', error);
        return false;
    }
};

// Cache user session
export const cacheUserSession = async (token, user) => {
    try {
        await db.userSession.put({
            id: 'current',
            token,
            user
        });
    } catch (error) {
        console.error('Error caching user session:', error);
    }
};

// Get cached user session
export const getCachedUserSession = async () => {
    try {
        return await db.userSession.get('current');
    } catch (error) {
        console.error('Error getting cached user session:', error);
        return null;
    }
};

// Clear user session
export const clearUserSession = async () => {
    try {
        await db.userSession.delete('current');
    } catch (error) {
        console.error('Error clearing user session:', error);
    }
};

export default db;
