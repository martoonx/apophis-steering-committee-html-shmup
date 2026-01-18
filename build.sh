#!/bin/bash
# APOPHIS Build Script
# Combines all modules back into a single HTML file for distribution

OUTPUT="index-built.html"

echo "Building APOPHIS single-file distribution..."

# Start the HTML file
cat > "$OUTPUT" << 'HTMLHEAD'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Apophis v27 - Single File Build</title>
<style>
HTMLHEAD

# Add CSS
cat css/styles.css >> "$OUTPUT"

# Close style and head, start body
cat >> "$OUTPUT" << 'HTMLBODY'
</style>
</head>
<body>
<div id="overlay">
<canvas id="titleCanvas"></canvas>
</div>
<div id="alert">TRENCH RUN ACTIVATED</div>
<div id="hud">Score: <span id="score">0</span></div>
<div id="levelDisplay">LEVEL: <span id="levelNum">1</span></div>
<div id="sector">SECTOR: OPEN SPACE</div>
<div id="instructions">
←→/AD Move | Z/SPACE Shoot | V Missile | X Shield | C Boomba | ↑↓/WS Weapon | R Restart
</div>
<div id="version">APOPHIS v27.0</div>
<canvas id="gameCanvas"></canvas>
<script>
HTMLBODY

# Process JavaScript files and remove ES6 module syntax
# Order matters for dependencies!
JS_FILES=(
    "js/config.js"
    "js/state.js"
    "js/audio.js"
    "js/input.js"
    "js/title.js"
    "js/bullets.js"
    "js/pickups.js"
    "js/enemies.js"
    "js/bosses.js"
    "js/player.js"
    "js/collision.js"
    "js/render.js"
    "js/hud.js"
    "js/main.js"
)

for file in "${JS_FILES[@]}"; do
    echo "// ========== $file ==========" >> "$OUTPUT"
    # Remove import/export statements and convert to plain JS
    cat "$file" | \
        sed 's/^import.*from.*;//g' | \
        sed 's/^import.*;//g' | \
        sed 's/^export //g' | \
        sed "s/import \* as State from '\.\/state\.js';//g" | \
        sed "s/import \* as Config from '\.\/config\.js';//g" | \
        sed "s/import \* as Render from '\.\/render\.js';//g" | \
        sed "s/import \* as Input from '\.\/input\.js';//g" | \
        sed 's/State\.//g' | \
        sed 's/Config\.//g' | \
        sed 's/Render\.//g' | \
        sed 's/Input\.//g' | \
        grep -v "^$" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
done

# Close script and HTML
cat >> "$OUTPUT" << 'HTMLEND'
</script>
</body>
</html>
HTMLEND

echo "Build complete: $OUTPUT"
echo "File size: $(du -h "$OUTPUT" | cut -f1)"
