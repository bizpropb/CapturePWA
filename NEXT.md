# Next.js in This Project

## What is Next.js?

Next.js is a React framework that provides a structured, production-ready environment for building web applications. It adds powerful features on top of React including server-side rendering, static site generation, API routes, and automatic code splitting.

**Created by**: Vercel
**First Release**: 2016
**Current Version**: 15+ (this project uses 15.5.6)

## Why Use Next.js?

### Advantages Over Plain React

| Feature | Next.js | Plain React |
|---------|---------|-------------|
| Routing | File-based (automatic) | Manual setup (React Router) |
| Server Rendering | Built-in SSR/SSG/ISR | Client-side only |
| API Routes | Integrated backend | Separate server needed |
| Image Optimization | Automatic | Manual optimization |
| Code Splitting | Automatic | Manual configuration |
| Performance | Optimized by default | Manual optimization |
| SEO | Server-rendered (SEO-friendly) | Client-rendered (poor SEO) |

### Key Benefits

- **Better Performance**: Server rendering, automatic code splitting, optimized images
- **Better SEO**: Search engines can crawl server-rendered content
- **Better Developer Experience**: File-based routing, TypeScript support, fast refresh
- **Full-Stack Capable**: API routes eliminate need for separate backend
- **Production Ready**: Built-in optimizations, analytics, and deployment integration

## Core Concepts

### 1. App Router (Modern Approach)

Next.js 13+ introduced the App Router, a new way to structure applications using React Server Components.

**File Structure:**
```
src/app/
├── page.jsx              → Homepage (/)
├── layout.jsx            → Root layout (wraps all pages)
├── capture/
│   └── page.jsx          → /capture route
├── gallery/
│   └── page.jsx          → /gallery route
├── share/
│   └── [token]/
│       └── page.jsx      → /share/abc123 (dynamic route)
└── api/
    └── moments/
        └── route.js      → API endpoint
```

**Benefits:**
- File = Route (no routing configuration needed)
- Nested layouts automatically wrap child pages
- Server components by default (better performance)
- Loading and error states with `loading.jsx` and `error.jsx`

### 2. Rendering Strategies

Next.js offers multiple ways to render pages, each optimized for different use cases:

#### Server-Side Rendering (SSR)
Renders page HTML on every request.

```javascript
// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  const data = await fetchLatestMoments();
  return <Timeline moments={data} />;
}
```

**Use for**: Pages with frequently changing data (timeline, dashboard)

#### Static Site Generation (SSG)
Pre-renders pages at build time.

```javascript
export const dynamic = 'force-static';

export default async function StatsPage() {
  const stats = await calculateStats();
  return <StatsDisplay data={stats} />;
}
```

**Use for**: Content that rarely changes (documentation, marketing pages)

#### Incremental Static Regeneration (ISR)
Pre-renders pages but refreshes them periodically.

```javascript
export const revalidate = 3600; // Rebuild every hour

export default async function SharePage({ params }) {
  const moment = await getMomentByToken(params.token);
  return <MomentView moment={moment} />;
}
```

**Use for**: Content that changes occasionally (blog posts, product pages)

#### Client-Side Rendering (CSR)
Renders in the browser (traditional React).

```javascript
'use client'; // Opt into client rendering

export default function InteractiveWidget() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Use for**: Interactive components with client-only features

### 3. API Routes

Next.js lets you build API endpoints alongside your frontend code.

```javascript
// src/app/api/moments/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const moments = await prisma.moment.findMany();
  return NextResponse.json(moments);
}

export async function POST(request) {
  const data = await request.json();
  const moment = await prisma.moment.create({ data });
  return NextResponse.json(moment, { status: 201 });
}
```

**Accessible at**: `/api/moments`

### 4. Image Optimization

Next.js automatically optimizes images for performance.

```javascript
import Image from 'next/image';

<Image
  src="https://example.com/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  priority // Load immediately (above fold)
