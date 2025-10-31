# Badge API Testing Guide

## Overview
The Badge API allows the PWA to display notification counts on the app icon. This is particularly useful for showing pending sync counts when the app is in the background.

## Implementation Details

### Files Created/Modified
1. **`src/lib/badge-manager.js`** - Badge API utility with fallback to document title
2. **`src/hooks/useBadge.js`** - React hooks for badge management
3. **`src/components/layout/BadgeManager.jsx`** - UI component for badge settings
4. **`src/app/page.jsx`** - Integrated auto badge updates
5. **`public/sw-manual.js`** - Service worker badge updates on sync
6. **`src/app/settings/page.jsx`** - Added BadgeManager to settings

### Features
- ✅ Automatic badge updates based on pending moments count
- ✅ Badge clears when app is opened/focused
- ✅ Badge updates when app goes to background
- ✅ Badge updates after background sync completes
- ✅ Fallback to document title for unsupported browsers
- ✅ Manual test controls in Settings page

## Browser Support

### ✅ Supported Browsers
- Chrome 81+ (Desktop & Android)
- Edge 81+
- Opera 68+

### ⚠️ Not Supported
- Firefox (No Badge API support)
- Safari (No Badge API support)

**Fallback**: For unsupported browsers, the badge count is shown in the document title (e.g., "(3) CapturePWA").

## Testing Instructions

### Prerequisites
1. Use a Chromium-based browser (Chrome, Edge, Opera)
2. Build and run the app in production mode (Badge API requires HTTPS or localhost)

### Test 1: Manual Badge Control
1. Navigate to **Settings** page (`/settings`)
2. Scroll to the **App Badge** section
3. You should see:
   - Badge API Status: ✓ Supported (or ⚠ Not Supported)
   - Current Badge Count
   - Test controls
4. Try the following:
   - Change the test count (e.g., 5)
   - Click **Set Badge** - Badge should appear on browser tab/app icon
   - Click **Clear Badge** - Badge should disappear

### Test 2: Automatic Badge with Pending Sync
1. Go to the **Dashboard** (`/`)
2. Turn off your internet connection (offline mode)
3. Create a new moment with description and/or media
4. The moment will be queued for sync
5. Close the tab or switch to another tab
6. **Expected**: Badge should show "1" on the app icon/tab
7. Return to the app tab
8. **Expected**: Badge should clear automatically

### Test 3: Background Sync Updates Badge
1. While offline, create 3 moments (they will be queued)
2. Close the tab or switch away
3. **Expected**: Badge shows "3"
4. Turn internet back on
5. Background sync will run automatically
6. **Expected**: Badge updates to "0" after sync completes

### Test 4: Document Title Fallback (Firefox/Safari)
1. Open the app in Firefox or Safari
2. Navigate to Settings
3. **Expected**: Badge API Status shows "⚠ Not Supported"
4. Create moments while offline
5. Close or switch away from tab
6. **Expected**: Document title changes to "(3) CapturePWA"

### Test 5: Service Worker Badge Updates
1. Install the PWA (click Install button in Settings)
2. Close the installed app
3. While offline, create moments via the installed app
4. Close the app (minimize or close window)
5. **Expected**: App icon on desktop/homescreen shows badge count
6. Go back online
7. **Expected**: Badge updates after background sync

## API Usage

### In React Components
```javascript
import { useBadge, useAutoBadge } from '@/hooks/useBadge';

function MyComponent() {
  const { badgeCount, isSupported, setBadge, clearBadge } = useBadge();

  // Manual control
  const handleSetBadge = () => setBadge(5);
  const handleClear = () => clearBadge();

  // Or use auto badge (updates based on dependencies)
  useAutoBadge([someState]);
}
```

### In Service Worker
```javascript
// Update badge with count
if ('setAppBadge' in self.navigator) {
  await self.navigator.setAppBadge(count);
}

// Clear badge
if ('clearAppBadge' in self.navigator) {
  await self.navigator.clearAppBadge();
}
```

## Architecture

### Badge Update Flow
1. **App Opens** → Badge clears (via `useAutoBadge` hook)
2. **Moment Created Offline** → Saved to IndexedDB pending queue
3. **App Goes to Background** → Badge updates with pending count
4. **Background Sync Runs** → Service worker syncs pending moments
5. **Sync Completes** → Service worker updates badge with remaining count
6. **App Reopens** → Badge clears again

### Automatic Badge Management
The `useAutoBadge` hook in `page.jsx` handles automatic badge updates:
- Listens to `visibilitychange` events
- Clears badge when app visible
- Updates badge when app hidden
- Updates when dependencies change (e.g., sync state)

## Troubleshooting

### Badge Not Showing
1. **Check browser support**: Only Chromium browsers support Badge API
2. **Check HTTPS**: Badge API requires secure context (HTTPS or localhost)
3. **Check installation**: Badge on app icon only works for installed PWAs
4. **Check console**: Look for badge-related logs in DevTools

### Badge Not Clearing
1. **Check visibility events**: Badge should clear on `visibilitychange` to visible
2. **Check focus events**: Badge should clear on window focus
3. **Manual clear**: Use the "Clear Badge" button in Settings

### Badge Count Wrong
1. **Check IndexedDB**: Verify pending moments count in DevTools > Application > IndexedDB
2. **Click "Update from Pending"**: Manually sync badge with pending count
3. **Check service worker**: Ensure service worker is active and not stale

## Console Logs to Watch
```
[BadgeManager] Badge set to 3
[BadgeManager] Badge cleared
[BadgeManager] Title fallback: (3) CapturePWA
[Service Worker] Badge updated to 2
[Service Worker] Badge cleared on notification click
```

## Future Enhancements
- Add badge increment/decrement methods for more granular control
- Add badge animations (badge "pulse" when count increases)
- Add setting to disable badge notifications
- Add badge for different types of notifications (not just pending sync)
- Support badge with icon overlay (when API supports it)

## Resources
- [Badge API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Badging_API)
- [Can I Use Badge API](https://caniuse.com/mdn-api_navigator_setappbadge)
- [W3C Badging API Spec](https://w3c.github.io/badging/)
