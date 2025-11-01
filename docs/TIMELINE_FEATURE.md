# Timeline Feature Documentation

## Overview
The Timeline feature provides a chronological view of all moments with advanced search, filtering, and date grouping capabilities. It uses server-side rendering for optimal SEO and performance.

## Features

### ✨ Core Features
- **Server-Side Rendering (SSR)**: Fresh data on every page load
- **Date Grouping**: Intelligent grouping (Today, Yesterday, This Week, Last Week, This Month, Last Month, Month/Year)
- **Search**: Real-time search across descriptions and tags
- **Advanced Filters**:
  - Category selection
  - Mood filtering
  - Tag multi-select
- **Infinite Scroll**: Load more moments on demand
- **Mini-Maps**: Collapsible maps showing GPS locations
- **Time Ago**: Relative timestamps (e.g., "2 hours ago")
- **Responsive Design**: Desktop sidebar, mobile collapsible filters

## File Structure

```
src/
├── app/
│   └── timeline/
│       └── page.jsx                 # Timeline page route (SSR)
├── components/
│   └── timeline/
│       ├── TimelineContent.jsx      # Main container component
│       ├── TimelineGroup.jsx        # Date group component
│       ├── TimelineItem.jsx         # Individual moment item
│       ├── TimelineSearch.jsx       # Search bar component
│       ├── TimelineFilters.jsx      # Filter sidebar
│       └── index.js                 # Component exports
├── utils/
│   └── date-grouping.js             # Date grouping utilities
├── lib/
│   └── timeline-api.js              # Timeline API utilities
└── app/
    └── api/
        └── timeline/
            ├── route.js             # Main timeline API
            └── filters/
                └── route.js         # Filters API
```

## Components

### page.jsx (Timeline Page)
**Purpose**: Server-side rendered timeline page

**Features**:
- SSR with `force-dynamic`
- SEO metadata generation
- Initial data fetch server-side
- No caching (`revalidate: 0`)

**Metadata**:
```javascript
{
  title: 'Timeline | CapturePWA',
  description: 'View your moments in chronological order',
  openGraph: {...}
}
```

### TimelineContent.jsx
**Purpose**: Main client component managing timeline state

**Props**:
- `initialData`: Server-rendered initial moments and pagination

**State**:
- `moments`: Array of moment objects
- `pagination`: Pagination metadata
- `loading`: Loading state
- `searchQuery`: Current search term
- `filters`: Active filters (tags, category, mood)
- `showFilters`: Mobile filter sidebar visibility

**Features**:
- Debounced search
- Filter management
- Infinite scroll
- Date grouping
- Responsive layout (sidebar on desktop, collapsible on mobile)

### TimelineGroup.jsx
**Purpose**: Display a group of moments under a date label

**Props**:
- `group`: Object with `label` and `moments[]`

**Features**:
- Sticky date header
- Vertical timeline line (desktop)
- Moment count badge

### TimelineItem.jsx
**Purpose**: Individual moment card in timeline

**Props**:
- `moment`: Moment object
- `isLast`: Boolean indicating if last in group

**Features**:
- Timeline dot indicator (desktop)
- Media display (images, video, audio)
- Timestamp with "time ago"
- Metadata grid (mood, weather, category, views)
- Tag display
- Collapsible mini-map for GPS locations
- Share button

### TimelineSearch.jsx
**Purpose**: Search input with debouncing

**Props**:
- `searchQuery`: Current search value
- `onSearch`: Callback when search changes
- `onToggleFilters`: Toggle mobile filters
- `showFilters`: Filter sidebar visibility

**Features**:
- 300ms debounced search
- Clear button
- Filter toggle (mobile)
- Search icon

### TimelineFilters.jsx
**Purpose**: Filter sidebar for categories, moods, and tags

**Props**:
- `filters`: Current filter values
- `onFilterChange`: Callback when filters change
- `onReset`: Reset all filters

**Features**:
- Category buttons
- Mood chips
- Tag multi-select
- Active filter count
- Reset button
- Empty state

