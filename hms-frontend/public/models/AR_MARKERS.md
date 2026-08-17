# AR Markers for WebAR Anatomy Visualization

## Overview

This directory contains information about AR markers required for the WebAR Anatomy Visualization module.

## Required Markers

For WebAR mode to work on mobile devices, you need to print the following markers:

### 1. HIRO Marker
- **URL**: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png
- **Usage**: Primary marker for AR tracking
- **Size**: Print at 80x80mm for optimal tracking

### 2. KANJI Marker
- **URL**: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/kanji.png
- **Usage**: Alternative marker for AR tracking
- **Size**: Print at 80x80mm for optimal tracking

## Marker Setup Instructions

1. Download the marker images from the URLs above
2. Print them on a flat, non-glossy surface
3. Ensure the white borders are visible
4. Place the marker on a flat surface
5. Point your mobile device's camera at the marker
6. The 3D anatomy model will appear overlaid on the marker

## Custom Markers

You can also create custom AR.js markers using the marker generator tool:
https://ar-js-org.github.io/AR.js/3.0.0/data/images/testimage.gif

## Troubleshooting AR Mode

If AR mode is not working:

1. **Camera Permissions**: Ensure you've granted camera access to the browser
2. **HTTPS Required**: AR requires HTTPS; use localhost or deploy with HTTPS
3. **Lighting**: Ensure good lighting on the marker
4. **Device Support**: WebXR AR requires a compatible device (most modern Android phones, iPhone with iOS 15+)
5. **Browser Support**: Use Chrome, Edge, or Safari (latest versions)

## Technical Details

- **Tracking Method**: Marker-based AR using AR.js
- **Marker Pattern**: Hiro / Kanji preset patterns
- **Camera Parameters**: Auto-loaded from AR.js defaults
- **Update Rate**: 30fps target for smooth tracking

## Desktop Usage

On desktop browsers without AR capability:
- Full 3D model viewing is available
- Orbit, zoom, and pan controls work
- Annotation system is fully functional
- Screenshot capability works
- Quality settings can be adjusted

AR mode indicator shows "Desktop preview only" on non-mobile devices.