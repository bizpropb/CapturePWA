# Device Sensors Documentation

## Overview

CapturePWA implements comprehensive device sensor support to create a native app-like experience. This document describes all sensor features, their implementation, and usage.

## Implemented Sensors

### 1. Accelerometer & Gyroscope (Device Motion)

**Purpose**: Detect device movement and gestures

**Features**:
- **Shake Detection**: Shake your device to refresh content
- **Step Counter**: Rough estimate of steps taken (experimental)
- **Movement Detection**: General motion sensing

**Browser Support**: Good (Chrome, Safari, Edge)
**Permissions**: Required on iOS 13+

**Usage**:
```jsx
import { useShakeToRefresh } from '@/hooks/useShakeToRefresh';

const shake = useShakeToRefresh(() => {
  console.log('Shake detected!');
});
```

**Implementation Details**:
- Threshold: 15 (adjustable)
- Cooldown: 2000ms between detections
- Uses `DeviceMotionEvent` API
- Monitors `accelerationIncludingGravity`

---

### 2. Device Orientation

**Purpose**: Track device tilt and rotation

**Features**:
- Alpha: Compass direction (0-360°)
- Beta: Front-to-back tilt (-180 to 180°)
- Gamma: Left-to-right tilt (-90 to 90°)
- Orientation description (flat, tilted forward, etc.)

**Browser Support**: Good (Chrome, Safari, Edge)
**Permissions**: Required on iOS 13+

**Usage**:
```jsx
import { useOrientation } from '@/hooks/useOrientation';

const orientation = useOrientation(true);
console.log(orientation.description); // "tilted forward"
```

---

### 3. Step Counter

**Purpose**: Count steps using accelerometer (rough estimate)

**Note**: This is NOT as accurate as native step counters. It's a proof-of-concept using motion data.

**Features**:
- Start/stop/reset controls
- Real-time step count
- Detects vertical movement patterns

**Browser Support**: Good (Chrome, Safari, Edge)
**Permissions**: Required on iOS 13+

**Usage**:
```jsx
import { useStepCounter } from '@/hooks/useStepCounter';

const stepCounter = useStepCounter(true);
console.log(stepCounter.stepCount); // 42
```

**Limitations**:
- Less accurate than native APIs
- Only works when page is active
- Can have false positives from other movements

---

### 4. Ambient Light Sensor

**Purpose**: Detect ambient light levels and suggest theme

**Features**:
- Light level in lux
- Light description (dim, indoor, bright, etc.)
- Suggested theme (dark/light)
- Auto-switch theme option

**Browser Support**: Limited (Chrome on Android, experimental)
**Permissions**: Not required

**Usage**:
```jsx
import { useAmbientLight } from '@/hooks/useAmbientLight';

const light = useAmbientLight({
  enabled: true,
  autoSwitchTheme: true,
  onThemeChange: (theme) => setTheme(theme)
});

console.log(light.lightLevel); // 150 lux
console.log(light.suggestedTheme); // "dark"
```

**Light Levels**:
- < 50 lux: Very dim → dark theme
- 50-100 lux: Dim → dark theme
- 100-300 lux: Indoor → user preference
- 300-500 lux: Well lit → user preference
- 500-1000 lux: Bright → light theme
- > 1000 lux: Very bright → light theme

**Fallback**: Falls back to `prefers-color-scheme` media query

---

### 5. Battery Status

**Purpose**: Monitor device battery level and charging state

**Features**:
- Battery level (percentage)
- Charging status
- Time until fully charged
- Time until empty
- Low battery detection (< 20%)
- Visual battery indicator

**Browser Support**: Good (Chrome, Edge, Firefox)
**Not Supported**: iOS Safari (privacy reasons)

**Usage**:
```jsx
import { useBattery } from '@/hooks/useBattery';

const battery = useBattery(true);

if (battery.isLowBattery) {
  console.log('Enable battery saving mode');
}
```

**Battery Saving Mode**:
When battery is low (< 20% and not charging):
- Consider disabling video recording
- Reduce animation intensity
- Lower GPS accuracy
- Limit background operations

---

## Permission Handling

### iOS 13+ Requirements

iOS 13 introduced permission requirements for motion sensors:

```jsx
// Request motion permission
const permission = await requestMotionPermission();
// Returns: 'granted', 'denied', or 'prompt'

// Request orientation permission
const permission = await requestOrientationPermission();
```

**User Experience**:
1. Show explanation before requesting
2. Provide enable button in settings
3. Handle denial gracefully
4. Show feature status

### Other Platforms

- Android: No permission required
- Desktop: No permission required (but may not be available)

---

## Components

### SensorDemo Component

Location: `src/components/sensors/SensorDemo.jsx`

**Purpose**: Interactive demo of all sensor features

**Usage**:
```jsx
import SensorDemo from '@/components/sensors/SensorDemo';

<SensorDemo />
```

**Features**:
- Toggle each sensor on/off
- Visual feedback for all sensors
- Permission request buttons
- Real-time sensor data display

### BatteryStatus Component

Location: `src/components/sensors/BatteryStatus.jsx`

