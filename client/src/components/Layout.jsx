import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    BookOpen,
    User,
    LogOut,
    Menu,
    X,
    Wifi,
    WifiOff,
    GraduationCap,
    LayoutDashboard,
    Download,
    FileText,
    PlusCircle,
    Sparkles,
    CheckSquare,
    Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import OfflineIndicator from './OfflineIndicator';
import StreakCounter from './StreakCounter';
import { clsx } from 'clsx';

const Layout = ({ children }) => {
    const { user, logout, isTeacher } = useAuth();
    const { isOnline } = useOffline();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = isTeacher
        ? [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/playlists', icon: BookOpen, label: 'My Courses' },
            { path: '/notes', icon: FileText, label: 'Saved Notes' },
        ]
        : [
            { path: '/dashboard', icon: Home, label: 'Home' },
            { path: '/playlists', icon: BookOpen, label: 'Courses' },
            { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
            { path: '/todos', icon: CheckSquare, label: 'My Todos' },
            { path: '/notes', icon: FileText, label: 'Saved Notes' },
            { path: '/downloads', icon: Download, label: 'Downloads' },
        ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950">
            {/* Mobile header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-white/10">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <Link to="/dashboard" className="flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-primary-400" />
                        <span className="font-bold text-xl gradient-text">EduFlex</span>
                    </Link>

                    <div className={clsx(
                        'w-3 h-3 rounded-full',
                        isOnline ? 'bg-green-400' : 'bg-red-400'
                    )} />
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed top-0 left-0 bottom-0 z-50 w-72',
                    'glass border-r border-white/10',
                    'transform transition-transform duration-300 ease-out',
                    'lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full p-6">
                    <Link to="/dashboard" className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-white">EduFlex</h1>
                            <p className="text-xs text-gray-400">Learn Anywhere</p>
                        </div>
                    </Link>

                    {/* Streak Counter - Students Only */}
                    {!isTeacher && (
                        <div className="mb-6">
                            <StreakCounter />
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={clsx(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl',
                                        'transition-all duration-200',
                                        isActive
                                            ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-primary-400 border border-primary-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-white/10 pt-6 mt-6">
                        {/* Online status */}
                        <div className={clsx(
                            'flex items-center gap-2 px-4 py-2 rounded-lg mb-4',
                            isOnline ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        )}>
                            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                            <span className="text-sm font-medium">
                                {isOnline ? 'Online' : 'Offline Mode'}
                            </span>
                        </div>

                        {/* User info */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                            </div>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Offline indicator */}
            <OfflineIndicator />
        </div>
    );
};

export default Layout;
