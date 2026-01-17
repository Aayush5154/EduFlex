# EduFlex - Offline-First Learning Management System

An AI-powered, offline-first Learning Management System (LMS) built with React and Node.js.

## 🚀 Features

- **🔐 User Authentication** - Secure login/signup for students and teachers
- **📚 Course Management** - Create, manage, and enroll in courses
- **🎬 Video Player** - Watch videos with progress tracking
- **📝 Note Taking** - Save notes while watching videos
- **✅ Todo System** - Personal task management for students
- **🔥 Streak Tracking** - Daily login streak counter
- **🏆 Leaderboard** - Gamified XP system with student rankings
- **📴 Offline Support** - Works without internet connection
- **🤖 AI Features** - Video summaries and quiz generation

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS
- Lucide React Icons
- IndexedDB for offline storage

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

## 📁 Project Structure

```
EduFlex-Lite/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API service functions
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React contexts
│   │   ├── pages/         # Page components
│   │   └── db/            # IndexedDB utilities
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── server.js      # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Aayush5154/EduFlex.git
cd EduFlex
```

2. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. Configure environment variables

**server/.env:**
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

**client/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

4. Run the application
```bash
# Backend (from server folder)
npm run dev

# Frontend (from client folder)
npm run dev
```

## 📦 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables

### Frontend (Vercel)
1. Import project on Vercel
2. Set root directory: `client`
3. Framework preset: Vite
4. Add `VITE_API_URL` environment variable

## 👤 Author

**Aayush**

## 📄 License

MIT License
