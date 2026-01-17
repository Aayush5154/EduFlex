const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Video = require('../models/Video');
const VideoSummary = require('../models/VideoSummary');

/**
 * Video Chatbot API
 * A simple context-aware chatbot that answers questions about videos
 * Uses video metadata and summary as context (simulated RAG)
 */

// Knowledge base of common programming concepts
const knowledgeBase = {
    html: 'HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It consists of elements like tags that structure content.',
    css: 'CSS (Cascading Style Sheets) is used to style and layout web pages. It controls colors, fonts, spacing, layout, and visual effects.',
    javascript: 'JavaScript is a programming language that enables interactive web pages. It runs in the browser and can manipulate the DOM, handle events, and make API calls.',
    react: 'React is a JavaScript library for building user interfaces. It uses components, JSX syntax, and a virtual DOM for efficient rendering.',
    nodejs: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. It allows you to run JavaScript on the server side.',
    mongodb: 'MongoDB is a NoSQL document database. It stores data in flexible, JSON-like documents called BSON.',
    api: 'An API (Application Programming Interface) is a set of protocols and tools for building software applications. REST APIs use HTTP methods like GET, POST, PUT, DELETE.',
    component: 'In React, a component is a reusable piece of UI. Components can be functional or class-based and accept props to customize their behavior.',
    state: 'State in React is data that changes over time and affects what the component renders. Use useState hook for functional components.',
    hooks: 'React Hooks are functions that let you use state and other React features in functional components. Common hooks: useState, useEffect, useContext.',
    props: 'Props (properties) are inputs to React components. They are passed from parent to child and are read-only.',
    dom: 'The DOM (Document Object Model) is a programming interface for web documents. It represents the page as a tree of objects that can be manipulated with JavaScript.',
    async: 'Async/await is JavaScript syntax for handling asynchronous operations. It makes async code look synchronous and easier to read.',
    fetch: 'Fetch is a modern JavaScript API for making HTTP requests. It returns Promises and is commonly used for API calls.',
    database: 'A database is an organized collection of structured data. Common types: relational (SQL) and non-relational (NoSQL).',
    authentication: 'Authentication verifies user identity. Common methods include JWT tokens, sessions, OAuth, and password hashing.',
    routing: 'Routing in web apps determines which content to display based on the URL. React Router is popular for client-side routing.',
};

// Generate contextual response based on video and question
const generateResponse = (video, summary, question) => {
    const q = question.toLowerCase();
    const videoTitle = (video?.title || '').toLowerCase();
    const videoDesc = (video?.description || '').toLowerCase();
    const summaryText = (summary?.summary || '').toLowerCase();
    const topics = summary?.topics || [];

    // Check for greetings
    if (q.match(/^(hi|hello|hey|good morning|good evening)/)) {
        return `Hello! I'm your learning assistant for "${video?.title || 'this video'}". How can I help you understand the content better?`;
    }

    // Check for topic-specific questions
    for (const [topic, explanation] of Object.entries(knowledgeBase)) {
        if (q.includes(topic) || topics.some(t => t.toLowerCase().includes(topic))) {
            if (q.includes('what is') || q.includes('explain') || q.includes('how')) {
                return `${explanation}\n\nIn the context of this video "${video?.title}", this concept is demonstrated through practical examples.`;
            }
        }
    }

    // Check for summary-related questions
    if (q.includes('summary') || q.includes('about') || q.includes('cover') || q.includes('topic')) {
        if (summary?.summary) {
            return `This video covers: ${summary.summary}\n\nKey points:\n${summary.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Not available'}`;
        }
        return `This video "${video?.title}" covers the fundamental concepts needed to build your skills.`;
    }

    // Check for prerequisite questions
    if (q.includes('prerequisite') || q.includes('before') || q.includes('need to know')) {
        return `For "${video?.title}", it's helpful to have basic understanding of programming fundamentals. If you're new, start with the basics and take it step by step!`;
    }

    // Check for difficulty questions
    if (q.includes('difficult') || q.includes('hard') || q.includes('easy') || q.includes('level')) {
        return `This content starts with the fundamentals and progressively builds up. Take your time, practice along, and don't hesitate to rewatch sections!`;
    }

    // Check for practice questions
    if (q.includes('practice') || q.includes('exercise') || q.includes('project')) {
        return `Great question! After watching, try building a small project. Practice is key to learning. You can also take the quiz below to test your understanding!`;
    }

    // Check for help questions
    if (q.includes('help') || q.includes('stuck') || q.includes('error') || q.includes('not working')) {
        return `I'm here to help! Here are some tips:\n1. Review the relevant section of the video\n2. Check your code for typos\n3. Use the notes feature to mark important parts\n4. Take the quiz to identify knowledge gaps\n\nWhat specific issue are you facing?`;
    }

    // Default response
    return `That's a great question about "${video?.title}"! This video covers the core concepts you need. Feel free to ask about specific topics like HTML, CSS, JavaScript, React, or any concept mentioned in the video. I'm here to help!`;
};

// @desc    Chat with video assistant
// @route   POST /api/chatbot/:videoId/chat
router.post('/:videoId/chat', protect, async (req, res) => {
    try {
        const { videoId } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get video info
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Get summary for context
        const summary = await VideoSummary.findOne({ video: videoId });

        // Generate response
        const response = generateResponse(video, summary, message);

        res.json({
            success: true,
            data: {
                message: response,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing chat',
            error: error.message
        });
    }
});

// @desc    Get suggested questions for a video
// @route   GET /api/chatbot/:videoId/suggestions
router.get('/:videoId/suggestions', protect, async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await Video.findById(videoId);

        const suggestions = [
            `What is this video about?`,
            `What are the key concepts covered?`,
            `What prerequisites do I need?`,
            `How can I practice this?`,
            `I'm stuck, can you help?`
        ];

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching suggestions'
        });
    }
});

module.exports = router;
