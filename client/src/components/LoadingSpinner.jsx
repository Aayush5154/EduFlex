import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', message = 'Loading...' }) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        default: 'w-10 h-10',
        large: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
                <div className={`${sizeClasses[size]} rounded-full border-4 border-primary-500/20 animate-pulse`} />
                <Loader className={`${sizeClasses[size]} text-primary-500 animate-spin absolute top-0 left-0`} />
            </div>
            {message && (
                <p className="mt-4 text-gray-400 text-sm animate-pulse">{message}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
