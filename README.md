# CozyChat 💬

A full-stack real-time chat application built with React, Node.js, Express, MongoDB, Socket.IO, Redis, and Cloudinary.

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
- Multer (file uploads via memory buffer)
- Cloudinary (media & document storage)
- Redis (caching + socket state)
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

### 📎 File Sharing

- Send images, videos, audio, and documents in chat
- Supported formats:
  - **Images** — JPG, PNG, GIF, WebP (up to 5MB)
  - **Video** — MP4, MOV, WebM (up to 50MB)
  - **Audio** — MP3, MP4, OGG, WAV, WebM (up to 50MB)
  - **Documents** — PDF, DOC, DOCX, XLS, XLSX (up to 50MB)
- Files uploaded to Cloudinary via memory buffer (no disk writes — safe for all deployment platforms)
- Documents stored with `type: "upload"` on Cloudinary to ensure publicly accessible download URLs
- In-chat media rendering:
  - Images open in a full-screen lightbox with download button
  - Videos play inline with a thumbnail preview
  - Audio plays with an animated waveform player and progress bar
  - Documents show as a tappable attachment card with filename and extension

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

### ⚡ Redis Caching

- Paginated message responses cached in Redis with a 60-second TTL
- Cache invalidated automatically when a new message is sent
- Online user list and socket ID mappings stored in Redis (not in-memory)
- Stale socket state cleared on server restart in development

### 🛡️ Rate Limiting

- **General limiter** — 100 requests per 15 minutes (all routes)
- **Auth limiter** — 10 attempts per 15 minutes (login/signup)
- **Message limiter** — 20 messages per minute (send message route)
- Errors routed through global `AppError` handler for consistent response format

### 🖼️ Avatar Upload

- Profile picture upload via Multer → Cloudinary
- Auto-cropped to 200×200 with face-gravity
- Falls back to generated initials with consistent color per user

---

## Project Structure

```
Chat-Application/
├── Backend/
│   ├── controller/
│   │   ├── message.controller.js   # Send message, Cloudinary upload, paginated fetch
│   │   └── user.controller.js      # Auth, user list with unread counts
│   ├── models/
│   │   ├── conversation.model.js   # Stores member IDs + message ID refs
│   │   ├── message.model.js        # Message content, status, file fields, clientMessageId
│   │   └── user.model.js
│   ├── socketIo/
│   │   └── server.js               # Socket auth, online tracking, markSeen, typing
│   ├── middleware/
│   │   ├── secureRoute.js          # JWT verification middleware
│   │   ├── multer.js               # Multer config — memoryStorage for messages, Cloudinary for avatars
│   │   ├── rateLimiter.js          # General, auth, and message rate limiters
│   │   └── errorMiddleware.js      # Global error handler
│   ├── utils/
│   │   ├── AppError.js             # Custom error class
│   │   ├── asyncHandler.js         # Async wrapper
│   │   └── redisClient.js          # Redis connection
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
    │       ├── Message.jsx          # Bubble with media rendering + tick status
    │       └── TypeMsg.jsx          # Input with file picker + typing indicator emit
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
  message:         String,           // empty string for file-only messages
  status:          "sent" | "delivered" | "seen",
  clientMessageId: String (unique),  // prevents duplicates
  fileUrl:         String | null,    // Cloudinary secure URL
  fileType:        "image" | "video" | "audio" | "document" | null,
  fileName:        String | null,    // original filename (shown on document cards)
  fileMimeType:    String | null,    // e.g. "application/pdf"
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

| Event                 | Direction                | Description                                    |
| --------------------- | ------------------------ | ---------------------------------------------- |
| `newMessage`          | server → client          | New message delivered to receiver              |
| `messageStatusUpdate` | server → client          | Tick update: `{ messageId, status }`           |
| `markSeen`            | client → server          | Viewer opens chat, bulk marks messages as seen |
| `typing`              | client → server → client | User started typing                            |
| `stopTyping`          | client → server → client | User stopped typing                            |
| `getOnlineUsers`      | server → all clients     | Broadcast updated online user list             |

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

## File Upload Flow

```
User selects file
     ↓
Multer reads file into req.file.buffer (memoryStorage — no disk writes)
     ↓
message.controller.js detects fileType from mimetype
     ↓
uploadToCloudinary() streams buffer to Cloudinary
  → resource_type: "raw" for documents, "image"/"video" for media
  → type: "upload" (public) — prevents 401 on download
     ↓
Cloudinary returns secure_url
     ↓
fileUrl saved to Message document in MongoDB
     ↓
Frontend renders correct media component based on fileType
```

---

## Architecture Decisions

**Why `multer.memoryStorage()` for message files?**
`multer-storage-cloudinary` does not reliably pass `type: "upload"` for `raw` resources, causing Cloudinary to default to `authenticated` delivery which returns 401 errors on download. Using `memoryStorage` and calling `cloudinary.uploader.upload_stream` directly gives full control over upload parameters. It also avoids disk writes, making it safe for ephemeral deployment platforms like Render and Railway.

**Why separate Conversation and Message models?**
MongoDB has a 16MB document limit. Embedding messages inside conversations would hit this limit in active chats. Keeping them separate allows efficient pagination, easy deletion, and clean `.populate()` joins.

**Why `clientMessageId`?**
Prevents race condition duplicates. A `findOne` check before insert is not atomic — two concurrent requests can both pass the check. A unique index at the DB level guarantees only one insert succeeds.

**Why sort by both `createdAt` and `_id`?**
MongoDB ObjectIds contain a timestamp and an incrementing counter, so even if two messages share the same `createdAt` millisecond, `_id` ordering is always correct.

**Why store online users in Redis instead of in-memory?**
In-memory state resets on server restart and doesn't work across multiple instances. Redis persists socket state across restarts and is ready for horizontal scaling with a Socket.IO Redis adapter.

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (local or cloud — e.g. Redis Cloud, Upstash)
- Cloudinary account

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd Chat-Application

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### Environment Variables

Create a `.env` file in `/Backend`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From your dashboard copy **Cloud Name**, **API Key**, and **API Secret** into `.env`
3. No additional configuration needed — folders are created automatically on first upload:
   - `cozychat/avatars` — profile pictures
   - `cozychat/messages/images` — image attachments
   - `cozychat/messages/videos` — video attachments
   - `cozychat/messages/audio` — audio attachments
   - `cozychat/messages/documents` — PDF and office files

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

## Deployment Notes

- **File storage** — files are never written to disk; Multer uses `memoryStorage` and streams directly to Cloudinary, so the app works correctly on platforms with read-only filesystems (Render, Railway, Heroku)
- **Redis** — use a managed Redis provider (Redis Cloud free tier or Upstash) and set `REDIS_URL` in your environment variables
- **Cloudinary** — the free tier (25GB storage, 25GB bandwidth/month) is sufficient for most small deployments

---

## Scalability Note

Socket state (online users, socket ID mappings) is stored in Redis, so it survives server restarts and is ready for multi-instance deployments. To fully support horizontal scaling, add the Socket.IO Redis adapter (`@socket.io/redis-adapter`) so socket events are broadcast across all server instances.
