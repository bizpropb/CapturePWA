# Screen Wake Lock API Documentation

## Overview

The Screen Wake Lock API prevents the device screen from dimming or locking during important activities. CapturePWA automatically manages wake locks during video recording and audio playback to ensure uninterrupted user experience.

---

## What is Wake Lock?

Wake Lock is a web API that prevents the screen from:
- Dimming after inactivity
- Turning off automatically
- Locking when a timer expires

This is essential for activities where the user is passively viewing content or when the app needs to remain visible.

---

## Implementation

### Utilities (`src/lib/wake-lock-utils.js`)

#### Basic Functions

```js
import {
  checkWakeLockSupport,
  requestWakeLock,
  releaseWakeLock,
  isWakeLockActive
} from '@/lib/wake-lock-utils';

// Check support
if (checkWakeLockSupport()) {
  // Request wake lock
  const wakeLock = await requestWakeLock('screen');

  // Check if active
  console.log(isWakeLockActive(wakeLock)); // true

  // Release when done
  await releaseWakeLock(wakeLock);
}
```

#### WakeLockManager Class

For easier management, use the `WakeLockManager` class:

```js
import { WakeLockManager } from '@/lib/wake-lock-utils';

const manager = new WakeLockManager();

// Request wake lock
await manager.request();

// Check status
console.log(manager.isActive()); // true

// Release
await manager.release();

// Enable/disable functionality
manager.setEnabled(false); // Disables wake lock
```

**Auto Re-acquisition:**
Wake locks are automatically released when the page becomes hidden (user switches tabs, minimizes browser, etc.). The manager can automatically re-acquire the lock:

```js
import { WakeLockManager, setupVisibilityListener } from '@/lib/wake-lock-utils';

const manager = new WakeLockManager();
const cleanup = setupVisibilityListener(manager);

// Wake lock will auto re-acquire when page becomes visible
// Call cleanup() to remove listener when done
```

---

### React Hooks

#### useWakeLock

Manual control over wake lock:

```jsx
import { useWakeLock } from '@/hooks/useWakeLock';

function MyComponent() {
  const wakeLock = useWakeLock({
    enabled: true,
    autoReacquire: true
  });

  return (
    <div>
      <p>Status: {wakeLock.isActive ? 'Active' : 'Inactive'}</p>
      <button onClick={wakeLock.request}>Request</button>
      <button onClick={wakeLock.release}>Release</button>
      <button onClick={wakeLock.toggle}>Toggle</button>
    </div>
  );
}
```

**Returns:**
```ts
{
  isSupported: boolean,      // Browser support
  isActive: boolean,          // Current state
  error: string | null,       // Error message
  request: () => Promise<boolean>,
  release: () => Promise<void>,
  toggle: () => Promise<boolean>
}
```

#### useAutoWakeLock

Automatically manages wake lock based on a condition:

```jsx
import { useAutoWakeLock } from '@/hooks/useWakeLock';

function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Wake lock activates when isPlaying is true
  const wakeLock = useAutoWakeLock(isPlaying);

  return (
    <div>
      <video
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {wakeLock.isActive && <p>Screen will stay on</p>}
    </div>
  );
}
```

---

## Integration Points

### 1. Video Recording (`CameraCapture.jsx`)

Wake lock automatically activates during video recording:

```jsx
// src/components/capture/CameraCapture.jsx
const wakeLock = useAutoWakeLock(isRecording);
```

**Behavior:**
- ✅ Activates when recording starts
- ✅ Keeps screen on during recording
- ✅ Releases when recording stops
- ✅ Re-acquires if user switches back to tab

### 2. Audio Playback (`AudioRecorder.jsx`)

Wake lock activates during audio playback:

```jsx
// src/components/capture/AudioRecorder.jsx
const wakeLock = useAutoWakeLock(isPlaying);
```

**Behavior:**
- ✅ Activates when audio plays
- ✅ Keeps screen on during playback
- ✅ Releases when audio stops
- ✅ Works with playback speed controls

### 3. Settings Page Demo

Interactive demo in Settings → Device Sensors:

```jsx
import WakeLockDemo from '@/components/sensors/WakeLockDemo';

<WakeLockDemo />
```

**Features:**
- Visual status indicator
- Simulated activity toggle
- Manual request/release controls
- Error display
- Browser compatibility info

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 84+ | ✅ Full | Desktop & Android |
| Edge 84+ | ✅ Full | All platforms |
| Safari 16.4+ | ✅ Full | iOS & macOS |
| Firefox | ❌ None | Not implemented |

