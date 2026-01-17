import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/api';
import { cacheUserSession, getCachedUserSession, clearUserSession } from '../db/db';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Try to get user from API
                    try {
                        const response = await authAPI.getMe();
                        setUser(response.data.user);
                        await cacheUserSession(token, response.data.user);
                    } catch (apiError) {
                        // If API fails, try cached session
                        const cached = await getCachedUserSession();
                        if (cached) {
                            setUser(cached.user);
                        } else {
                            localStorage.removeItem('token');
                        }
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login(email, password);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
            await cacheUserSession(token, user);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const register = useCallback(async (data) => {
        try {
            setError(null);
            const response = await authAPI.register(data);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
            await cacheUserSession(token, user);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            // Ignore logout API errors
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            await clearUserSession();
        }
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
