# Clipboard API Integration 📋

Complete implementation of the Clipboard API in CapturePWA, enabling seamless copy/paste operations for text and images.

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Features Implemented](#features-implemented)
3. [Browser Support](#browser-support)
4. [Architecture](#architecture)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Components](#components)
8. [Testing](#testing)
9. [Known Limitations](#known-limitations)
10. [Future Enhancements](#future-enhancements)

---

## Overview

The Clipboard API allows web applications to interact with the system clipboard, enabling copy/paste operations programmatically. This is a powerful feature for improving user experience, especially in a PWA context where native-like behavior is desired.

### What We've Built

- **Utility Library**: Core clipboard operations (`src/lib/clipboard-utils.js`)
- **React Hooks**: `useClipboard` and `usePasteListener` for React integration
- **Copy Buttons**: In MomentCard for copying text and share links
- **Paste Support**: In MomentForm for pasting text and images
- **Demo Component**: Interactive clipboard demo in Settings page
- **Browser Detection**: Automatic feature detection and fallbacks

---

## Features Implemented

### ✅ Copy Operations

- **Copy Text**: Copy moment descriptions, metadata, and shareable links
- **Copy Images**: Copy images to clipboard (where supported)
- **Visual Feedback**: "Copied!" state with auto-reset
- **Error Handling**: Graceful fallbacks for unsupported browsers

### ✅ Paste Operations

- **Paste Text**: Paste text into moment descriptions
- **Paste Images**: Paste images directly into moment creation form
- **Event Listening**: Global paste event handling
- **User Feedback**: Visual indicators when paste occurs

### ✅ Browser Compatibility

- **Feature Detection**: Checks for Clipboard API support
- **Permission Handling**: Manages clipboard permissions
- **Fallback Methods**: Uses `document.execCommand()` for older browsers
- **Error Messages**: User-friendly error messages

---

## Browser Support

### Modern Browsers (Full Support)

| Browser | Version | Copy Text | Copy Image | Read Text | Read Image |
|---------|---------|-----------|------------|-----------|------------|
| **Chrome** | 66+ | ✅ | ✅ | ✅ | ✅ |
| **Edge** | 79+ | ✅ | ✅ | ✅ | ✅ |
| **Safari** | 13.1+ | ✅ | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited |
| **Firefox** | 63+ | ✅ | ⚠️ Limited | ⚠️ Limited | ❌ |

### Mobile Browsers

| Browser | Copy Text | Copy Image | Paste |
|---------|-----------|------------|-------|
| **Chrome (Android)** | ✅ | ✅ | ✅ |
| **Safari (iOS 13.4+)** | ✅ | ⚠️ Limited | ✅ |
| **Firefox (Android)** | ✅ | ⚠️ Limited | ✅ |

### Notes:
- ⚠️ **Limited**: Feature works but may require user interaction or have restrictions
- ❌ **Not Supported**: Feature not available
- Clipboard API requires **HTTPS** (or localhost for development)
- Some browsers prompt for permissions on clipboard read operations

---

## Architecture

### File Structure

```
src/
├── lib/
│   └── clipboard-utils.js          # Core clipboard utilities
├── hooks/
│   └── useClipboard.js             # React hooks for clipboard
├── components/
│   ├── moments/
│   │   └── MomentCard.jsx          # Copy text/link buttons
│   ├── capture/
│   │   └── MomentForm.jsx          # Paste support
│   └── ui/
│       └── ClipboardDemo.jsx       # Interactive demo
└── app/
    └── settings/
        └── page.jsx                # Settings page with demo
```

### Core Components

#### 1. Clipboard Utilities (`clipboard-utils.js`)

Provides low-level clipboard operations:

- `isClipboardSupported()` - Check API availability
- `copyText(text)` - Copy text to clipboard
- `copyImage(image)` - Copy image to clipboard
- `readText()` - Read text from clipboard
- `readImage()` - Read image from clipboard
- `onPaste(callback)` - Listen for paste events
- `getClipboardCapabilities()` - Get browser capabilities

#### 2. React Hooks (`useClipboard.js`)

React integration with state management:

- `useClipboard()` - Main hook with copy/read operations
- `usePasteListener()` - Listen for paste events
- `useCopyButton()` - Pre-configured copy button

#### 3. UI Components

- **MomentCard**: Copy moment text and share links
- **MomentForm**: Paste text and images
- **ClipboardDemo**: Interactive demo for testing

---

## Usage Examples

### 1. Copy Text to Clipboard

```jsx
import { useClipboard } from '@/hooks/useClipboard';

function MyComponent() {
  const { copyText, copied, error } = useClipboard();

  const handleCopy = () => {
    copyText('Hello, world!');
  };

  return (
    <button onClick={handleCopy}>
      {copied ? '✓ Copied!' : 'Copy Text'}
    </button>
  );
}
```

### 2. Copy Image to Clipboard

```jsx
import { useClipboard } from '@/hooks/useClipboard';

function ImageCopyButton({ imageUrl }) {
  const { copyImage, copied } = useClipboard();

  const handleCopy = async () => {
    // Convert image URL to blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    copyImage(blob);
  };

  return (
    <button onClick={handleCopy}>
      {copied ? '✓ Image Copied!' : 'Copy Image'}
    </button>
  );
}
```

### 3. Listen for Paste Events

```jsx
import { usePasteListener } from '@/hooks/useClipboard';

function PasteArea() {
  const [pastedContent, setPastedContent] = useState('');

  usePasteListener((data) => {
    if (data.type === 'text') {
      setPastedContent(data.data);
    } else if (data.type === 'image') {
      console.log('Image pasted:', data.dataUrl);
    }
  });

  return <div>{pastedContent}</div>;
}
```

### 4. Read Clipboard Content

```jsx
import { useClipboard } from '@/hooks/useClipboard';

function ReadClipboard() {
  const { readText, readImage } = useClipboard();
  const [content, setContent] = useState('');

  const handleReadText = async () => {
    const result = await readText();
    if (result.success) {
      setContent(result.text);
    }
  };

  return (
    <button onClick={handleReadText}>
      Read Clipboard
    </button>
  );
}
```

### 5. Simple Copy Button (Pre-configured)

```jsx
import { useCopyButton } from '@/hooks/useClipboard';

function QuickCopy({ text }) {
  const buttonProps = useCopyButton(text, {
    successText: 'Done!',
    defaultText: 'Copy'
  });

  return <button {...buttonProps} />;
}
```

---

## API Reference

### `clipboard-utils.js`

#### `isClipboardSupported(): boolean`
Check if Clipboard API is available in the browser.

**Returns**: `true` if supported, `false` otherwise

---

#### `copyText(text: string): Promise<{success: boolean, error?: string}>`
Copy text to clipboard.

**Parameters**:
- `text` (string): Text to copy

**Returns**: Promise resolving to result object

**Example**:
```js
const result = await copyText('Hello!');
if (result.success) {
  console.log('Text copied!');
}
```

---

#### `copyImage(image: Blob | File | string): Promise<{success: boolean, error?: string}>`
Copy image to clipboard.

**Parameters**:
- `image` (Blob | File | string): Image as blob, file, or data URL

**Returns**: Promise resolving to result object

**Example**:
```js
const blob = await fetch(imageUrl).then(r => r.blob());
await copyImage(blob);
```

---

#### `readText(): Promise<{success: boolean, text?: string, error?: string}>`
Read text from clipboard.

**Returns**: Promise resolving to result with text

**Example**:
```js
const result = await readText();
if (result.success) {
  console.log('Clipboard text:', result.text);
}
```

---

#### `readImage(): Promise<{success: boolean, blob?: Blob, dataUrl?: string, error?: string}>`
Read image from clipboard.

**Returns**: Promise resolving to result with blob and data URL

**Example**:
```js
const result = await readImage();
if (result.success) {
  console.log('Image:', result.dataUrl);
}
```

---

#### `getClipboardCapabilities(): Promise<Object>`
Get detailed clipboard capabilities.

**Returns**: Promise resolving to capabilities object

**Example**:
```js
const caps = await getClipboardCapabilities();
console.log('Supports images:', caps.supportsImages);
```

---

### `useClipboard` Hook

#### Usage
```jsx
const {
  copyText,
  copyImage,
  readText,
  readImage,
  reset,
  copied,
  loading,
  error,
  isSupported,
  capabilities
} = useClipboard({ resetDelay: 2000 });
```

#### Options
- `resetDelay` (number): Time in ms before resetting `copied` state (default: 2000)

#### Returned Properties
- `copyText(text)` - Copy text function
- `copyImage(image)` - Copy image function
- `readText()` - Read clipboard text function
- `readImage()` - Read clipboard image function
- `reset()` - Reset all states
- `copied` (boolean) - True if last operation succeeded
- `loading` (boolean) - True during operation
- `error` (string | null) - Error message if failed
- `isSupported` (boolean) - Clipboard API support status
- `capabilities` (object) - Browser capabilities

---

### `usePasteListener` Hook

#### Usage
```jsx
usePasteListener((data) => {
  if (data.type === 'text') {
    console.log('Text pasted:', data.data);
  } else if (data.type === 'image') {
    console.log('Image pasted:', data.dataUrl);
  }
}, { enabled: true });
```

#### Parameters
- `onPaste` (function): Callback when paste occurs
- `options.enabled` (boolean): Whether listener is active (default: true)

#### Callback Data
- `data.type` - 'text' or 'image'
- `data.data` - Text content or image data URL
- `data.blob` - Image blob (only for images)

---

## Components

### MomentCard - Copy Buttons

**Location**: `src/components/moments/MomentCard.jsx`

**Features**:
- **Copy Text Button**: Copies moment description and metadata
- **Copy Link Button**: Copies shareable link to moment
- Visual feedback with checkmark
- Auto-reset after 2 seconds

**Usage**:
```jsx
<MomentCard
  moment={moment}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

### MomentForm - Paste Support

**Location**: `src/components/capture/MomentForm.jsx`

**Features**:
- Paste text into description field
- Paste images directly (sets as moment image)
- Visual feedback when paste occurs
- Helper text showing keyboard shortcut

**Usage**:
```jsx
<MomentForm
  onMomentCreated={handleMomentCreated}
/>
```

---

### ClipboardDemo - Interactive Demo

**Location**: `src/components/ui/ClipboardDemo.jsx`

**Features**:
- Test all clipboard operations
- View browser capabilities
- Check permission status
- Copy/read text and images
- Error handling display

**Usage**:
```jsx
<ClipboardDemo />
```

Available in: **Settings Page** → **Clipboard API** section

---

## Testing

### Manual Testing Checklist

#### Copy Text
- [ ] Copy moment text from MomentCard
- [ ] Copy share link from MomentCard
- [ ] Verify "Copied!" feedback appears
- [ ] Paste copied content elsewhere
- [ ] Test on different browsers

#### Copy Image
- [ ] Select image in ClipboardDemo
- [ ] Click "Copy Image to Clipboard"
- [ ] Paste in external app (e.g., Discord, Slack)
- [ ] Verify image appears correctly

#### Paste Text
- [ ] Copy text from external source
- [ ] Paste in MomentForm description (Ctrl+V / Cmd+V)
- [ ] Verify text appears in textarea
- [ ] Check paste feedback message

#### Paste Image
- [ ] Copy image from external source (right-click → Copy Image)
- [ ] Paste in MomentForm (Ctrl+V / Cmd+V)
- [ ] Verify image preview appears
- [ ] Check paste feedback message

#### Read Clipboard
- [ ] Copy text externally
- [ ] Click "Read Text from Clipboard" in demo
- [ ] Verify text displays
- [ ] Test with images

#### Browser Compatibility
- [ ] Test in Chrome/Edge (full support)
- [ ] Test in Firefox (limited image support)
- [ ] Test in Safari (check permissions)
- [ ] Test on mobile devices

---

## Known Limitations

### Browser Restrictions

1. **HTTPS Required**: Clipboard API only works on HTTPS (or localhost)
2. **Permission Prompts**: Some browsers prompt for clipboard read permission
3. **Image Support**: Image clipboard varies by browser (best in Chrome/Edge)
4. **User Gesture**: Some operations require recent user interaction

### Platform-Specific

#### Safari (iOS/macOS)
- Image clipboard support limited
- Read operations may require additional permissions
- Paste events work better than read API

#### Firefox
- Image clipboard write is limited
- Image clipboard read not supported
- Text operations work well

#### Mobile Browsers
- Copy/paste UX varies by OS
- Some operations need explicit user interaction
- Image clipboard may have size limits

### Security Considerations

- Cannot read clipboard without user interaction
- Cross-origin restrictions apply
- Some browsers block clipboard in iframes
- Permissions can be revoked by user

---

## Future Enhancements

### Planned Features

1. **Rich Text Clipboard**
   - Copy formatted text
   - Preserve HTML structure
   - Support for code blocks

2. **Multiple Items**
   - Copy multiple moments at once
   - Bulk clipboard operations
   - Clipboard history

3. **Advanced Image Handling**
   - Crop before copy
   - Apply filters before copy
   - Copy multiple images

4. **Clipboard Monitoring**
   - Show clipboard content preview
   - Clipboard history UI
   - Clipboard analytics

5. **Integration**
   - Export to external apps via clipboard
   - Import from clipboard
   - Sync clipboard across devices (with backend)

### Code Improvements

- Add unit tests for clipboard utilities
- Add integration tests for copy/paste flows
- Improve error messages
- Add retry logic for failed operations
- Implement clipboard size limits

---

## Troubleshooting

### Common Issues

#### "Clipboard not supported"
- **Cause**: Using HTTP instead of HTTPS
- **Solution**: Deploy to HTTPS or use localhost

#### "Failed to read clipboard"
- **Cause**: Permission denied or no user interaction
- **Solution**: Ensure user clicked a button recently

#### "Image copy not working"
- **Cause**: Browser doesn't support image clipboard
- **Solution**: Use Chrome/Edge, or copy as data URL fallback

#### Paste not working in form
- **Cause**: Focus not in form, or paste listener disabled
- **Solution**: Click in form field, check console for errors

### Debug Tips

1. **Check Capabilities**:
   ```js
   import { getClipboardCapabilities } from '@/lib/clipboard-utils';
   getClipboardCapabilities().then(console.log);
   ```

2. **Enable Console Logging**:
   - All errors are logged to console
   - Check browser DevTools → Console

3. **Test in ClipboardDemo**:
   - Go to Settings → Clipboard API
   - View capabilities section
   - Test each operation individually

---

## Resources

### Official Documentation
- [MDN - Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [W3C Clipboard API Spec](https://www.w3.org/TR/clipboard-apis/)
- [Can I Use - Clipboard API](https://caniuse.com/async-clipboard)

### Related APIs
- [ClipboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent)
- [DataTransfer](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer)
- [execCommand (deprecated)](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)

---

## Summary

The Clipboard API integration in CapturePWA provides:

✅ **Copy**: Text and images to clipboard
✅ **Paste**: Text and images from clipboard
✅ **Read**: Clipboard content programmatically
✅ **Fallbacks**: Support for older browsers
✅ **UI**: Visual feedback and error handling
✅ **Demo**: Interactive testing in Settings

**Browser Support**: Best in Chrome/Edge, good in Safari, limited in Firefox
**Security**: HTTPS required, permissions managed
**User Experience**: Native-like copy/paste behavior

---

**Last Updated**: 2025-11-01
**Phase**: 2.8 - Clipboard API
**Status**: ✅ Complete