**Checking Support:**
```js
if ('wakeLock' in navigator) {
  // Supported
}
```

---

## Automatic Behaviors

### Visibility Changes

Wake locks are automatically released when:
- User switches to another tab
- User minimizes the browser
- Screen is locked externally
- Device goes to sleep

**Auto Re-acquisition:**
With `autoReacquire: true` (default), the wake lock automatically re-requests when the page becomes visible again.

```jsx
const wakeLock = useWakeLock({
  autoReacquire: true // Automatically re-acquire on visibility change
});
```

### Page Lifecycle

```
User starts video recording
  → Wake lock requested ✅
  → Screen stays on

User switches to another app
  → Wake lock automatically released (browser behavior)

User returns to PWA
  → Wake lock automatically re-acquired ✅
  → Screen stays on again

User stops recording
  → Wake lock released ✅
```

---

## Error Handling

Common errors and solutions:

### NotAllowedError
```
Wake lock request failed: NotAllowedError
```
**Cause:** User hasn't interacted with the page
**Solution:** Only request wake lock in response to user action (button click, etc.)

### NotSupportedError
```
Wake lock request failed: NotSupportedError
```
**Cause:** Browser doesn't support Wake Lock API
**Solution:** Feature detection + graceful degradation

**Example:**
```jsx
const wakeLock = useWakeLock();

if (!wakeLock.isSupported) {
  console.log('Wake lock not available, but app still works');
}
```

---

## Best Practices

### 1. Always Release When Done

```jsx
useEffect(() => {
  if (isActive) {
    wakeLock.request();
  } else {
    wakeLock.release();
  }
}, [isActive]);
```

### 2. Use Auto Wake Lock for Conditions

Instead of manual management, prefer `useAutoWakeLock`:

```jsx
// ❌ Manual (error-prone)
useEffect(() => {
  if (isPlaying) {
    wakeLock.request();
  } else {
    wakeLock.release();
  }
}, [isPlaying]);

// ✅ Automatic (recommended)
const wakeLock = useAutoWakeLock(isPlaying);
```

### 3. Don't Request on Page Load

Only request in response to user action:

```jsx
// ❌ Bad
useEffect(() => {
  wakeLock.request(); // May fail
}, []);

// ✅ Good
<button onClick={() => wakeLock.request()}>
  Start Activity
</button>
```

### 4. Handle Unsupported Browsers

```jsx
if (wakeLock.isSupported) {
  return <WakeLockControls />;
} else {
  return <p>Screen may dim during playback</p>;
}
```

---

## Use Cases in CapturePWA

### Current Implementations

1. **Video Recording** ✅
   - Keeps screen on while recording
   - Essential for hands-free recording
   - Prevents accidental stop

2. **Audio Playback** ✅
   - Keeps screen on during long audio files
   - Useful for voice notes, podcasts
   - Better than requiring user to keep tapping

### Potential Future Uses

3. **Gallery Slideshow**
   - Auto-advance through photos
   - Keep screen on during presentation

4. **Turn-by-Turn Directions**
   - If adding maps/navigation
   - Keep screen on for route guidance

5. **QR Code Scanner**
   - Keep screen on while scanning
   - Better detection with constant display

6. **Live Updates**
   - Real-time sync display
   - Dashboard monitoring

---

## Testing

### Desktop Testing

Wake lock works on desktop but is harder to test:

1. Open app in Chrome/Edge
2. Start video recording or audio playback
3. Wait for your screen timeout (usually 5-10 minutes)
4. Screen should stay on

**Quick Test:**
Temporarily reduce screen timeout:
- Windows: Settings → System → Power → Screen
- macOS: Settings → Displays → Turn display off after

### Mobile Testing (Recommended)

1. **Android (Best testing platform)**:
   - Set screen timeout to 30 seconds
   - Open app, go to Settings → Device Sensors
   - Click "Start Activity" in Wake Lock demo
   - Don't touch screen for 30+ seconds
   - Screen should stay on

2. **iOS 16.4+**:
   - Same process as Android
   - Works in Safari only

### Verification

**Check if wake lock is active:**
```jsx
console.log('Wake lock active:', wakeLock.isActive);
```

