# StudSphere

A modern student community platform where students build, share, and grow together.

## Features

- **Auth** — Signup/login with JWT, Founder badge, Build in Public mode
- **Feed** — Blog posts & quick thoughts with tags, like, comment, save
- **Explore** — Discover and follow other students/founders
- **Real-time Chat** — 1:1 DMs via Socket.io with typing indicators
- **Notifications** — Likes, comments, follows, messages
- **Focus Corner** — Pomodoro timer, daily task list, monthly analytics
- **Dark/Light Theme** — Toggle anytime

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Plain CSS (no framework) |
| Backend | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) |
| Realtime | Socket.io |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas free tier)

### Setup

```bash
# 1. Clone and enter
git clone https://github.com/YOUR_USERNAME/studsphere.git
cd studsphere

# 2. Install all dependencies
npm run install:all

# 3. Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Run in development
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

### Environment Variables

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/studsphere
JWT_SECRET=your-secret-key-min-32-chars
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

## Project Structure

```
studsphere/
├── server/
│   ├── index.js          # Express + Socket.io server
│   ├── lib/db.js          # MongoDB connection
│   ├── middleware/auth.js  # JWT protection
│   ├── models/            # User, Post, Message, Notification, FocusSession
│   └── routes/            # auth, users, posts, messages, notifications, focus
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── context/       # AuthContext, ThemeContext
│   │   ├── hooks/         # useSocket
│   │   ├── lib/api.js     # Axios client
│   │   ├── components/    # Layout, PostCard, CreatePost
│   │   └── pages/         # Home, Explore, Profile, Messages, Notifications, Focus, Saved
│   └── package.json
└── package.json
```

## Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import in Vercel, set root to `client/`
3. Add env: `VITE_API_URL` = your backend URL

### Backend → Render / Railway
1. Root directory: `/`
2. Build: `npm install`
3. Start: `node server/index.js`
4. Add env variables

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Copy connection string to `MONGODB_URI`

## License

MIT
