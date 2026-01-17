import { clsx } from 'clsx';

const StatCard = ({ icon: Icon, label, value, color = 'primary', trend }) => {
    const colorClasses = {
        primary: 'from-primary-500/20 to-purple-500/20 border-primary-500/30',
        green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
        orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
        pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30'
    };

    const iconColors = {
        primary: 'text-primary-400',
        green: 'text-green-400',
        blue: 'text-blue-400',
        orange: 'text-orange-400',
        pink: 'text-pink-400'
    };

    return (
        <div className={clsx(
            'glass-card p-6 bg-gradient-to-br border',
            colorClasses[color]
        )}>
            <div className="flex items-start justify-between mb-4">
                <div className={clsx(
                    'p-3 rounded-xl bg-white/5',
                    iconColors[color]
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={clsx(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    )}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>

            <div>
                <p className="text-gray-400 text-sm mb-1">{label}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