## Utilities

### date-grouping.js

**Functions**:

#### `getRelativeDateLabel(date)`
Converts a date to a relative label (Today, Yesterday, etc.)

**Returns**: String label

#### `groupMomentsByDate(moments)`
Groups moments array by relative date

**Returns**: Array of `{ label, moments[] }` objects, sorted chronologically

#### `formatTimelineDate(date)`
Formats date for display in timeline items

**Returns**: String (e.g., "Jan 15, 2025, 3:45 PM")

#### `getTimeAgo(date)`
Generates relative time string

**Returns**: String (e.g., "2 hours ago", "3 days ago")

## API Endpoints

### GET /api/timeline
Fetches paginated moments for timeline view

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `searchQuery` (string): Search term for descriptions/tags
- `tagIds` (JSON array): Array of tag IDs
- `categoryId` (number): Category ID
- `mood` (string): Mood filter

**Response**:
```json
{
  "moments": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 50,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### GET /api/timeline/filters
Fetches available filters

**Response**:
```json
{
  "tags": [
    { "id": 1, "name": "travel", "color": "#3b82f6" }
  ],
  "categories": [
    { "id": 1, "name": "Personal", "icon": "📁" }
  ],
  "moods": ["happy", "excited", "relaxed"]
}
```

## Date Grouping Logic

Moments are grouped into the following categories (in order):

1. **Today**: Moments from today
2. **Yesterday**: Moments from yesterday
3. **This Week**: Moments from this week (excluding today/yesterday)
4. **Last Week**: Moments from last week
5. **This Month**: Moments from this month (excluding this week)
6. **Last Month**: Moments from last month
7. **Month/Year**: Older moments grouped by month and year

## Search Functionality

The search feature searches across:
- Moment descriptions (case-insensitive)
- Tag names (case-insensitive)

Search is debounced by 300ms to reduce API calls.

## Usage Examples

### Basic Usage
Navigate to `/timeline` to view the chronological timeline.

### Searching
Type in the search bar to filter moments. Search works across:
- Moment descriptions
- Tag names

### Filtering
1. **By Category**: Click a category button to filter
2. **By Mood**: Click a mood chip to filter
3. **By Tags**: Click tags (multi-select supported)
4. **Clear Filters**: Click "Reset" or "Clear all"

### Infinite Scroll
Scroll to bottom or click "Load More" to load additional moments.

### Viewing Locations
Click the location section to expand/collapse the mini-map.

## Keyboard Shortcuts

No special keyboard shortcuts currently implemented.

## Performance Optimizations

1. **SSR**: Initial page load is fast with server-rendered content
2. **Debounced Search**: Reduces API calls during typing
3. **Pagination**: Only 20 items loaded at a time
4. **Lazy Maps**: Maps only load when expanded
5. **Efficient Date Grouping**: Client-side grouping avoids API complexity

## Responsive Breakpoints

- **Mobile** (< 1024px): Collapsible filter sidebar, full-width timeline
- **Desktop** (>= 1024px): Sidebar (320px), main content, vertical timeline line

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

## Future Enhancements

- [ ] Date range picker
- [ ] Export filtered timeline
- [ ] Print view
- [ ] Timeline visualization (graph)
- [ ] Collaborative filtering
- [ ] Saved search presets
- [ ] Virtual scrolling for performance
- [ ] Keyboard shortcuts
- [ ] View toggle (compact/detailed)

## Troubleshooting

### Moments not appearing
- Check database has moments
- Verify API routes are working
- Check browser console for errors

### Search not working
- Clear browser cache
- Check search query syntax
- Verify API endpoint is accessible

### Filters not applying
- Reset filters and try again
- Check if tags/categories exist in database
- Verify filter values are valid

### Maps not loading
- Check GPS coordinates are valid
- Verify MapView component is working
- Check for JavaScript errors

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (not supported)

---

**Last Updated**: 2025-11-01
**Feature Status**: ✅ Complete
**Phase**: 3.4 Complete