/>
```

**Automatic features:**
- WebP/AVIF conversion
- Responsive sizing
- Lazy loading
- Blur placeholders

### 5. Metadata & SEO

Define page metadata for better SEO.

```javascript
export async function generateMetadata({ params }) {
  const moment = await getMoment(params.id);

  return {
    title: moment.description,
    description: `Shared moment from ${moment.createdAt}`,
    openGraph: {
      images: [moment.imageUrl],
    },
  };
}
```

## How This Project Uses Next.js

### Routing Structure

- **/** - Dashboard (SSR for fresh data)
- **/capture** - Moment creation (client-side for hardware access)
- **/gallery** - Media grid (client-side with infinite scroll)
- **/timeline** - Chronological list (SSR with search/filters)
- **/stats** - Analytics dashboard (client-side with dynamic charts)
- **/settings** - App configuration (client-side)
- **/share/[token]** - Public moment view (ISR for performance)
- **/offline** - Custom offline page
- **/api/*** - 18 API endpoints for CRUD operations

### Features Demonstrated

#### 1. File-Based Routing
Every page is a file in `src/app/`. Adding a new route is as simple as creating a new folder with `page.jsx`.

#### 2. Server-Side Rendering
Timeline page fetches fresh data on every page load to show the latest moments.

#### 3. Dynamic Routes
Share pages use `[token]` parameter to generate unique URLs for each moment.

#### 4. API Routes
Comprehensive REST API built with Next.js API routes:
- `/api/moments` - CRUD operations
- `/api/upload` - Cloudinary integration
- `/api/stats` - Analytics data
- `/api/weather` - External API proxy
- `/api/push/subscribe` - Push notification setup

#### 5. Image Optimization
All images use Next.js `<Image>` component for automatic optimization and lazy loading.

#### 6. Metadata Generation
Dynamic metadata for share pages improves social media previews and SEO.

#### 7. Code Splitting
Charts library loaded dynamically only when needed:

```javascript
const Charts = dynamic(() => import('@/components/Charts'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

#### 8. Middleware (Planned)
Can add authentication, logging, or redirects without touching page code.

## Project Configuration

### next.config.mjs

```javascript
import withPWA from 'next-pwa';

const nextConfig = {
  // Image optimization domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

// Wrap with PWA config
export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
```

### Key Settings

- **Image Domains**: Allows Cloudinary images to be optimized
- **PWA Integration**: Service worker generation
- **Output Tracing**: Optimizes dependencies for deployment

## Performance Optimizations

Next.js provides these optimizations automatically:

1. **Automatic Code Splitting**: Each route only loads its required JavaScript
2. **Prefetching**: Links prefetch pages on hover
3. **Image Optimization**: WebP conversion, responsive sizing
4. **Font Optimization**: Automatic font loading with `next/font`
5. **Bundle Analysis**: Built-in tools to analyze bundle size
6. **Edge Runtime**: API routes can run on edge servers (faster response)

## Development vs Production

### Development Mode (`npm run dev`)
- Hot module replacement (instant updates)
- Detailed error messages
- Source maps enabled
- PWA features disabled (faster rebuilds)

### Production Mode (`npm run build && npm start`)
- Optimized bundles (minified, tree-shaken)
- Server-side rendering active
- PWA features enabled
- Static pages pre-generated

## Deployment

Next.js apps deploy easily to **Vercel** (zero configuration):

```bash
vercel
```

Automatically handles:
- Build optimization
- CDN distribution
- Serverless functions for API routes
- Preview deployments for branches
- Analytics and monitoring

## Comparison with Other Frameworks

| Feature | Next.js | Gatsby | Remix | SvelteKit |
|---------|---------|--------|-------|-----------|
| Rendering | SSR/SSG/ISR | SSG only | SSR | SSR/SSG |
| Backend | API Routes | None | Built-in | API Routes |
| Learning Curve | Medium | Medium | Medium | Low |
| Performance | Excellent | Excellent | Excellent | Excellent |
| Ecosystem | Huge | Large | Growing | Growing |
| Best For | Full-stack apps | Static sites | Data-heavy apps | Lightweight apps |

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Vercel Deployment](https://vercel.com)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
