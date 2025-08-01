#\!/bin/bash
# Simple script to create basic PWA icons using ImageMagick (if available) or CSS
# For now, we'll create placeholder files that browsers can work with

# Create a simple SVG that can serve as fallback
cat > /tmp/icon.svg << 'SVGEOF'
<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
  <rect width="144" height="144" fill="#6366f1"/>
  <text x="72" y="72" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="24" font-weight="bold">SP</text>
</svg>
SVGEOF

# Copy SVG as placeholder (most browsers will handle SVG in place of PNG)
cp /tmp/icon.svg ./icon-144x144.png
cp /tmp/icon.svg ./icon-192x192.png  
cp /tmp/icon.svg ./icon-512x512.png

echo "PWA icon placeholders created"
