import { Link } from 'react-router-dom';
import {
    BookOpen,
    Video,
    FileText,
    BarChart3,
    Users,
    Settings,
    Sparkles,
    ArrowRight,
    Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        icon: BookOpen,
        title: 'Playlist Management',
        description: 'Create, edit, and organize your playlists by categories or themes. Discover trending playlists curated by experts to enhance your learning.',
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-slate-800',
        action: 'Explore Playlists',
        link: '/playlists'
    },
    {
        icon: Video,
        title: 'Video Integration',
        description: 'Search for and add YouTube videos to your playlists using our integrated video search and YouTube Data API.',
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-slate-800',
        action: 'Add Videos',
        link: '/playlists'
    },
    {
        icon: FileText,
        title: 'Note-Taking',
        description: 'Take timestamped notes while watching videos. Manage your notes by adding, editing, or deleting them as needed.',
        color: 'from-orange-500 to-amber-600',
        bgColor: 'bg-slate-800',
        action: 'Start Taking Notes',
        link: '/playlists'
    },
    {
        icon: BarChart3,
        title: 'Progress Tracking',
        description: 'Keep track of your learning progress with detailed analytics. See completion rates, watch time, and learning streaks.',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'bg-sky-600',
        action: 'View Progress',
        link: '/dashboard'
    },
    {
        icon: Users,
        title: 'Collaboration and Sharing',
        description: 'Share your playlists with friends and collaborate on learning paths. Build a community of learners.',
        color: 'from-yellow-500 to-orange-600',
        bgColor: 'bg-sky-600',
        action: 'Coming Soon',
        link: '#',
        disabled: true
    },
    {
        icon: Settings,
        title: 'Creator Mode',
        description: 'Become a creator and build your own courses. Share your knowledge and help others learn.',
        color: 'from-pink-500 to-rose-600',
        bgColor: 'bg-sky-600',
        action: 'Coming Soon',
        link: '#',
        disabled: true
    }
];

const Home = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">Eduflex</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                            <Moon className="w-5 h-5 text-yellow-400" />
                        </button>
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Text */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Welcome to <span className="text-blue-400">Eduflex</span>: Your Ultimate Learning Hub!
                        </h1>
                        <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                            Enhance your learning experience with Eduflex: Create and manage playlists, integrate YouTube videos,
                            take timestamped notes, track your progress, and collaborate seamlessly.
                        </p>
                    </div>

                    {/* AI Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-purple-300 font-medium">Powered by AI Recommendations</span>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`${feature.bgColor} rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 group`}
                            >
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                                    {feature.description}
                                </p>

                                {/* Action Button */}
                                {feature.disabled ? (
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg text-sm cursor-not-allowed">
                                        {feature.action}
                                    </span>
                                ) : (
                                    <Link
                                        to={feature.link}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        {feature.action}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Stats Section */}
                    {isAuthenticated && user && (
                        <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Welcome back, {user.name}! 👋
                            </h2>
                            <p className="text-slate-400">
                                Continue your learning journey from where you left off.
                            </p>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-slate-800">
                <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
                    <p>© 2024 Eduflex. Built for SDG-4: Quality Education for All.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
