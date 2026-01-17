import { Link } from 'react-router-dom';
import {
    BookOpen,
    Video,
    FileText,
    BarChart3,
    Users,
    Settings,
    ArrowRight,
    CheckCircle,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        icon: BookOpen,
        title: 'Playlist Management',
        description: 'Create, edit, and organize your playlists by categories or themes.',
        action: 'Explore Playlists',
        link: '/playlists'
    },
    {
        icon: Video,
        title: 'Video Integration',
        description: 'Search for and add YouTube videos to your playlists seamlessly.',
        action: 'Add Videos',
        link: '/playlists'
    },
    {
        icon: FileText,
        title: 'Note-Taking',
        description: 'Take timestamped notes while watching videos for better retention.',
        action: 'Start Taking Notes',
        link: '/playlists'
    },
    {
        icon: BarChart3,
        title: 'Progress Tracking',
        description: 'Track your learning progress with detailed analytics and insights.',
        action: 'View Progress',
        link: '/dashboard'
    },
    {
        icon: Users,
        title: 'Collaboration',
        description: 'Share playlists with friends and collaborate on learning paths.',
        action: 'Coming Soon',
        link: '#',
        disabled: true
    },
    {
        icon: Settings,
        title: 'Creator Mode',
        description: 'Build your own courses and share your knowledge with others.',
        action: 'Coming Soon',
        link: '#',
        disabled: true
    }
];

const highlights = [
    'Offline-first learning platform',
    'YouTube video integration',
    'Progress tracking & analytics',
    'Organized course management'
];

const Home = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950">
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <GraduationCap className="w-7 h-7 text-blue-500" />
                        <span className="text-xl font-semibold text-white">EduFlex</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-20">
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Your Personal Learning
                            <br />
                            <span className="text-blue-500">Management System</span>
                        </h1>
                        <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                            A simple, offline-first platform to organize your learning.
                            Create playlists, take notes, and track your progress — all in one place.
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {highlights.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center gap-4">
                            <Link
                                to={isAuthenticated ? "/dashboard" : "/register"}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {isAuthenticated ? "Go to Dashboard" : "Start Learning"}
                            </Link>
                            <Link
                                to="/playlists"
                                className="px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors border border-slate-700"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="py-16 px-6 border-t border-slate-800/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold text-white mb-3">Features</h2>
                            <p className="text-slate-400">Everything you need to manage your learning journey</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
                                        <feature.icon className="w-5 h-5 text-blue-500" />
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {feature.disabled ? (
                                        <span className="text-sm text-slate-500">
                                            {feature.action}
                                        </span>
                                    ) : (
                                        <Link
                                            to={feature.link}
                                            className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors"
                                        >
                                            {feature.action}
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {isAuthenticated && user && (
                    <section className="py-12 px-6 border-t border-slate-800/50">
                        <div className="max-w-4xl mx-auto">
                            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                                <h2 className="text-lg font-semibold text-white mb-2">
                                    Welcome back, {user.name}
                                </h2>
                                <p className="text-slate-400 text-sm mb-4">
                                    Continue your learning journey from where you left off.
                                </p>
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <footer className="py-8 px-6 border-t border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <GraduationCap className="w-5 h-5" />
                        <span>EduFlex — Quality Education for All</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2024 EduFlex. SDG-4 Initiative.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