**Monitor release events:**
```js
wakeLock.addEventListener('release', () => {
  console.log('Wake lock was released');
});
```

---

## Performance Impact

### Battery Usage

Wake locks prevent the screen from dimming, which uses more battery.

**Battery Impact:**
- Screen on (no wake lock): ~3-5% per hour
- Screen on (with wake lock): ~3-5% per hour

Note: Wake lock itself doesn't use battery; it just prevents power-saving features.

**Mitigation:**
- Only use during active tasks
- Release immediately when done
- Let users disable in settings (future enhancement)

### Memory Usage

Negligible:
- Wake lock object: < 1KB
- Event listeners: minimal
- No polling or intervals needed

---

## Security & Privacy

### User Permission

Wake lock does NOT require user permission. However:
- Requires secure context (HTTPS)
- Requires user interaction (can't request on page load)
- Browser can deny request at any time

### Privacy Considerations

- Wake lock doesn't expose any user data
- Doesn't track user behavior
- Can't be used for fingerprinting
- Automatically released on page hide

### Security Best Practices

```jsx
// ✅ Good - Release on unmount
useEffect(() => {
  return () => {
    wakeLock.release();
  };
}, []);

// ✅ Good - User-initiated
<button onClick={wakeLock.request}>
  Keep screen on
</button>

// ❌ Bad - Permanent wake lock
useEffect(() => {
  wakeLock.request();
}, []); // Never releases!
```

---

## Troubleshooting

### Wake Lock Not Working

**1. Check Browser Support:**
```jsx
console.log('Supported:', wakeLock.isSupported);
```

**2. Check Active Status:**
```jsx
console.log('Active:', wakeLock.isActive);
console.log('Error:', wakeLock.error);
```

**3. Check HTTPS:**
Wake lock requires HTTPS (or localhost):
```
http://example.com ❌ Won't work
https://example.com ✅ Works
http://localhost:3000 ✅ Works (dev only)
```

**4. Check User Interaction:**
Request must come from user action:
```jsx
// ❌ May fail
setTimeout(() => wakeLock.request(), 5000);

// ✅ Works
<button onClick={() => wakeLock.request()}>Request</button>
```

### Screen Still Dimming

1. Check if wake lock is actually active
2. Verify no browser extensions blocking it
3. Check device power settings (some override)
4. Try in incognito mode (eliminate extension interference)

### Wake Lock Released Unexpectedly

Normal behaviors that release wake lock:
- Switching tabs
- Minimizing browser
- Device sleep button pressed
- Battery saver mode activated

Solution: Enable `autoReacquire` (enabled by default):
```jsx
const wakeLock = useWakeLock({ autoReacquire: true });
```

---

## API Reference

### WakeLockManager

```ts
class WakeLockManager {
  request(): Promise<boolean>
  release(): Promise<void>
  isActive(): boolean
  setEnabled(enabled: boolean): void
  reacquireOnVisibilityChange(): Promise<void>
}
```

### useWakeLock

```ts
function useWakeLock(options?: {
  enabled?: boolean;
  autoReacquire?: boolean;
}): {
  isSupported: boolean;
  isActive: boolean;
  error: string | null;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
  toggle: () => Promise<boolean>;
}
```

### useAutoWakeLock

```ts
function useAutoWakeLock(
  shouldBeActive: boolean,
  options?: {
    enabled?: boolean;
    autoReacquire?: boolean;
  }
): {
  isSupported: boolean;
  isActive: boolean;
  error: string | null;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
  toggle: () => Promise<boolean>;
}
```

---

## Resources

- [MDN: Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
- [W3C Specification](https://www.w3.org/TR/screen-wake-lock/)
- [Can I Use: Wake Lock](https://caniuse.com/wake-lock)
- [Chrome Platform Status](https://chromestatus.com/feature/4636879949398016)

---

## Summary

✅ **Implemented:**
- Wake lock utility library
- React hooks (manual + automatic)
- Video recording integration
- Audio playback integration
- Settings page demo
- Auto re-acquisition on visibility change
- Error handling
- Browser compatibility checks

📱 **Supported Activities:**
- Video recording (automatic)
- Audio playback (automatic)
- Manual control (settings demo)

🌐 **Browser Support:**
- Chrome/Edge 84+
- Safari 16.4+
- Not supported: Firefox

---

**Last Updated:** 2025-10-31
**Version:** 2.0
**Status:** ✅ Phase 2.7 Complete
