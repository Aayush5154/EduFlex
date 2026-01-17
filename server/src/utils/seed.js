require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Video = require('../models/Video');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eduflex_lite';

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('📦 Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Playlist.deleteMany({});
        await Video.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Teacher
        const teacher = await User.create({
            name: 'Dr. Sarah Johnson',
            email: 'teacher@eduflex.com',
            password: 'teacher123',
            role: 'teacher',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        });
        console.log('👩‍🏫 Created teacher:', teacher.email);

        // Create Student
        const student = await User.create({
            name: 'Alex Student',
            email: 'student@eduflex.com',
            password: 'student123',
            role: 'student',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
        });
        console.log('👨‍🎓 Created student:', student.email);

        // Create Playlists
        const playlist1 = await Playlist.create({
            title: 'Introduction to Web Development',
            description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch.',
            thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
            teacher: teacher._id,
            category: 'technology',
            difficulty: 'beginner',
            totalVideos: 3,
            totalDuration: 2700,
            enrolledCount: 1
        });

        const playlist2 = await Playlist.create({
            title: 'Mathematics for Everyone',
            description: 'Master essential math concepts from basic algebra to calculus with interactive examples.',
            thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop',
            teacher: teacher._id,
            category: 'mathematics',
            difficulty: 'intermediate',
            totalVideos: 2,
            totalDuration: 1800,
            enrolledCount: 1
        });

        console.log('📚 Created 2 playlists');

        // Enroll student in both playlists
        student.enrolledPlaylists = [playlist1._id, playlist2._id];
        await student.save();

        // Create Videos for Playlist 1
        const videos1 = await Video.insertMany([
            {
                title: 'HTML Fundamentals - Building Your First Page',
                description: 'Learn the basic structure of HTML documents and essential tags.',
                videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
                thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=225&fit=crop',
                duration: 900,
                playlist: playlist1._id,
                order: 1
            },
            {
                title: 'CSS Styling - Making Beautiful Websites',
                description: 'Master CSS selectors, properties, and responsive design techniques.',
                videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
                thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
                duration: 900,
                playlist: playlist1._id,
                order: 2
            },
            {
                title: 'JavaScript Basics - Adding Interactivity',
                description: 'Introduction to JavaScript variables, functions, and DOM manipulation.',
                videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
                thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop',
                duration: 900,
                playlist: playlist1._id,
                order: 3
            }
        ]);

        // Create Videos for Playlist 2
        const videos2 = await Video.insertMany([
            {
                title: 'Algebra Essentials - Variables and Equations',
                description: 'Understanding algebraic expressions and solving equations step by step.',
                videoUrl: 'https://www.youtube.com/watch?v=NybHckSEQBI',
                thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop',
                duration: 900,
                playlist: playlist2._id,
                order: 1
            },
            {
                title: 'Geometry Foundations - Shapes and Theorems',
                description: 'Explore geometric shapes, angles, and fundamental theorems.',
                videoUrl: 'https://www.youtube.com/watch?v=302eJ3TzJQU',
                thumbnail: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=225&fit=crop',
                duration: 900,
                playlist: playlist2._id,
                order: 2
            }
        ]);

        console.log('🎬 Created 5 videos');

        console.log(`
    ✅ Database seeded successfully!
    
    📋 Test Credentials:
    ─────────────────────────
    👩‍🏫 Teacher Account:
       Email: teacher@eduflex.com
       Password: teacher123
    
    👨‍🎓 Student Account:
       Email: student@eduflex.com
       Password: student123
    ─────────────────────────
    `);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
