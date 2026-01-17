import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Playlists from './pages/Playlists';
import Player from './pages/Player';
import Downloads from './pages/Downloads';
import SavedNotes from './pages/SavedNotes';
import Todos from './pages/Todos';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950">
                <LoadingSpinner message="Loading..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950">
                <LoadingSpinner message="Loading..." />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <OfflineProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/playlists"
                            element={
                                <ProtectedRoute>
                                    <Playlists />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/playlist/:playlistId"
                            element={
                                <ProtectedRoute>
                                    <Player />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/playlist/:playlistId/video/:videoId"
                            element={
                                <ProtectedRoute>
                                    <Player />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/downloads"
                            element={
                                <ProtectedRoute>
                                    <Downloads />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/todos"
                            element={
                                <ProtectedRoute>
                                    <Todos />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/notes"
                            element={
                                <ProtectedRoute>
                                    <SavedNotes />
                                </ProtectedRoute>
                            }
                        />

                        {/* Public Home/Feature Hub */}
                        <Route path="/home" element={<Home />} />

                        {/* Default redirect */}
                        <Route path="/" element={<Home />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </OfflineProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
