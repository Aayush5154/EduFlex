# 🎓 EduFlex Lite

> **Offline-First Education Platform for Low-Bandwidth Regions**
> 
> *Empowering Quality Education for All — SDG-4 Mission*

![EduFlex Banner](https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop)

## 🌍 The Problem We're Solving

**2.9 billion people** worldwide lack reliable internet access. In many developing regions, students struggle to access educational content due to:

- 📡 Unreliable or no internet connectivity
- 📱 Limited mobile data plans
- ⚡ Power outages interrupting learning
- 🏫 Remote locations without infrastructure

**EduFlex Lite** bridges this gap with an **offline-first architecture**, ensuring education continues regardless of connectivity.

---

## ✨ Key Features

### 🔌 Offline-First Engine
- **Service Worker** caches the entire app shell
- **IndexedDB (Dexie.js)** stores playlists, videos, and progress locally
- **Automatic background sync** when connectivity returns
- **Download for Offline** button on every video

### 📊 Smart Progress Tracking
- Tracks video watch progress in real-time
- Syncs offline progress automatically when online
- Visual progress indicators across all content

### 👥 Role-Based Dashboards
- **Student Dashboard**: Enrolled courses, watch time, completed videos
- **Teacher Dashboard**: Course management, student analytics

### 🎨 Modern UI/UX
- Glassmorphism design with smooth animations
- Fully responsive (mobile-first)
- Dark mode optimized
- PWA installable on any device

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Offline** | Service Workers, Dexie.js (IndexedDB) |
| **Auth** | JWT, bcryptjs |
| **UI Icons** | Lucide React |
| **Video** | React Player |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/EduFlex-Lite.git
cd EduFlex-Lite

# Install all dependencies
npm run install:all

# Configure environment variables
# Edit server/.env with your MongoDB URI

# Seed the database with demo data
npm run seed

# Start the development servers
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| 👩‍🏫 Teacher | `teacher@eduflex.com` | `teacher123` |
| 👨‍🎓 Student | `student@eduflex.com` | `student123` |

---

## 📱 Offline Demo Steps

1. **Login** using the test credentials above
2. **Browse courses** and open a playlist
3. **Click the download button** on a video
4. **Disable your network** (Chrome DevTools > Network > Offline)
5. **Refresh the page** — the app still works!
6. **Watch a video** — progress is saved to IndexedDB
7. **Re-enable network** — see the "Syncing" toast appear
8. **Progress syncs** automatically to MongoDB

---

## 📁 Project Structure

```
EduFlex-Lite/
├── server/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Seed script
│   │   └── server.js       # Express app
│   └── .env
├── client/
│   ├── public/
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js           # Service Worker
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # React components
│   │   ├── context/        # Auth & Offline contexts
│   │   ├── db/             # Dexie.js config
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   └── main.jsx        # Entry point
│   └── .env
└── package.json            # Concurrent dev script
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Playlists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/playlists` | Get all playlists |
| GET | `/api/playlists/:id` | Get playlist with videos |
| POST | `/api/playlists/:id/enroll` | Enroll in playlist |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/progress` | Update video progress |
| POST | `/api/progress/sync` | Sync offline progress |
| GET | `/api/progress` | Get all user progress |

---

## 🎯 SDG-4 Impact

This project directly contributes to **UN Sustainable Development Goal 4: Quality Education**:

- ✅ **Target 4.3**: Equal access to technical/vocational education
- ✅ **Target 4.4**: Increase youth with relevant skills
- ✅ **Target 4.5**: Eliminate disparities in education access
- ✅ **Target 4.a**: Build inclusive learning environments

---

## 🏆 Hackathon Highlights

- **Fully functional** offline-first PWA
- **Production-ready** code architecture
- **Seeded database** with demo content
- **Beautiful UI** with animations and glassmorphism
- **Single command** to run entire stack
- **Comprehensive documentation**

---

## 📄 License

MIT License — Free for educational use

---

## 👨‍💻 Built With ❤️

*For the billions who deserve education without barriers.*

🌐 **Learn Anywhere. Learn Anytime. Learn Offline.**
