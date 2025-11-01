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
- 🔔 **Push Notifications**: Receive notifications
- 🌐 **Network Status**: Visual indicators for online/offline/syncing states
- ☁️ **Cloud Storage**: Images and audio stored on Cloudinary CDN

---

## Setup

### Prerequisites
- Node.js 18+ and npm
- Port 3000 available
- Cloudinary account (free tier works)

### Environment Variables

Copy `.env.example` to `.env` and fill in your Cloudinary credentials:

```env
DATABASE_URL="file:./dev.db"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
```

### Installation

```bash
npm install # Install dependencies
npx prisma generate # Set up database
npx prisma db push # Set up database
```

---

## Production Build
>Do not use DevMode unless the build fails, since it will disable PWA features!

```bash
npm run build # Build production version
npm start # Start production server
```

**Access:** http://localhost:3000

**PWA features that WORK in production:**
- ✅ Install prompts and install buttons
- ✅ Service worker registration
- ✅ Offline caching and background sync
- ✅ Push notifications

---

## Development Build
>Again, do not use DevMode unless the build fails, since it will disable PWA features!

```bash
npm run dev # Start development server (for coding only)
```

**Access:** http://localhost:3000

**PWA features DISABLED in development:**
- ❌ Install prompts
- ❌ Service worker
- ❌ Offline caching
- ❌ Background sync
- ❌ Push notifications

**Why disabled?** next-pwa disables service workers in dev to avoid caching issues during development.

### Hardware Access Note

Next.js displays two URLs:
- `http://localhost:3000` - **✅ Use this (camera/mic/GPS works)**
- `http://192.168.x.x:3000` - **❌ Hardware won't work**

**Why?** Browser requires secure context (localhost or HTTPS) for hardware APIs.

**Mobile testing:** Use `ngrok http 3000` for HTTPS tunnel.

---

## Testing

### Test Offline Mode

1. Run: `npm run build && npm start`
2. DevTools (F12) → Network → Toggle "Offline"
3. Create moments (queued in IndexedDB)
4. Toggle online (auto-syncs)

### Test PWA Installation

1. Run: `npm run build && npm start`
2. Wait 3 seconds for install banner
3. Or go to Settings → "Install App"

---

## Database Management

### Prisma Studio - Visual Database Editor

**What is Prisma Studio?**
Prisma Studio is a visual database editor that opens in your browser. It lets you view, edit, and manage your database without writing SQL.

**Launch Prisma Studio:**
```bash
npm run db:studio
# or
npx prisma studio
```

**Access:** Opens automatically at http://localhost:5555

**What you can do:**
- 📊 **View all data** - Browse moments, tags, categories, users
- ✏️ **Edit records** - Click any cell to edit data
- ➕ **Add records** - Create new moments, tags, or categories
- 🗑️ **Delete records** - Remove data with confirmation
- 🔍 **Search & filter** - Find specific records quickly
- 🔗 **View relations** - See connections between moments and tags

**Use cases:**
- Debug issues by inspecting database state
- Manually add test data
- Clean up invalid records
- Export data for analysis
- Verify sync operations worked correctly

### Other Database Commands

**Clear database:**
```bash
rm prisma/dev.db # Remove database file
npx prisma db push # Recreate schema
```

**Seed sample data:**
```bash
npm run db:seed
```

**Generate Prisma Client:**
```bash
npm run db:generate
```

---

## Deployment

Recommended: Vercel

```bash
vercel # Deploy to Vercel
```

Update environment variables in Vercel dashboard.

---

## Optional: Database Migration

### Switch to PostgreSQL
1. Update `DATABASE_URL` in `.env`
2. Run: `npx prisma migrate dev`

### Schema Changes
```bash
npx prisma db push # Recreate schema
```
