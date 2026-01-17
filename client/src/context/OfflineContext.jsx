import { createContext, useContext, useEffect, useCallback } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
    getUnsyncedProgress,
    markProgressAsSynced,
    clearSyncedProgress
} from '../db/db';
import { progressAPI } from '../api/api';

const OfflineContext = createContext(null);

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};

export const OfflineProvider = ({ children }) => {
    const { isOnline, wasOffline } = useNetworkStatus();

    // Sync offline progress when connection is restored
    const syncOfflineData = useCallback(async () => {
        if (!isOnline) return;

        try {
            const unsyncedProgress = await getUnsyncedProgress();

            if (unsyncedProgress.length > 0) {
                // Format progress data for API
                const progressData = unsyncedProgress.map(p => ({
                    videoId: p.videoId,
                    playlistId: p.playlistId,
                    watchedSeconds: p.watchedSeconds,
                    totalSeconds: p.totalSeconds,
                    lastWatchedAt: p.createdAt,
                    syncedFromOffline: true
                }));

                // Send to API
                await progressAPI.sync(progressData);

                // Mark as synced
                const ids = unsyncedProgress.map(p => p.id);
                await markProgressAsSynced(ids);

                // Clean up synced data
                await clearSyncedProgress();

                console.log(`✅ Synced ${unsyncedProgress.length} offline progress records`);
            }
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }, [isOnline]);

    // Listen for connection restored event
    useEffect(() => {
        const handleConnectionRestored = () => {
            console.log('🌐 Connection restored, syncing offline data...');
            syncOfflineData();
        };

        window.addEventListener('connectionRestored', handleConnectionRestored);

        return () => {
            window.removeEventListener('connectionRestored', handleConnectionRestored);
        };
    }, [syncOfflineData]);

    // Try to sync when coming online
    useEffect(() => {
        if (isOnline && wasOffline) {
            syncOfflineData();
        }
    }, [isOnline, wasOffline, syncOfflineData]);

    const value = {
        isOnline,
        wasOffline,
        syncOfflineData
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
};

export default OfflineContext;
