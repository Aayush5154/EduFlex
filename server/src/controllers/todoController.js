const Todo = require('../models/Todo');

// @desc    Get all todos for current user
// @route   GET /api/todos
// @access  Private
exports.getTodos = async (req, res) => {
    try {
        const { status, priority } = req.query;

        let query = { user: req.user.id };

        if (status === 'active') {
            query.completed = false;
        } else if (status === 'completed') {
            query.completed = true;
        }

        if (priority) {
            query.priority = priority;
        }

        const todos = await Todo.find(query)
            .sort({ completed: 1, dueDate: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: todos.length,
            data: todos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching todos',
            error: error.message
        });
    }
};

// @desc    Create a todo
// @route   POST /api/todos
// @access  Private
exports.createTodo = async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;

        const todo = await Todo.create({
            user: req.user.id,
            title,
            description,
            dueDate,
            priority
        });

        res.status(201).json({
            success: true,
            data: todo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating todo',
            error: error.message
        });
    }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        // Check ownership
        if (todo.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this todo'
            });
        }

        todo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: todo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating todo',
            error: error.message
        });
    }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        // Check ownership
        if (todo.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this todo'
            });
        }

        await Todo.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Todo deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting todo',
            error: error.message
        });
    }
};

// @desc    Toggle todo completion
// @route   PATCH /api/todos/:id/toggle
// @access  Private
exports.toggleTodo = async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        // Check ownership
        if (todo.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this todo'
            });
        }

        todo.completed = !todo.completed;
        await todo.save();

        res.status(200).json({
            success: true,
            data: todo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling todo',
            error: error.message
        });
    }
};
