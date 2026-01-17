const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @desc    Get notes for a video
// @route   GET /api/notes/video/:videoId
router.get('/video/:videoId', async (req, res) => {
    try {
        const notes = await Note.find({
            user: req.user.id,
            video: req.params.videoId
        }).sort('timestamp');

        res.json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all notes for a user
// @route   GET /api/notes
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
            .populate('video', 'title thumbnail')
            .populate('playlist', 'title')
            .sort('-createdAt');

        res.json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get pinned notes
// @route   GET /api/notes/pinned
router.get('/pinned', async (req, res) => {
    try {
        const notes = await Note.find({
            user: req.user.id,
            isPinned: true
        })
            .populate('video', 'title thumbnail')
            .populate('playlist', 'title')
            .sort('-createdAt');

        res.json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Create a note
// @route   POST /api/notes
router.post('/', async (req, res) => {
    try {
        const { videoId, playlistId, content, timestamp } = req.body;

        const note = await Note.create({
            user: req.user.id,
            video: videoId,
            playlist: playlistId,
            content,
            timestamp: timestamp || 0
        });

        res.status(201).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
router.put('/:id', async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        const { content, isPinned, tags } = req.body;

        if (content !== undefined) note.content = content;
        if (isPinned !== undefined) note.isPinned = isPinned;
        if (tags !== undefined) note.tags = tags;

        await note.save();

        res.json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        res.json({ success: true, message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/pin
router.patch('/:id/pin', async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        note.isPinned = !note.isPinned;
        await note.save();

        res.json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
