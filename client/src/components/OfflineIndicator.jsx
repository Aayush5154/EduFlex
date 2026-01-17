import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { clsx } from 'clsx';

const OfflineIndicator = () => {
    const { isOnline, wasOffline, syncOfflineData } = useOffline();
    const [showSynced, setShowSynced] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (isOnline && wasOffline) {
            setIsSyncing(true);
            syncOfflineData().then(() => {
                setIsSyncing(false);
                setShowSynced(true);
                setTimeout(() => setShowSynced(false), 3000);
            });
        }
    }, [isOnline, wasOffline, syncOfflineData]);

    if (isOnline && !wasOffline && !showSynced) {
        return null;
    }

    return (
        <div
            className={clsx(
                'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
                'px-5 py-3 rounded-full shadow-2xl',
                'flex items-center gap-3',
                'animate-slide-up transition-all duration-300',
                {
                    'bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-xl': !isOnline,
                    'bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-xl': isSyncing,
                    'bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-xl': showSynced && !isSyncing
                }
            )}
        >
            {!isOnline ? (
                <>
                    <div className="relative">
                        <WifiOff className="w-5 h-5 text-white" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full pulse-ring" />
                    </div>
                    <span className="text-white font-medium text-sm">
                        You're offline — Changes saved locally
                    </span>
                </>
            ) : isSyncing ? (
                <>
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    <span className="text-white font-medium text-sm">
                        Syncing offline data...
                    </span>
                </>
            ) : showSynced ? (
                <>
                    <Check className="w-5 h-5 text-white" />
                    <span className="text-white font-medium text-sm">
                        All changes synced!
                    </span>
                </>
            ) : null}
        </div>
    );
};

export default OfflineIndicator;
