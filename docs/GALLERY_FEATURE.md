# Gallery Feature Documentation

## Overview
The Gallery feature provides a beautiful, responsive interface for browsing moments with media (images, audio, and video). It includes advanced filtering, sorting, infinite scroll, and a full-screen lightbox viewer.

## Features

### ✨ Core Features
- **Masonry Grid Layout**: Responsive grid that adapts to screen size
  - 1 column on mobile
  - 2 columns on tablets
  - 3 columns on large screens
  - 4 columns on extra-large screens
- **Media Filtering**: Filter by media type (all, images, audio, video)
- **Advanced Filters**:
  - Date range picker
  - Tag selection (multi-select)
  - Category selection
- **Sort Options**:
  - Newest first
  - Oldest first
  - Most viewed
- **Infinite Scroll**: Load more moments automatically
- **Lightbox Viewer**:
  - Full-screen media viewing
  - Keyboard navigation (←, →, Esc)
  - Zoom in/out for images
  - Thumbnail strip for navigation
  - Download functionality
- **Responsive Design**: Works perfectly on all screen sizes

## File Structure

```
src/
├── app/
│   └── gallery/
│       └── page.jsx                 # Gallery page route
├── components/
│   └── gallery/
│       ├── GalleryContent.jsx       # Main gallery component
│       ├── GalleryGrid.jsx          # Masonry grid layout
│       ├── GalleryFilters.jsx       # Filter UI component
│       ├── Lightbox.jsx             # Full-screen viewer
│       └── index.js                 # Component exports
├── lib/
│   └── gallery-api.js               # Gallery API utilities
└── app/
    └── api/
        └── gallery/
            ├── route.js             # Main gallery API
            └── filters/
                └── route.js         # Filters API
```

## Components

### GalleryContent.jsx
**Purpose**: Main container component that manages state and orchestrates the gallery

**Props**:
- `initialMoments`: Object with initial moments and pagination data

**State**:
- `moments`: Array of moment objects
- `pagination`: Pagination metadata
- `loading`: Loading state
- `filters`: Current filter values
- `lightboxOpen`: Lightbox visibility
- `lightboxIndex`: Current lightbox index

**Features**:
- Auto-fetch on mount and filter changes
- Infinite scroll support
- Lightbox management
- Filter state management

### GalleryGrid.jsx
**Purpose**: Responsive masonry grid layout

**Props**:
- `moments`: Array of moments to display
- `onItemClick`: Callback when item is clicked
- `loading`: Loading state

**Features**:
- Dynamic column calculation based on screen size
- Responsive image loading with lazy loading
- Hover effects and animations
- Media type badges
- Tag display
- Mood display

### GalleryFilters.jsx
**Purpose**: Filter and sort UI

**Props**:
- `filters`: Current filter values
- `onFilterChange`: Callback when filters change

**Features**:
- Media type buttons
- Sort buttons
- Date range inputs
- Category chips
- Tag multi-select
- Mobile-responsive (collapsible on mobile)
- Reset all filters button

### Lightbox.jsx
**Purpose**: Full-screen media viewer

**Props**:
- `items`: Array of media items to display
- `initialIndex`: Starting index
- `onClose`: Callback when lightbox closes

**Features**:
- Full-screen viewing
- Keyboard navigation (←, →, Esc)
- Zoom for images (click to toggle)
- Download button
- Info bar with metadata
- Thumbnail navigation strip
- Video playback support
- Prevents body scroll

## API Endpoints

### GET /api/gallery
Fetches paginated moments with media

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `mediaType` (string): 'all', 'image', 'audio', 'video'
- `sortBy` (string): 'newest', 'oldest', 'mostViewed'
- `dateFrom` (ISO date): Start date filter
- `dateTo` (ISO date): End date filter
- `tagIds` (JSON array): Array of tag IDs
- `categoryId` (number): Category ID

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

### GET /api/gallery/filters
Fetches available filters (tags and categories)

**Response**:
```json
{
  "tags": [
    { "id": 1, "name": "travel", "color": "#3b82f6" }
  ],
  "categories": [
    { "id": 1, "name": "Personal", "icon": "📁" }
  ]
}
```

## Usage Examples

### Basic Usage
Navigate to `/gallery` to view the gallery page.

### Filtering
1. Click media type buttons to filter by type
2. Select date range to filter by date
3. Click categories to filter by category
4. Click tags to filter by tags (multi-select)
5. Use sort buttons to change order

### Lightbox
1. Click any media item to open lightbox
2. Use arrow keys or click arrow buttons to navigate
3. Click image to zoom in/out
4. Press Esc or click Close to exit
5. Click Download to save image

### Infinite Scroll
Scroll to bottom of page or click "Load More" button to load additional moments.

## Keyboard Shortcuts

### Gallery Page
- No special shortcuts (standard navigation)

### Lightbox
- `←` / `→`: Navigate between items
- `Esc`: Close lightbox
- `Click on image`: Zoom in/out

## Performance Optimizations

1. **Lazy Loading**: Images load only when in viewport
2. **Pagination**: Only 20 items loaded at a time
3. **Efficient Re-renders**: React hooks minimize unnecessary renders
4. **Debounced Resize**: Column calculation debounced on resize
5. **CSS Animations**: Hardware-accelerated transitions

## Responsive Breakpoints

- **Mobile** (< 640px): 1 column, bottom filters
- **Tablet** (640px - 1024px): 2 columns, collapsible filters
- **Desktop** (1024px - 1280px): 3 columns, visible filters
- **Large** (> 1280px): 4 columns, full filters

## Accessibility

- Keyboard navigation in lightbox
- Focus indicators on all interactive elements
- Alt text on images
- ARIA labels on buttons
- Screen reader friendly

## Future Enhancements

- [ ] Virtual scrolling for better performance with many items
- [ ] Drag-and-drop reordering
- [ ] Bulk selection and actions
- [ ] Slideshow mode
- [ ] Grid/List view toggle
- [ ] Save filter presets
- [ ] Export filtered results
- [ ] Social sharing from lightbox
- [ ] Comments on media items
- [ ] Favorite/like functionality

## Troubleshooting

### Images not loading
- Check Cloudinary configuration
- Verify imageUrl is valid
- Check network connection

### Filters not working
- Clear browser cache
- Check API routes are running
- Verify database has tags/categories

### Lightbox not opening
- Check browser console for errors
- Verify JavaScript is enabled
- Try different browser

### Performance issues
- Reduce page size (limit parameter)
- Optimize images in Cloudinary
- Clear browser cache
- Check for memory leaks

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (not supported)

---

**Last Updated**: 2025-11-01
**Feature Status**: ✅ Complete
**Phase**: 3.3 Complete
