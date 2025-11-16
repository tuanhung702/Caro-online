# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pages:                   Components:                          │
│  ├─ Login.jsx            ├─ Board.jsx                         │
│  ├─ Register.jsx         ├─ GameBoard.jsx                     │
│  ├─ Home.jsx             ├─ UserStats.jsx (NEW)               │
│  ├─ GameOnline.jsx       ├─ ChatBox.jsx                       │
│  └─ Profile.jsx (NEW)    └─ RoomList.jsx                      │
│                                                                 │
│  LocalStorage:                                                 │
│  ├─ authToken                                                 │
│  ├─ userId                                                    │
│  ├─ username                                                  │
│  └─ email (NEW)                                               │
│                                                                 │
└──────────────────────────────────────────────────────────────────┘
           ↕ HTTP REST API & WebSocket (SocketIO)
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND (Flask)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Routes:                                                        │
│  ├─ /api/auth/login (auth_routes.py)                          │
│  ├─ /api/auth/register (auth_routes.py)                       │
│  ├─ /api/match/save_result (match_routes.py) (NEW)            │
│  ├─ /api/match/stats/<user_id> (match_routes.py) (NEW)        │
│  ├─ /api/match/history/<user_id> (match_routes.py) (NEW)      │
│  └─ /api/rooms/* (room_routes.py)                             │
│                                                                  │
│  SocketIO Events:                                               │
│  ├─ make_move (game_events.py) → save_match_result()          │
│  ├─ surrender (game_events.py) → save_match_result()          │
│  └─ ...                                                         │
│                                                                  │
│  Services:                                                      │
│  ├─ supabase_service.py                                        │
│  │  ├─ authenticate_user()                                    │
│  │  └─ register_new_user()                                    │
│  │                                                             │
│  └─ match_service.py (NEW)                                    │
│     ├─ save_match_result()                                    │
│     ├─ get_user_match_history()                               │
│     └─ get_user_stats()                                       │
│                                                                  │
│  Room Management:                                               │
│  ├─ RoomManager (states/room_manager.py)                      │
│  └─ GameRoom (models/gameroom.py)                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
           ↕ SQL Queries (with SERVICE_KEY bypass)
┌──────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Auth Tables (Built-in):                                        │
│  └─ auth.users (managed by Supabase)                           │
│                                                                  │
│  Custom Tables:                                                 │
│  ├─ profiles (NEW)                                             │
│  │  ├─ user_id (UUID, PK)                                     │
│  │  ├─ username (TEXT, UNIQUE)                                │
│  │  ├─ email (TEXT, UNIQUE)                                   │
│  │  ├─ elo_score (INT)                                        │
│  │  ├─ total_wins (INT)                                       │
│  │  ├─ total_losses (INT)                                     │
│  │  ├─ created_at (TIMESTAMP)                                 │
│  │  └─ updated_at (TIMESTAMP)                                 │
│  │                                                             │
│  └─ match_history (NEW)                                        │
│     ├─ match_history_id (BIGSERIAL, PK)                       │
│     ├─ user_id (UUID, FK)                                     │
│     ├─ opponent_username (TEXT)                               │
│     ├─ result (TEXT: win/loss/draw)                           │
│     ├─ elo_change (INT)                                       │
│     ├─ match_date (TIMESTAMP)                                 │
│     ├─ final_board_state (TEXT/JSON)                          │
│     ├─ duration_seconds (INT)                                 │
│     └─ created_at (TIMESTAMP)                                 │
│                                                                  │
│  Features:                                                      │
│  ├─ RLS (Row Level Security) Policies                          │
│  ├─ Auto-updated timestamps                                    │
│  ├─ Foreign Key Constraints                                    │
│  └─ Indexes for Performance                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Registration Flow
```
┌──────────────────┐
│ Frontend         │
│ Register.jsx     │
│ (email, pwd)     │
└────────┬─────────┘
         │ POST /api/auth/register
         ↓
┌──────────────────────────────────────┐
│ Backend                              │
│ auth_routes.register()               │
│ → supabase_service.register_new_user()│
└────────┬─────────────────────────────┘
         │ Create auth user + insert profile
         ↓
┌──────────────────────────────┐
│ Supabase                     │
│ ✓ auth.users (created)       │
│ ✓ profiles (created)         │
│   ├─ username: auto from email
│   ├─ elo_score: 1000         │
│   └─ total_wins/losses: 0    │
└──────────────────────────────┘
         │ Response: success
         ↓
┌──────────────────┐
│ Frontend         │
│ → Login page     │
└──────────────────┘
```

### 2. Login Flow
```
┌──────────────────┐
│ Frontend         │
│ Login.jsx        │
│ (email, pwd)     │
└────────┬─────────┘
         │ POST /api/auth/login
         ↓
┌──────────────────────────────────────────┐
│ Backend                                  │
│ auth_routes.login()                      │
│ → supabase_service.authenticate_user()   │
└────────┬─────────────────────────────────┘
         │ 1. Verify credentials
         │ 2. Get session token
         │ 3. Query profile table for username
         ↓
┌──────────────────────────────┐
│ Supabase                     │
│ 1. auth.users (verified)     │
│ 2. profiles (fetched)        │
│    └─ username              │
└──────────────────────────────┘
         │ Response: token, userId, username, email
         ↓
┌─────────────────────────┐
│ Frontend localStorage   │
│ ✓ authToken            │
│ ✓ userId               │
│ ✓ username             │
│ ✓ email                │
└────────┬────────────────┘
         ↓
┌──────────────────┐
│ Home page        │
└──────────────────┘
```

### 3. Game & Match Saving Flow
```
┌──────────────────────────────────┐
│ Frontend (GameOnline.jsx)        │
│ make_move(row, col)              │
└────────┬─────────────────────────┘
         │ SocketIO event: make_move
         ↓
┌──────────────────────────────────────────┐
│ Backend (game_events.py)                 │
│ handle_make_move()                       │
│ 1. Verify move                           │
│ 2. Update board                          │
│ 3. Check winner                          │
└────────┬─────────────────────────────────┘
         │
         ├─ [Game continues] ✓
         │
         └─ [Game finished] → save_match_result()
                ↓
         ┌──────────────────────────────┐
         │ match_service.py             │
         │ save_match_result()          │
         │ 1. Insert match_history      │
         │ 2. Update profiles (winner)  │
         │    ├─ elo_score += 16       │
         │    └─ total_wins += 1        │
         │ 3. Update profiles (loser)   │
         │    ├─ elo_score -= 16       │
         │    └─ total_losses += 1      │
         └──────────┬───────────────────┘
                    │ SQL INSERT + UPDATE
                    ↓
         ┌──────────────────────────┐
         │ Supabase                 │
         │ ✓ match_history (saved)  │
         │ ✓ profiles (updated)     │
         └──────────────────────────┘
```

### 4. Statistics Flow
```
┌──────────────────────┐
│ Frontend             │
│ Profile.jsx          │
│ UserStats.jsx        │
└────────┬─────────────┘
         │ GET /api/match/stats/<user_id>
         ↓
┌────────────────────────────────┐
│ Backend                        │
│ match_routes.get_stats()       │
│ → match_service.get_user_stats()│
└────────┬───────────────────────┘
         │ Query profiles table
         ↓
┌───────────────────────────┐
│ Supabase                  │
│ SELECT * FROM profiles    │
│ WHERE user_id = ?         │
└───────────────────────────┘
         │ Return: elo_score, wins, losses
         ↓
┌────────────────────────────────┐
│ Backend                        │
│ Calculate:                     │
│ ├─ total_games                 │
│ ├─ win_rate %                  │
│ └─ JSON response               │
└────────┬───────────────────────┘
         │ HTTP 200 JSON
         ↓
┌──────────────────────┐
│ Frontend             │
│ Render stats UI      │
│ ├─ ELO: 1032        │
│ ├─ Wins: 5          │
│ ├─ Losses: 2        │
│ └─ Win Rate: 71.4%   │
└──────────────────────┘
```

---

## Key Features

### ✅ Authentication
- User registration with Supabase Auth
- Auto-create profile on registration
- Login with token session
- Email-based identification

### ✅ Database Integration
- RLS policies for security
- Automatic timestamps
- Indexes for performance
- Foreign key constraints

### ✅ Match Management
- Real-time game state tracking
- Automatic result saving
- ELO rating system (±16 points)
- Match history preservation

### ✅ Statistics
- Personal stats dashboard
- Win rate calculation
- Match history viewing
- ELO score tracking

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, TailwindCSS |
| Backend | Flask, Flask-SocketIO |
| Real-time | WebSocket (Socket.IO) |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Language | Python, JavaScript |

---

**Diagram created: 2025-11-16**
