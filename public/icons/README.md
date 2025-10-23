# PWA Icons

## Current Status
A placeholder SVG icon (`icon.svg`) has been created.

## TODO: Generate Proper Icons

You need to generate PNG icons in the following sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## How to Generate Icons

### Option 1: Online Generator (Easiest)
1. Go to https://realfavicongenerator.net/ or https://favicon.io/
2. Upload a 512x512 PNG image of your app icon
3. Download the generated files
4. Copy the PNG files to this directory
5. Update filenames to match manifest.json

### Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
cd public/icons
convert icon.svg -resize 72x72 icon-72x72.png
convert icon.svg -resize 96x96 icon-96x96.png
convert icon.svg -resize 128x128 icon-128x128.png
convert icon.svg -resize 144x144 icon-144x144.png
convert icon.svg -resize 152x152 icon-152x152.png
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 384x384 icon-384x384.png
convert icon.svg -resize 512x512 icon-512x512.png
```

### Option 3: Design Tool
Create icons in Figma, Photoshop, or similar tools and export as PNGs.

## Note
The PWA will work without proper icons, but they won't display correctly when installed. Replace these placeholders before production deployment.
