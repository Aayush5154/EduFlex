import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        if (!navigator.onLine) return;
        // If we were offline and now online, trigger sync
        if (wasOffline) {
            window.dispatchEvent(new CustomEvent('connectionRestored'));
        }
    }, [wasOffline]);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        setWasOffline(true);
    }, []);

    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return { isOnline, wasOffline };
};

export default useNetworkStatus;