**Purpose**: Display battery information

**Usage**:
```jsx
import BatteryStatus from '@/components/sensors/BatteryStatus';

<BatteryStatus />
```

**Display**:
- Battery icon (changes based on level)
- Percentage with color coding
- Charging status
- Time estimates
- Low battery warning

---

## Utility Functions

### Sensor Detection

```js
import {
  checkMotionSupport,
  checkOrientationSupport,
  checkAmbientLightSupport,
  checkBatterySupport
} from '@/lib/sensor-utils';

if (checkMotionSupport()) {
  // Enable motion features
}
```

### Low-Level Access

```js
import {
  detectShake,
  monitorOrientation,
  startStepCounter,
  monitorAmbientLight,
  getBatteryStatus
} from '@/lib/sensor-utils';

// Direct event listeners
const cleanup = detectShake(() => {
  console.log('Shaken!');
}, 15); // threshold

// Clean up when done
cleanup();
```

---

## Browser Compatibility

| Sensor | Chrome | Safari | Firefox | Edge |
|--------|--------|--------|---------|------|
| Motion (shake/steps) | ✅ | ✅ (with permission) | ✅ | ✅ |
| Orientation | ✅ | ✅ (with permission) | ✅ | ✅ |
| Ambient Light | ⚠️ (Android only) | ❌ | ❌ | ⚠️ |
| Battery | ✅ | ❌ (privacy) | ✅ | ✅ |

Legend:
- ✅ Full support
- ⚠️ Partial support
- ❌ Not supported

---

## Testing

### Desktop Testing

Most sensors don't work on desktop (no accelerometer), but you can:

1. **Chrome DevTools**:
   - Open DevTools → More Tools → Sensors
   - Simulate orientation and location
   - Cannot simulate shake/steps

2. **Battery**: Works on laptops

### Mobile Testing

**Required**: Must test on actual device or simulator

**Android**:
1. Connect device via USB
2. Enable USB debugging
3. Access via `chrome://inspect`
4. Shake device to test

**iOS**:
1. Connect device to Mac
2. Enable Web Inspector in Settings
3. Use Safari → Develop → Device
4. Shake device to test
5. Grant permission when prompted

---

## Performance Considerations

### Battery Impact

Continuous sensor monitoring uses battery:

**Best Practices**:
- Only enable when needed
- Stop monitoring when app goes to background
- Use appropriate sampling rates
- Consider battery level (disable on low battery)

### Event Throttling

Motion events fire frequently (60+ Hz):

```js
// Throttle to reasonable rate
let lastUpdate = 0;
const throttleMs = 100; // 10 Hz

window.addEventListener('devicemotion', (e) => {
  const now = Date.now();
  if (now - lastUpdate > throttleMs) {
    lastUpdate = now;
    // Process event
  }
});
```

---

## Privacy & Security

### User Consent

- Always explain why you need sensor access
- Request permission with context
- Allow users to disable features
- Respect denial (don't ask repeatedly)

### Data Handling

- Sensor data can be sensitive (location inference)
- Don't store unnecessary sensor data
- Follow GDPR/privacy regulations
- Be transparent about usage

### Security Concerns

- Motion sensors can infer typing patterns
- Orientation can leak screen content in some cases
- Battery status can be used for tracking
- Always use HTTPS (sensors require secure context)

---

## Troubleshooting

### Shake Not Detected

1. Check permission granted (iOS)
2. Verify device has accelerometer
3. Try harder shake (increase threshold)
4. Check browser console for errors

### Battery Not Available

- iOS Safari: Never available (privacy)
- Check if laptop is plugged in
- Try Chrome/Edge instead

### Ambient Light Not Working

- Very limited support (mainly Android Chrome)
- Check browser flags (chrome://flags)
- May need to enable "Generic Sensor Extra Classes"

### Permission Denied (iOS)

- Settings → Safari → Motion & Orientation
- Toggle off "Prevent Cross-Site Tracking" if needed
- Clear site data and retry

---

## Future Enhancements

Potential additions:

- **Pedometer API**: More accurate step counting
- **Barometer**: Altitude tracking
- **Magnetometer**: Compass functionality
- **Proximity Sensor**: Detect nearby objects
- **Heart Rate**: (very limited support)
- **Temperature Sensors**: (not standardized)

---

## Resources

- [MDN: Device Orientation Events](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events)
- [MDN: Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)
- [Generic Sensor API](https://www.w3.org/TR/generic-sensor/)
- [Can I Use: Device Orientation](https://caniuse.com/deviceorientation)

---

## Summary

✅ **Completed Features**:
- Shake to refresh
- Device orientation tracking
- Step counter (rough estimate)
- Ambient light sensing (where supported)
- Battery status monitoring

🎯 **Integration Points**:
- Settings page: Full sensor demo
- Home page: Shake to refresh
- All pages: Can add any sensor feature

📱 **Production Ready**:
- Proper permission handling
- Graceful degradation
- Browser compatibility checks
- Performance optimized

---

**Last Updated**: 2025-10-31
**Version**: 2.0
**Status**: ✅ Phase 2.5 Complete
