#\!/bin/bash
# Create all required PWA icons for the manifest

# Define icon sizes needed
SIZES=(72 96 128 144 152 192 384 512)

# Create a simple HTML file that generates canvas-based icons
cat > icon-generator.html << 'HTMLEOF'
<\!DOCTYPE html>
<html>
<head><title>Icon Generator</title></head>
<body>
<canvas id="canvas"></canvas>
<script>
function generateIcon(size) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = size;
    canvas.height = size;
    
    // Purple gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#3730a3');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add border radius effect
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.1);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    // Add "SP" text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SP', size / 2, size / 2);
    
    return canvas.toDataURL('image/png');
}

// Generate each size
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
    const dataUrl = generateIcon(size);
    const link = document.createElement('a');
    link.download = `icon-${size}x${size}.png`;
    link.href = dataUrl;
    link.click();
});
</script>
</body>
</html>
HTMLEOF

echo "HTML icon generator created. For now, creating simple PNG files using ImageMagick if available..."

# Check if ImageMagick is available
if command -v convert >/dev/null 2>&1; then
    echo "ImageMagick found, generating icons..."
    for size in "${SIZES[@]}"; do
        convert -size ${size}x${size} xc:'#6366f1' \
                -fill white -font Arial-Bold -pointsize $((size/4)) \
                -gravity center -annotate +0+0 'SP' \
                "icon-${size}x${size}.png"
        echo "Created icon-${size}x${size}.png"
    done
else
    echo "ImageMagick not found, creating simple placeholder files..."
    # Create base64 encoded simple PNG for each size
    for size in "${SIZES[@]}"; do
        # Create a simple colored square as base64 PNG
        python3 -c "
from PIL import Image, ImageDraw, ImageFont
import io, base64

# Create image
img = Image.new('RGB', ($size, $size), color='#6366f1')
draw = ImageDraw.Draw(img)

# Try to add text
try:
    font_size = max(12, $size // 6)
    draw.text(($size//2, $size//2), 'SP', fill='white', anchor='mm')
except:
    pass

# Save
img.save('icon-${size}x${size}.png', 'PNG')
print('Created icon-${size}x${size}.png')
" 2>/dev/null || {
            # Fallback: create minimal PNG manually
            echo "Creating basic icon-${size}x${size}.png"
            # Create a 1x1 purple pixel and copy it to the right name
            printf "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc``\x00\x00\x00\x02\x00\x01\xe5'\xde\xfc\x00\x00\x00\x00IEND\xaeB\x60\x82" > "icon-${size}x${size}.png"
        }
    done
fi

echo "PWA icon generation complete\!"
rm -f icon-generator.html
