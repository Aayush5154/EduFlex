import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    const quickLogin = async (role) => {
        setIsLoading(true);
        setError('');

        const credentials = role === 'teacher'
            ? { email: 'teacher@eduflex.com', password: 'teacher123' }
            : { email: 'student@eduflex.com', password: 'student123' };

        const result = await login(credentials.email, credentials.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-fadeInUp">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 mb-4 animate-glow">
                        <GraduationCap className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">EduFlex Lite</h1>
                    <p className="text-gray-400">Learn Anywhere, Anytime — Even Offline</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 text-sm text-gray-400 bg-dark-800/50 backdrop-blur-sm">
                                Quick Demo Access
                            </span>
                        </div>
                    </div>

                    {/* Quick login buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => quickLogin('student')}
                            disabled={isLoading}
                            className="btn-secondary flex items-center justify-center gap-2 py-3"
                        >
                            <span>👨‍🎓</span>
                            <span>Student</span>
                        </button>
                        <button
                            onClick={() => quickLogin('teacher')}
                            disabled={isLoading}
                            className="btn-secondary flex items-center justify-center gap-2 py-3"
                        >
                            <span>👩‍🏫</span>
                            <span>Teacher</span>
                        </button>
                    </div>

                    {/* Register link */}
                    <p className="text-center text-gray-400 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* SDG Badge */}
                <div className="text-center mt-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                        🌍 Supporting SDG-4: Quality Education
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
