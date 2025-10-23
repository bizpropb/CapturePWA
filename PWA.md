# Progressive Web Apps (PWA)

## What is a PWA?

A Progressive Web App is a website that can be installed and behave like a native app. It uses modern web APIs to provide app-like experiences including offline functionality, push notifications, and hardware access.

## Key Characteristics

### 1. Installable
- Users can install PWAs directly from the browser without an app store
- Appears on home screen/start menu like native apps
- Runs in standalone window without browser UI

### 2. Offline-Capable
- Service workers cache assets and data
- Works without internet connection
- Syncs data when connection restored

### 3. Progressive Enhancement
- Works on any browser (basic functionality)
- Enhanced features on modern browsers
- Graceful degradation on older browsers

## Device APIs Available to PWAs

### Supported APIs
- **Camera & Microphone**: `navigator.mediaDevices.getUserMedia()`
- **Geolocation**: `navigator.geolocation`
- **Push Notifications**: `Notification API`
- **Background Sync**: Sync data when connection available
- **Vibration**: `navigator.vibrate()`
- **Clipboard**: `navigator.clipboard`
- **File System Access**: Read/write local files (limited)
- **Sensors**: Accelerometer, gyroscope, ambient light
- **Bluetooth**: `Web Bluetooth API`
- **USB**: `WebUSB API`
- **NFC**: `Web NFC API`
- **Screen Orientation**: Lock/detect orientation
- **Battery Status**: Check battery level

### Limited/Not Available
- Full file system access
- Background processing (limited)
- Deep system integration
- iOS has limited PWA support (no background sync, limited notifications)

## PWA vs Native Apps vs Websites

| Feature | PWA | Native App | Website |
|---------|-----|------------|---------|
| Installation | Browser install | App store | None |
| Offline | Yes (service worker) | Yes | No |
| Updates | Automatic | User must update | Automatic |
| Platform | Cross-platform | Platform-specific | Cross-platform |
| Hardware Access | Limited APIs | Full access | Very limited |
| Distribution | Direct URL | App store approval | Direct URL |
| Storage Size | Small (~few MB) | Large (50-500MB) | None |
| Development Cost | Single codebase | Per platform | Single codebase |

## When to Use PWAs

### Good Use Cases
- Content-heavy apps (news, blogs, documentation)
- E-commerce sites wanting app-like experience
- Tools that need offline access (note-taking, calculators)
- Apps that benefit from quick updates without app store delays
- Cross-platform apps with limited hardware needs
- Avoiding app store fees (30% cut)

### Bad Use Cases
- Apps needing deep system integration
- Apps requiring extensive background processing
- iOS-focused apps (PWA support is limited)
- Apps needing full file system access
- Games with high performance requirements

## PWA Requirements

### Technical Requirements
1. **HTTPS**: Must be served over secure connection (localhost is OK for dev)
2. **Service Worker**: JavaScript file that enables offline functionality
3. **Web App Manifest**: JSON file defining app metadata (name, icons, colors)
4. **Responsive**: Works on all screen sizes

### Manifest Example
```json
{
  "name": "My PWA",
  "short_name": "PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Browser Support

### Desktop
- **Chrome/Edge**: Full support
- **Firefox**: Good support (some limitations)
- **Safari**: Basic support

### Mobile
- **Android (Chrome)**: Full support
- **iOS (Safari)**: Limited support
  - No background sync
  - Limited push notifications
  - Limited storage
  - Service worker restrictions

## This Project as PWA Showcase

This app demonstrates:
- **Camera API**: Take photos with device camera
- **Geolocation API**: Capture GPS coordinates
- **MediaRecorder API**: Record audio
- **Offline Storage**: IndexedDB with automatic sync
- **Service Worker**: Cache assets for offline use
- **Install Prompt**: Add to home screen

### Limitations Demonstrated
- Permission prompts required for each hardware feature
- Fallbacks needed when hardware unavailable
- iOS has restricted PWA capabilities
- HTTPS required for hardware access (localhost exception)

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Can I Use: Service Workers](https://caniuse.com/serviceworkers)
- [What Web Can Do Today](https://whatwebcando.today/) - Test browser capabilities
