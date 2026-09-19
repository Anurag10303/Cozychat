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
dlngir

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

### 🔒 End-to-End Encryption (E2EE)

All text messages are encrypted in the sender's browser before transmission. The server stores and forwards only ciphertext — it never has access to plaintext message content at any point.

**Cryptographic primitives:**
- Key exchange — ECDH with P-256 curve (`crypto.subtle.generateKey`)
- Message encryption — AES-256-GCM (`crypto.subtle.encrypt`)
- Random 96-bit IV generated per message (`crypto.getRandomValues`)
- Private key wrapping — AES-256-GCM with a PBKDF2-derived key (300,000 iterations, SHA-256)

**Key persistence — encrypted server backup:**

The original design stored the private key only in IndexedDB, which meant logging out, clearing browser data, or switching devices permanently destroyed the key and made all previous messages unreadable.

The current design solves this with an **encrypted key backup**:

- On first login the browser generates an ECDH key pair, then wraps (encrypts) the private key using an AES-GCM key derived from the user's login password via PBKDF2
- The encrypted blob is uploaded to the server (`POST /user/key-backup`) and stored in `user.encryptedPrivateKey` — the server stores it opaquely and cannot decrypt it
- On every subsequent login, `bootstrapE2EE(password)` is called from the login/signup form handler before the password is cleared. It fetches the blob, re-derives the wrapping key from the password the user just typed, and unwraps the private key back into IndexedDB
- If IndexedDB already holds a valid key (same browser session, tab refresh) the server round-trip is skipped entirely

**Key bootstrap — three paths:**

| Path | Condition | What happens |
|------|-----------|--------------|
| **A — Fast** | IndexedDB has key | Load from IndexedDB, upload public key, done. No crypto, no network backup call |
| **B — Restore** | IndexedDB empty, server backup exists | Derive wrapping key from password → unwrap private key → re-derive public key → store in IndexedDB |
| **C — Generate** | IndexedDB empty, no backup (new user or backup lost) | Generate fresh keypair → store in IndexedDB → wrap private key → POST backup to server |

**Per-conversation shared secret:**
- When Alice opens a chat with Bob, her browser fetches Bob's public key from the server (`GET /user/public-key/:id`)
- Alice runs `ECDH(alicePrivateKey, bobPublicKey)` to derive a 256-bit AES-GCM key
- Bob independently runs `ECDH(bobPrivateKey, alicePublicKey)` and arrives at the **identical key** — this is the mathematical guarantee of Diffie-Hellman
- Derived keys are cached in memory for the session so ECDH is only computed once per conversation partner per login

**Wire format:**
```
ENC:<base64-iv>:<base64-ciphertext>
```
This is exactly what gets stored in MongoDB's `message.message` field and transmitted over Socket.IO. The `ENC:` prefix lets legacy plaintext messages (from before E2EE was deployed) be handled gracefully.

**Fallback behaviour:**
- If a conversation partner has no public key yet (logged in before E2EE was deployed), messages are sent as plaintext with an amber `Plain` badge in the UI
- Once both users have logged in after the E2EE update, all subsequent messages are encrypted
- Old plaintext messages remain readable but are shown with a `Plain` badge; new messages show a green `E2EE` badge

**What the server can and cannot see:**

