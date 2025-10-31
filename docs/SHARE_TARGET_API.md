# Web Share Target API - Implementation Guide

## What is the Share Target API?

The **Web Share Target API** is a PWA feature that allows your app to receive shared content from other apps on the user's device. When a user shares a photo, link, or text from another app (like their gallery, browser, or social media), your PWA can appear in the system's share sheet as a destination.

### Real-World Example
- User is browsing photos in their gallery app
- User clicks "Share" on a photo
- System shows share sheet with options (WhatsApp, Email, **CapturePWA**, etc.)
- User selects CapturePWA
- Photo and any text automatically populate a new moment in your app

## How It Works

### 1. Registration (manifest.json)
First, your PWA must register as a share target in the `manifest.json`:

```json
{
  "share_target": {
    "action": "/api/share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "audio/*", "video/*"]
        }
      ]
    }
  }
}
```

**Key Fields:**
- `action`: The URL where shared data will be POSTed
- `method`: Must be "POST" for files
- `enctype`: Must be "multipart/form-data" for files
- `params`: Maps incoming share data to form field names
  - `title`: Shared title (e.g., webpage title)
  - `text`: Shared text (e.g., selected text, description)
  - `url`: Shared URL (e.g., link from browser)
  - `files`: Array of file types to accept

### 2. Processing Shared Data (API Route)
When content is shared to your app, the browser POSTs the data to your specified action URL. Your API route must:

1. **Parse the multipart form data**
2. **Save any files temporarily** (if shared)
3. **Store the data** for retrieval
4. **Redirect to your app** with a reference ID

**Flow:**
```
Other App → Share Sheet → Your PWA
    ↓
Browser POSTs to /api/share-target
    ↓
API saves data & generates share ID
    ↓
Redirects to /capture?shareId=abc123
    ↓
/capture page fetches shared data
    ↓
Form is pre-populated with shared content
```

### 3. Displaying Shared Content (UI)
The capture page:
1. Checks for `shareId` query parameter
2. Fetches shared data from API using the share ID
3. Pre-populates the form with:
   - Description (from title/text/url)
   - Image/audio (from shared files)
4. User can edit and save as a moment

## Implementation in CapturePWA

### Files Modified/Created

1. **`public/manifest.json`**
   - Added `share_target` configuration

2. **`src/app/api/share-target/route.js`** (NEW)
   - Handles POST requests with shared data
   - Temporarily saves files to disk
   - Stores data in in-memory cache
   - Provides GET endpoint to retrieve shared data
   - Auto-cleans up expired shares (10 min timeout)

3. **`src/app/capture/page.jsx`** (NEW)
   - Dedicated capture page
   - Detects `shareId` parameter
   - Fetches and displays shared data
   - Pre-populates form

4. **`src/components/capture/MomentForm.jsx`** (MODIFIED)
   - Added `sharedData` prop
   - Added `useEffect` to populate form from shared data
   - Converts shared media from data URLs to Blobs

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅ 89+  | ✅ 89+ |
| Edge    | ✅ 89+  | ✅ 89+ |
| Safari  | ❌      | ❌     |
| Firefox | ❌      | ❌     |

**Note:** This is primarily a mobile feature. Desktop support is limited.

## Security Considerations

1. **File Validation**
   - Always validate file types and sizes
   - Check MIME types match expected formats
   - Reject oversized files

2. **Temporary Storage**
   - Store shared files temporarily (10 min in our implementation)
   - Clean up files after processing
   - Don't persist sensitive data unnecessarily

3. **Rate Limiting**
   - Consider adding rate limiting to prevent abuse
   - Monitor storage usage

4. **HTTPS Required**
   - Share Target API only works on HTTPS (or localhost)

## Testing

### Testing Share Target API

Since this feature is mobile-focused and requires actual sharing from other apps, testing can be tricky:

#### Method 1: Android (Easiest)
1. Build and deploy your PWA to production (HTTPS required)
2. Install the PWA on Android device
3. Open Gallery app or any app with share functionality
4. Click Share → Select "CapturePWA"
5. Verify the shared content appears in your capture form

#### Method 2: Chrome DevTools (Limited)
You can test the POST endpoint directly:

```bash
curl -X POST http://localhost:3000/api/share-target \
  -F "title=Test Share" \
  -F "text=This is a test" \
  -F "url=https://example.com"
```

Then navigate to: `http://localhost:3000/capture?shareId=<returned-id>`

#### Method 3: Android Emulator (Advanced)
1. Set up Android Studio emulator
2. Build and deploy PWA to accessible URL
3. Install PWA in emulator browser
4. Test sharing from emulator apps

### Debugging

Enable verbose logging in the API route:

```javascript
console.log('📥 Share Target received:', {
  title,
  text,
  url,
  hasMedia: !!mediaFile,
  mediaType: mediaFile?.type
});
```

Check browser DevTools → Application → Manifest to verify share_target registration.

## Limitations

1. **No Safari Support**: Currently not supported in Safari (desktop or mobile)
2. **PWA Must Be Installed**: Share Target only works for installed PWAs
3. **HTTPS Required**: Won't work on HTTP (except localhost)
4. **Limited File Types**: Only accept specific MIME types
5. **Temporary Storage**: Our implementation uses in-memory cache (won't survive server restart)

## Future Enhancements

- [ ] Persist shared data to database (replace in-memory cache)
- [ ] Support video files
- [ ] Handle multiple files at once
- [ ] Add share analytics (track share sources)
- [ ] Implement share preview before saving
- [ ] Add share permissions/privacy controls

## Additional Resources

- [MDN: Web Share Target API](https://developer.mozilla.org/en-US/docs/Web/Manifest/share_target)
- [web.dev: Share Target API](https://web.dev/web-share-target/)
- [Chrome Developers: Receiving Shared Data](https://developer.chrome.com/articles/web-share-target/)

## Troubleshooting

### Share target doesn't appear in share sheet
- Verify PWA is installed (not just opened in browser)
- Check manifest.json is valid (no JSON syntax errors)
- Ensure app is served over HTTPS
- Try uninstalling and reinstalling the PWA
- Check browser support (Chrome/Edge only)

### Shared data not appearing in form
- Check browser console for errors
- Verify share ID is in URL query parameter
- Check API route logs
- Verify file types are in accepted list

### Files fail to save
- Check temp directory permissions
- Verify disk space available
- Check file size limits
- Ensure multipart/form-data encoding is correct

---

**Implementation Date:** 2025-10-31
**Phase:** 1.5 - Advanced PWA Features
**Status:** ✅ Complete
