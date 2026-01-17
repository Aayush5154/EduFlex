import { useState, useEffect } from 'react';
import {
    Plus,
    Check,
    Trash2,
    Edit2,
    Calendar,
    Flag,
    X,
    CheckCircle,
    Circle,
    Filter
} from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { todosAPI } from '../api/api';
import { clsx } from 'clsx';

const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const Todos = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchTodos();
    }, [filter]);

    const fetchTodos = async () => {
        try {
            const params = {};
            if (filter !== 'all') {
                params.status = filter;
            }
            const res = await todosAPI.getAll(params);
            setTodos(res.data.data);
        } catch (error) {
            console.error('Error fetching todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTodo) {
                await todosAPI.update(editingTodo._id, formData);
            } else {
                await todosAPI.create(formData);
            }
            setFormData({ title: '', description: '', dueDate: '', priority: 'medium' });
            setShowAddForm(false);
            setEditingTodo(null);
            fetchTodos();
        } catch (error) {
            console.error('Error saving todo:', error);
        }
    };

    const handleToggle = async (id) => {
        try {
            await todosAPI.toggle(id);
            fetchTodos();
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this todo?')) return;
        try {
            await todosAPI.delete(id);
            fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const handleEdit = (todo) => {
        setEditingTodo(todo);
        setFormData({
            title: todo.title,
            description: todo.description || '',
            dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
            priority: todo.priority
        });
        setShowAddForm(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner message="Loading your todos..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Todos</h1>
                        <p className="text-gray-400">Track your learning goals and tasks</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingTodo(null);
                            setFormData({ title: '', description: '', dueDate: '', priority: 'medium' });
                            setShowAddForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        Add Todo
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    {['all', 'active', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={clsx(
                                'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                                filter === f
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Add/Edit Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-700">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingTodo ? 'Edit Todo' : 'Add New Todo'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingTodo(null);
                                    }}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="What do you need to do?"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add more details..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setEditingTodo(null);
                                        }}
                                        className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                                    >
                                        {editingTodo ? 'Update' : 'Add Todo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Todos List */}
                {todos.length > 0 ? (
                    <div className="space-y-3">
                        {todos.map((todo) => (
                            <div
                                key={todo._id}
                                className={clsx(
                                    'bg-slate-800/50 border rounded-xl p-4 transition-all',
                                    todo.completed
                                        ? 'border-slate-700/50 opacity-60'
                                        : 'border-slate-700 hover:border-slate-600'
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Toggle Button */}
                                    <button
                                        onClick={() => handleToggle(todo._id)}
                                        className={clsx(
                                            'flex-shrink-0 mt-1 transition-colors',
                                            todo.completed ? 'text-green-400' : 'text-gray-400 hover:text-primary-400'
                                        )}
                                    >
                                        {todo.completed ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <Circle className="w-6 h-6" />
                                        )}
                                    </button>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={clsx(
                                            'font-medium',
                                            todo.completed ? 'text-gray-400 line-through' : 'text-white'
                                        )}>
                                            {todo.title}
                                        </h3>
                                        {todo.description && (
                                            <p className="text-sm text-gray-400 mt-1">{todo.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            {/* Priority Badge */}
                                            <span className={clsx(
                                                'px-2 py-0.5 rounded-full text-xs font-medium border capitalize',
                                                priorityColors[todo.priority]
                                            )}>
                                                <Flag className="w-3 h-3 inline mr-1" />
                                                {todo.priority}
                                            </span>

                                            {/* Due Date */}
                                            {todo.dueDate && (
                                                <span className={clsx(
                                                    'flex items-center gap-1 text-xs',
                                                    isOverdue(todo.dueDate) && !todo.completed
                                                        ? 'text-red-400'
                                                        : 'text-gray-400'
                                                )}>
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(todo.dueDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(todo)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(todo._id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-xl p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {filter === 'completed' ? 'No completed todos' : filter === 'active' ? 'All caught up!' : 'No todos yet'}
                        </h3>
                        <p className="text-gray-400 mb-4">
                            {filter === 'all' ? 'Start by adding your first todo' : 'Try changing the filter'}
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                            >
                                Add First Todo
                            </button>
                        )}
                    </div>
                )}

                {/* Stats */}
                {todos.length > 0 && (
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                        <span>{todos.filter(t => !t.completed).length} active</span>
                        <span>•</span>
                        <span>{todos.filter(t => t.completed).length} completed</span>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Todos;
