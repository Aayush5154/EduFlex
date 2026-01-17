import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Don't redirect on 401, let the auth context handle it
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me')
};

// Playlists API
export const playlistsAPI = {
    getAll: () => api.get('/playlists'),
    getOne: (id) => api.get(`/playlists/${id}`),
    create: (data) => api.post('/playlists', data),
    enroll: (id) => api.post(`/playlists/${id}/enroll`),
    getMyPlaylists: () => api.get('/playlists/teacher/me'),
    delete: (id) => api.delete(`/playlists/${id}`)
};

// Videos API
export const videosAPI = {
    getAll: () => api.get('/videos'),
    getOne: (id) => api.get(`/videos/${id}`),
    create: (data) => api.post('/videos', data)
};

// Progress API
export const progressAPI = {
    getAll: () => api.get('/progress'),
    getPlaylistProgress: (playlistId) => api.get(`/progress/playlist/${playlistId}`),
    getForPlaylist: (playlistId) => api.get(`/progress/playlist/${playlistId}`),
    update: (data) => api.post('/progress', data),
    sync: (progressData) => api.post('/progress/sync', { progressData })
};

// Analytics API
export const analyticsAPI = {
    getTeacherStats: () => api.get('/analytics/teacher'),
    getStudentStats: () => api.get('/analytics/student')
};

// Notes API
export const notesAPI = {
    getAll: () => api.get('/notes'),
    getVideoNotes: (videoId) => api.get(`/notes/video/${videoId}`),
    getPinned: () => api.get('/notes/pinned'),
    create: (data) => api.post('/notes', data),
    update: (id, data) => api.put(`/notes/${id}`, data),
    delete: (id) => api.delete(`/notes/${id}`),
    togglePin: (id) => api.patch(`/notes/${id}/pin`)
};

// Recommendations API (AI-powered)
export const recommendationsAPI = {
    get: (limit = 6) => api.get(`/recommendations?limit=${limit}`),
    getLearningPath: () => api.get('/recommendations/learning-path'),
    getEstimate: (playlistId) => api.get(`/recommendations/estimate/${playlistId}`)
};

// AI API (Summaries & Quizzes)
export const aiAPI = {
    getSummary: (videoId) => api.get(`/ai/summary/${videoId}`),
    regenerateSummary: (videoId) => api.post(`/ai/summary/${videoId}/regenerate`),
    getQuiz: (videoId) => api.get(`/ai/quiz/${videoId}`),
    submitQuiz: (videoId, answers) => api.post(`/ai/quiz/${videoId}/submit`, { answers }),
    getQuizHistory: () => api.get('/ai/quiz/history')
};

// Chatbot API
export const chatbotAPI = {
    chat: (videoId, message) => api.post(`/chatbot/${videoId}/chat`, { message }),
    getSuggestions: (videoId) => api.get(`/chatbot/${videoId}/suggestions`)
};

// Todos API
export const todosAPI = {
    getAll: (params) => api.get('/todos', { params }),
    create: (data) => api.post('/todos', data),
    update: (id, data) => api.put(`/todos/${id}`, data),
    delete: (id) => api.delete(`/todos/${id}`),
    toggle: (id) => api.patch(`/todos/${id}/toggle`)
};

export default api;



