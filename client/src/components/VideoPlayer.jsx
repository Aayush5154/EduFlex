import { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    SkipBack,
    SkipForward,
    Download,
    CheckCircle,
    Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { progressAPI } from '../api/api';
import { saveOfflineProgress, saveDownloadedVideo, isVideoDownloaded } from '../db/db';
import { clsx } from 'clsx';

const VideoPlayer = ({
    video,
    playlistId,
    onProgress,
    onComplete,
    savedProgress = 0
}) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const { user } = useAuth();
    const { isOnline } = useOffline();

    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);

    // Check if video is downloaded
    useEffect(() => {
        const checkDownloaded = async () => {
            const result = await isVideoDownloaded(video._id);
            setDownloaded(result);
        };
        checkDownloaded();
    }, [video._id]);

    // Hide controls after inactivity
    useEffect(() => {
        let timeout;
        if (playing && controlsVisible) {
            timeout = setTimeout(() => setControlsVisible(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [playing, controlsVisible]);

    // Seek to saved progress on load
    useEffect(() => {
        if (savedProgress > 0 && playerRef.current && duration > 0) {
            const seekTo = savedProgress / duration;
            playerRef.current.seekTo(seekTo, 'fraction');
        }
    }, [savedProgress, duration]);

    const handleProgress = useCallback(async (state) => {
        if (!seeking) {
            setPlayed(state.played);

            const watchedSeconds = Math.floor(state.playedSeconds);
            const totalSeconds = Math.floor(duration);

            // Report progress every 5 seconds
            if (watchedSeconds > 0 && watchedSeconds % 5 === 0) {
                const progressData = {
                    videoId: video._id,
                    playlistId,
                    watchedSeconds,
                    totalSeconds,
                    isCompleted: state.played >= 0.95
                };

                if (isOnline) {
                    try {
                        await progressAPI.update(progressData);
                    } catch (error) {
                        // Save offline if API fails
                        await saveOfflineProgress(progressData);
                    }
                } else {
                    await saveOfflineProgress(progressData);
                }

                onProgress?.(watchedSeconds, totalSeconds);
            }

            // Video completed
            if (state.played >= 0.95 && !video.completed) {
                onComplete?.();
            }
        }
    }, [seeking, duration, video._id, playlistId, isOnline, onProgress, onComplete]);

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e) => {
        setSeeking(false);
        playerRef.current?.seekTo(parseFloat(e.target.value));
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Simulate download and save metadata to IndexedDB
            await new Promise(resolve => setTimeout(resolve, 1500));
            await saveDownloadedVideo(video);
            setDownloaded(true);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloading(false);
        }
    };

    const skipForward = () => {
        const current = playerRef.current?.getCurrentTime() || 0;
        playerRef.current?.seekTo(current + 10, 'seconds');
    };

    const skipBackward = () => {
        const current = playerRef.current?.getCurrentTime() || 0;
        playerRef.current?.seekTo(Math.max(0, current - 10), 'seconds');
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current?.requestFullscreen();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={containerRef}
            className="relative aspect-video bg-black rounded-2xl overflow-hidden group"
            onMouseMove={() => setControlsVisible(true)}
            onMouseLeave={() => playing && setControlsVisible(false)}
        >
            <ReactPlayer
                ref={playerRef}
                url={video.videoUrl}
                width="100%"
                height="100%"
                playing={playing}
                muted={muted}
                volume={volume}
                onProgress={handleProgress}
                onDuration={setDuration}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                progressInterval={1000}
                config={{
                    youtube: {
                        playerVars: { modestbranding: 1 }
                    }
                }}
            />

            {/* Controls overlay */}
            <div
                className={clsx(
                    'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30',
                    'transition-opacity duration-300',
                    controlsVisible || !playing ? 'opacity-100' : 'opacity-0'
                )}
            >
                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg truncate">
                        {video.title}
                    </h3>
                </div>

                {/* Center play button */}
                <button
                    onClick={() => setPlaying(!playing)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                    {playing ? (
                        <Pause className="w-10 h-10 text-white" />
                    ) : (
                        <Play className="w-10 h-10 text-white ml-1" />
                    )}
                </button>

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                    {/* Progress bar */}
                    <div className="relative group/progress">
                        <input
                            type="range"
                            min={0}
                            max={0.999999}
                            step="any"
                            value={played}
                            onChange={handleSeekChange}
                            onMouseDown={handleSeekMouseDown}
                            onMouseUp={handleSeekMouseUp}
                            className="w-full h-1.5 rounded-full appearance-none bg-white/30 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-primary-500
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                group-hover/progress:[&::-webkit-slider-thumb]:scale-125
                transition-all"
                            style={{
                                background: `linear-gradient(to right, #6366f1 ${played * 100}%, rgba(255,255,255,0.3) ${played * 100}%)`
                            }}
                        />
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPlaying(!playing)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                {playing ? (
                                    <Pause className="w-6 h-6 text-white" />
                                ) : (
                                    <Play className="w-6 h-6 text-white" />
                                )}
                            </button>

                            <button
                                onClick={skipBackward}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <SkipBack className="w-5 h-5 text-white" />
                            </button>

                            <button
                                onClick={skipForward}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <SkipForward className="w-5 h-5 text-white" />
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMuted(!muted)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    {muted ? (
                                        <VolumeX className="w-5 h-5 text-white" />
                                    ) : (
                                        <Volume2 className="w-5 h-5 text-white" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={muted ? 0 : volume}
                                    onChange={(e) => {
                                        setVolume(parseFloat(e.target.value));
                                        setMuted(false);
                                    }}
                                    className="w-20 h-1 rounded-full appearance-none bg-white/30 cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>

                            <span className="text-white text-sm font-medium ml-2">
                                {formatTime(played * duration)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Download button */}
                            <button
                                onClick={handleDownload}
                                disabled={downloading || downloaded}
                                className={clsx(
                                    'p-2 rounded-lg transition-colors flex items-center gap-2',
                                    downloaded
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'hover:bg-white/10 text-white'
                                )}
                            >
                                {downloading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : downloaded ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <Download className="w-5 h-5" />
                                )}
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <Maximize className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
