# CozyChat 💬

A full-stack real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO.

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Zustand (state management)
- Socket.IO Client
- Tailwind CSS
- Lucide React (icons)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Bcrypt
- Multer (avatar uploads)
- Express Rate Limiter

---

## Features

### 🔐 Authentication
- Secure sign up and sign in with JWT
- HttpOnly cookie + Bearer token support
- Password hashing with bcrypt
- Protected routes via middleware

### 💬 Real-Time Messaging
- Instant message delivery via Socket.IO
- Persistent two-way WebSocket connection
- JWT-authenticated socket handshake
- Multi-tab / multi-device support using Set-based user tracking

### ✅ Message Status
- **Sent** — single tick, message saved to DB
- **Delivered** — double tick, receiver is online
- **Seen** — blue double tick, receiver opened the chat
- Status updates delivered in real-time to the sender via `messageStatusUpdate` socket event
- Bulk status updates on connect (marks all pending `sent` messages as `delivered`)

### 🟢 Online / Offline Status
- Live online indicator per user
- Last seen timestamp saved to DB on disconnect
- Correct multi-device handling — user stays online until all tabs are closed

### ⌨️ Typing Indicator
- Animated three-dot indicator when the other user is typing
- Auto-clears after 1.5 seconds of inactivity
- Powered by `typing` and `stopTyping` socket events

### 📄 Pagination
- Messages fetched in pages of 20 (`?page=1&limit=20`)
- Infinite scroll — older messages load when scrolling to the top
- Scroll position preserved after prepend (no jump to top)
- Sorted by `createdAt` and `_id` for consistent ordering even when timestamps collide

### 🔴 Unread Message Count
- Unread count shown per conversation in the sidebar
- Count fetched accurately from DB on load (`status: sent | delivered`)
- Incremented in real-time via socket when a new message arrives
- Resets to zero instantly when the conversation is opened

### 🚫 Duplicate Message Prevention
- Backend enforces uniqueness via `clientMessageId` unique index in MongoDB
- Frontend deduplicates on every state write using `_id` and `clientMessageId`
- Socket `newMessage` uses smart append — merges optimistic messages instead of duplicating
- Pagination prepend filters against existing message IDs before merging

### 🛡️ Rate Limiting
- **General limiter** — 100 requests per 15 minutes (all routes)
- **Auth limiter** — 10 attempts per 15 minutes (login/signup)
- **Message limiter** — 20 messages per minute (send message route)
- Errors routed through global `AppError` handler for consistent response format

### 🖼️ Avatar Upload
- Profile picture upload via Multer
- Served statically from `/uploads`
- Falls back to generated initials with consistent color per user

---

## Project Structure

```
Chat-Application/
├── Backend/
│   ├── controller/
│   │   ├── message.controller.js   # Send message, fetch paginated messages
│   │   └── user.controller.js      # Auth, user list with unread counts
│   ├── models/
│   │   ├── conversation.model.js   # Stores member IDs + message ID refs
│   │   ├── message.model.js        # Message content, status, clientMessageId
│   │   └── user.model.js
│   ├── socketIo/
│   │   └── server.js               # Socket auth, online tracking, markSeen, typing
│   ├── middleware/
│   │   ├── secureRoute.js          # JWT verification middleware
│   │   └── multer.js               # File upload config
│   ├── routes/
│   │   ├── message.route.js
│   │   └── user.route.js
│   └── index.js
│
└── Frontend/src/
    ├── context/
    │   ├── SocketContext.jsx        # Socket connection + online users
    │   ├── useGetMessage.js         # Paginated fetch + infinite scroll
    │   ├── useGetSocketMessage.js   # Socket message + status listeners
    │   ├── useGetAllUsers.jsx       # User list + real-time unread counts
    │   └── useSendMessage.js        # Optimistic send + socket emit
    ├── home/
    │   ├── left/
    │   │   ├── User.jsx             # Conversation row with unread badge
    │   │   └── Users.jsx            # Sidebar user list
    │   └── right/
    │       ├── Messages.jsx         # Message list, scroll, pagination, markSeen
    │       ├── Message.jsx          # Single message bubble with tick status
    │       └── TypeMsg.jsx          # Input with typing indicator emit
    └── zustand/
        └── userConversation.js      # Global state: messages, setMessages, appendMessage, updateMessageStatus
```

---

## Data Models

### Message
```js
{
  senderId:        ObjectId,
  receiverId:      ObjectId,
  conversationId:  ObjectId,
  message:         String,
  status:          "sent" | "delivered" | "seen",
  clientMessageId: String (unique),   // prevents duplicates
  createdAt:       Date,
}
```

### Conversation
```js
{
  members:  [ObjectId],   // two users
  messages: [ObjectId],   // references to Message documents
}
```

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `newMessage` | server → client | New message delivered to receiver |
| `messageStatusUpdate` | server → client | Tick update: `{ messageId, status }` |
| `markSeen` | client → server | Viewer opens chat, bulk marks messages as seen |
| `typing` | client → server → client | User started typing |
| `stopTyping` | client → server → client | User stopped typing |
| `getOnlineUsers` | server → all clients | Broadcast updated online user list |

---

## Message Status Flow

```
Message sent
     ↓
status: "sent"          ← saved to DB, single tick shown
     ↓
Receiver connects
     ↓
status: "delivered"     ← bulk updated on socket connect, double grey tick
     ↓
Receiver opens chat
     ↓
socket.emit("markSeen") ← frontend emits with senderId
     ↓
status: "seen"          ← bulk updated in DB
     ↓
Sender receives messageStatusUpdate
     ↓
UI shows blue double tick ✓✓
```

---

## Architecture Decisions

**Why separate Conversation and Message models?**
MongoDB has a 16MB document limit. Embedding messages inside conversations would hit this limit in active chats. Keeping them separate allows efficient pagination, easy deletion, and clean `.populate()` joins.

**Why `clientMessageId`?**
Prevents race condition duplicates. A `findOne` check before insert is not atomic — two concurrent requests can both pass the check. A unique index at the DB level guarantees only one insert succeeds.

**Why sort by both `createdAt` and `_id`?**
MongoDB ObjectIds contain a timestamp and an incrementing counter, so even if two messages share the same `createdAt` millisecond, `_id` ordering is always correct.

**Why store online users in a `Set` per userId?**
A user can be logged in from multiple tabs or devices. A Set prevents duplicate socket IDs and correctly handles the case where closing one tab shouldn't mark the user as offline.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd Chat-Application

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd Frontend
npm install
```

### Environment Variables

Create a `.env` file in `/Backend`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Running the App

```bash
# Start backend (from /Backend)
npm run dev

# Start frontend (from /Frontend)
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:3000`

---

## Scalability Note

Online user state is currently stored in memory (`const users = {}`). This works correctly for single-server deployments but resets on restart and won't work across multiple instances. For production scaling, this would be replaced with a Redis adapter for Socket.IO to share state across servers.