| Data | Server access |
|------|---------------|
| `user.publicKey` | ✅ Visible — required to enable key exchange |
| `user.encryptedPrivateKey` | ✅ Stored as opaque blob — ❌ **cannot decrypt** (wrapping key derived from user's password, never sent to server) |
| `message.message` (encrypted) | ❌ Only sees `ENC:iv:ciphertext` — cannot decrypt |
| `message.fileUrl` | ✅ Visible — files stored on Cloudinary unencrypted |
| Private keys (raw) | ❌ Never transmitted — stays in browser IndexedDB |
| Wrapping key | ❌ Derived in browser from password — never leaves the client |

**E2EE flow:**

```
LOGIN / SIGNUP
     │
     ▼
bootstrapE2EE(password)
     │
     ├─ [1] idbGet("myPrivateKey")
     │         │
     │         ├── FOUND → Path A: load pub key, upload to server, done
     │         │
     │         └── NULL → GET /user/key-backup
     │                       │
     │                       ├── blob found → Path B:
     │                       │     PBKDF2(password, userId) → wrappingKey
     │                       │     AES-GCM-unwrap(blob) → privateKey
     │                       │     re-derive publicKey from privateKey JWK
     │                       │     store both in IndexedDB
     │                       │
     │                       └── null/error → Path C:
     │                             generateKey() → { pub, priv }
     │                             store in IndexedDB
     │                             PBKDF2(password, userId) → wrappingKey
     │                             AES-GCM-wrap(priv) → encryptedBlob
     │                             POST /user/key-backup
     │
     └─ POST /user/public-key (JWK)  →  isReady = true

── user opens chat with Bob ──────────────────────────────────────
GET /user/public-key/bobId → import bobPublicKey
ECDH(myPrivateKey, bobPublicKey) → sharedKey (AES-256-GCM) [cached]

── Alice sends "Hello Bob!" ──────────────────────────────────────
getRandomValues(12) → iv
AES-GCM-encrypt("Hello Bob!", sharedKey, iv) → ciphertext
"ENC:" + base64(iv) + ":" + base64(ciphertext) → wire string
POST /messages/send/:bobId  →  MongoDB stores wire string
                                     │
                             socket.emit("newMessage")
                                     │
                                     ▼
                           Bob's browser receives wire string
                           AES-GCM-decrypt(sharedKey, iv, ct)
                           → "Hello Bob!" rendered ✓
```

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
- Files uploaded to Cloudinary via memory buffer (no disk writes)
- Documents stored with `type: "upload"` on Cloudinary to ensure publicly accessible download URLs
- In-chat media rendering:
  - Images open in a full-screen lightbox with download button
  - Videos play inline with a thumbnail preview
  - Audio plays with an animated waveform player and progress bar
  - Documents show as a tappable attachment card with filename and extension

> **Note on file encryption:** File attachments are currently stored on Cloudinary unencrypted. Only the text `message` field and captions are E2EE-encrypted. Encrypting binary files client-side before upload is a planned future enhancement.

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
│   │   └── user.controller.js      # Auth, user list, E2EE public key + key backup endpoints
│   ├── models/
│   │   ├── conversation.model.js   # Stores member IDs + message ID refs
│   │   ├── message.model.js        # Message content, status, file fields, clientMessageId
│   │   └── user.model.js           # publicKey + encryptedPrivateKey fields for E2EE
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
│   │   └── user.route.js           # /public-key and /key-backup routes
│   └── index.js
│
└── Frontend/src/
    ├── utils/
    │   └── crypto.js               # Web Crypto API — keygen, ECDH, AES-GCM, IndexedDB,
    │                               # PBKDF2 wrapping/unwrapping, ensureKeyPairWithBackup
    ├── context/
    │   ├── E2EEContext.jsx          # bootstrapE2EE(password), encryptText, decryptText
    │   ├── SocketContext.jsx        # Socket connection + online users
    │   ├── useGetMessage.js         # Paginated fetch + infinite scroll
    │   ├── useGetSocketMessage.js   # Socket message + status listeners
    │   ├── useGetAllUsers.jsx       # User list + real-time unread counts
    │   └── useSendMessage.js        # Encrypts then sends; progress tracking
    ├── home/
    │   ├── left/
    │   │   ├── User.jsx             # Conversation row with unread badge
    │   │   └── Users.jsx            # Sidebar user list
    │   └── right/
    │       ├── Messages.jsx         # Message list, scroll, pagination, markSeen
    │       ├── Message.jsx          # Decrypts on render; E2EE/Plain badge; tick status
    │       └── TypeMsg.jsx          # Input with file picker + typing indicator emit
    ├── pages/
    │   ├── SignIn.jsx               # Calls bootstrapE2EE(password) after login
    │   └── SignUp.jsx               # Calls bootstrapE2EE(password) after signup; navigates to "/"
    └── zustand/
        └── userConversation.js      # Global state: messages, setMessages, appendMessage, updateMessageStatus
```

---

## Data Models

### User

```js
{
  fullName:            String,
  email:               String (unique),
  password:            String (bcrypt hash),
  lastSeen:            Date,
  avatar:              String,              // Cloudinary URL
  publicKey:           String | null,       // ECDH public key as JWK string
                                            // null until first login after E2EE deploy
  encryptedPrivateKey: String | null,       // AES-GCM-wrapped ECDH private key
                                            // base64(IV || ciphertext of PKCS8 private key)
                                            // server cannot decrypt — wrapping key derived from password
}
```

### Message

```js
{
  senderId:        ObjectId,
  receiverId:      ObjectId,
  conversationId:  ObjectId,
  message:         String,           // "ENC:<iv>:<ciphertext>" or plaintext for legacy messages
  status:          "sent" | "delivered" | "seen",
  clientMessageId: String (unique),  // prevents duplicates
  fileUrl:         String | null,    // Cloudinary secure URL (unencrypted)
  fileType:        "image" | "video" | "audio" | "document" | null,
  fileName:        String | null,
  fileMimeType:    String | null,
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

## API Routes

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/user/signup` | Register with avatar upload |
| POST | `/user/login` | Sign in, returns JWT |
| POST | `/user/logout` | Clear JWT cookie |
| GET | `/user/users` | List all other users (auth required) |

### E2EE Key Exchange

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/user/public-key` | ✅ | Upload or update caller's ECDH public key (JWK) |
| GET | `/user/public-key/:userId` | ✅ | Fetch another user's public key for key derivation |

### E2EE Key Backup

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/user/key-backup` | ✅ | Upload the caller's password-wrapped private key blob. Body: `{ encryptedPrivateKey: "<base64>" }` |
| GET | `/user/key-backup` | ✅ | Fetch the caller's encrypted backup blob. Returns `null` if none exists yet |

### Messages

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/user/messages/send/:id` | ✅ | Send a message (text + optional file) |
| GET | `/user/messages/:id` | ✅ | Fetch paginated message history |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `newMessage` | server → client | New message delivered to receiver (contains encrypted `message` field) |
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

**Why ECDH + AES-GCM and not RSA?**
P-256 keys are ~32 bytes versus RSA's 256+ bytes. ECDH key exchange is significantly more efficient while providing equivalent security for this use case. AES-GCM provides authenticated encryption — a tampered or corrupted ciphertext is rejected outright rather than silently decrypting to garbage.

**Why use an encrypted server backup instead of IndexedDB only?**
IndexedDB is ephemeral — it is cleared on logout, browser data wipe, or when switching devices. Without a backup, logging out permanently destroys the private key and makes all previous E2EE messages unreadable. The encrypted backup solves this while keeping the server blind: the private key is wrapped with a key derived from the user's password (PBKDF2), so the server stores an opaque blob it cannot decrypt.

**Why PBKDF2 with 300,000 iterations?**
PBKDF2 converts a password into a cryptographic key. 300,000 iterations follows the OWASP 2023 recommendation for PBKDF2-SHA-256, making offline dictionary attacks against the encrypted blob computationally expensive. The wrapping key is derived fresh on every login and never stored anywhere.

**Why use the userId as the PBKDF2 salt instead of a random salt?**
A random salt would need to be stored and retrieved separately, adding complexity. The userId is already unique, permanent, and available on both login and backup restoration. It serves the salt's purpose — preventing cross-user precomputation — without additional storage.

**Why call `bootstrapE2EE(password)` explicitly from the login form rather than auto-triggering on auth state change?**
The plaintext password is only available in the form handler at the moment of submission. By the time a `useEffect` fires in response to `authUser` changing, `formData` has already been cleared. Calling `bootstrapE2EE` explicitly, before clearing `formData`, is the only reliable way to pass the password to the crypto layer without storing it in state.

**Why does SignUp now navigate to `/` instead of `/login`?**
The user's password is available immediately after signup. Routing to `/login` would require the user to type their password again just to bootstrap E2EE keys. Navigating straight to `/` means keys are ready the moment the user lands on the chat screen.

**Why store the private key in IndexedDB as a `CryptoKey`, not as bytes in localStorage?**
The Web Crypto API allows storing `CryptoKey` objects directly in IndexedDB. This is safer than exporting to bytes and storing in localStorage, where any XSS vulnerability would immediately expose the raw key material.

**Why a random 96-bit IV per message?**
AES-GCM is catastrophically broken if the same IV is reused with the same key. `crypto.getRandomValues(new Uint8Array(12))` gives 96 bits of randomness. At 20 messages per minute per conversation the collision probability remains negligible across years of use.

**Why do some users have `publicKey: null` in the database?**
Public keys are generated lazily — only on the first login after the E2EE code is deployed. Users who haven't logged in since the update simply haven't had their key generated yet. The app handles `null` gracefully by falling back to plaintext for that conversation until both parties have logged in.

**Why `multer.memoryStorage()` for message files?**
`multer-storage-cloudinary` does not reliably pass `type: "upload"` for `raw` resources, causing Cloudinary to default to `authenticated` delivery which returns 401 errors on download. Using `memoryStorage` and calling `cloudinary.uploader.upload_stream` directly gives full control over upload parameters and avoids disk writes.

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

## Verifying E2EE is Working

**In MongoDB — messages:** Open any recent message document. The `message` field should contain a string starting with `ENC:` — e.g. `ENC:aGVsbG8=:xK9pQr...`. Readable text means encryption is not active for that message.

**In MongoDB — key backup:** Open a user document and check `encryptedPrivateKey`. It should contain a long base64 string. If it is `null`, the user has not logged in since the key backup feature was deployed.

**In the UI:** Each message bubble shows a small badge. A green `E2EE` badge means the message was encrypted end-to-end. An amber `Plain` badge means the message predates E2EE or was sent to a user who hadn't yet uploaded their public key.

**In the browser:** Open DevTools → Application → IndexedDB → `cozy_e2ee` → `keys`. You should see two entries: `myPrivateKey` and `myPublicKey` stored as `CryptoKey` objects.

**Testing key restoration:** Log out, manually delete the `cozy_e2ee` IndexedDB database (DevTools → Application → IndexedDB → right-click → Delete database), then log back in with the same credentials. Old messages should still decrypt correctly — the private key is restored from the server backup using your password.

---

## Deployment Notes

- **File storage** — files are never written to disk; Multer uses `memoryStorage` and streams directly to Cloudinary
- **Redis** — use a managed Redis provider (Redis Cloud free tier or Upstash) and set `REDIS_URL` in your environment
- **Cloudinary** — the free tier (25GB storage, 25GB bandwidth/month) is sufficient for most small deployments
- **E2EE key backup** — private keys are now recoverable across logouts and devices. The backup is protected by the user's password; the server cannot read it
- **Password change** — not yet implemented. If a user changes their password, the existing backup blob cannot be decrypted with the new password. On next login a fresh keypair is generated (Path C) and old messages will show `[Decryption failed]`. A correct implementation must re-derive the wrapping key with the new password and re-upload the backup

---

## Scalability Note

Socket state (online users, socket ID mappings) is stored in Redis, so it survives server restarts and is ready for multi-instance deployments. To fully support horizontal scaling, add the Socket.IO Redis adapter (`@socket.io/redis-adapter`) so socket events are broadcast across all server instances.

---

## Security Summary

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS (TLS) |
| Authentication | JWT (HttpOnly cookie + Bearer) |
| Password storage | bcrypt (cost 10) |
| Message confidentiality | AES-256-GCM E2EE |
| Key exchange | ECDH P-256 |
| Private key at rest | Browser IndexedDB (CryptoKey object) |
| Private key backup | AES-GCM wrapKey with PBKDF2-derived wrapping key (300,000 iters, SHA-256) |
| Backup confidentiality | Opaque encrypted blob on server — server cannot decrypt |
| IV reuse prevention | `crypto.getRandomValues` — 96-bit random IV per message |
| Rate limiting | Express Rate Limit + Redis store |
| Duplicate prevention | `clientMessageId` unique DB index |
