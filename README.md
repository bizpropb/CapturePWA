# Moment Capture PWA

A Progressive Web App built with Next.js and Prisma for capturing and storing life moments with photos, audio recordings, and GPS locations. Features offline support with automatic sync when reconnected.

---

## Tech Stack

- **Next.js 15.5.6** - React framework with App Router
- **Prisma ORM** - Database abstraction layer
- **SQLite** - Development database (production-ready for PostgreSQL)
- **Dexie.js** - IndexedDB wrapper for offline storage
- **next-pwa** - Service Worker generation for PWA capabilities
- **Cloudinary** - Media CDN for images and audio
- **Tailwind CSS v4** - Utility-first styling

---

## Architecture

```
┌─────────────────────┐
│   React Frontend    │  (Next.js App Router)
│   - Camera Capture  │
│   - Audio Record    │
│   - GPS Location    │
└──────────┬──────────┘
           │
           ├─ Online ──────► Next.js API Routes ──► Prisma ──► SQLite
           │
           └─ Offline ─────► IndexedDB (Dexie.js)
                             │
                             └─ Auto-sync when online
```

---

## Features

- 📸 **Camera Capture**: Take photos using device camera with fallback to file upload
- 🎤 **Audio Recording**: Record audio with live timer and playback
- 📍 **GPS Location**: Capture current location with accuracy indicator
- 💾 **Offline Support**: Create moments while offline, auto-sync when reconnected
- 🔄 **Auto Sync**: Pending moments automatically upload when back online
- 📱 **PWA Installation**: Install as native app on desktop and mobile
- 🌐 **Network Status**: Visual indicators for online/offline/syncing states
- ☁️ **Cloud Storage**: Images and audio stored on Cloudinary CDN

---

## Setup

### Prerequisites
- Node.js 18+ and npm
- Port 3000 available

### Environment Variables

Copy `.env.example` file to `.env` and fill in your own values (Cloudinary registration is free):

```env
DATABASE_URL="file:./dev.db"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
```

### Installation & Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Start development server (auto-reloads on frontend changes, API routes need manual refresh)
npm run dev
```

⚠️ **Important: Hardware Access Security**

Next.js will display two URLs when starting:
- `http://localhost:3000` - **Use this one**
- `http://192.168.x.x:3000` - **Camera/mic/GPS will NOT work here**

**Why?** Browser security requires a "secure context" (localhost or HTTPS) for hardware access APIs. The network IP (`192.168.x.x`) is not secure context, so camera, microphone, and GPS features will be blocked by the browser.

**To test on mobile devices:**
- Option 1: Use `ngrok` to create HTTPS tunnel: `ngrok http 3000`
- Option 2: Deploy to production with automatic HTTPS
- Option 3: Set up local HTTPS with self-signed certificates (advanced)

### Access

- **Application**: http://localhost:3000
- **Database**: SQLite file at `prisma/dev.db`

---

## Production Build

⚠️ **Service Worker Note**: The PWA service worker (for offline caching and installability) is **ONLY active in production builds**, not in development mode. To test PWA features like offline support and "Add to Home Screen":

```bash
# Build production version
npm run build

# Start production server
npm start
```

Then visit http://localhost:3000 to test PWA installation and service worker caching.

---

## Testing

### Testing Offline Mode

1. Build and start in production mode (`npm run build && npm start`)
2. Open browser DevTools (F12)
3. Go to Network tab
4. Toggle "Offline" checkbox
5. Create moments - they'll be queued in IndexedDB
6. Toggle back online - moments automatically sync to server

---

## Debugging

### Clear Database

```bash
# Remove SQLite database file
rm prisma/dev.db

# Recreate schema
npx prisma db push
```

### View Database Content

```bash
# Open Prisma Studio
npx prisma studio
```

---

## Optional: Database Migration

### Migrating to PostgreSQL (Production)

1. Update `DATABASE_URL` in `.env` to PostgreSQL connection string
2. Run migration:
```bash
npx prisma migrate dev
```

### Schema Changes

After modifying `prisma/schema.prisma`:
```bash
npx prisma db push
```
