#!/bin/bash

# Convert HEIC files to JPG using macOS's built-in sips command
# This script converts all HEIC files in photos/ to JPG format

echo "Converting HEIC files to JPG..."

for file in photos/*.HEIC photos/*.heic; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .HEIC)
        filename=$(basename "$filename" .heic)
        output="photos/${filename}_converted.jpg"
        
        # Skip if the converted file already exists and is newer than source
        if [ -f "$output" ] && [ "$output" -nt "$file" ]; then
            echo "✓ Skipping: $file (already converted)"
        else
            echo "Converting: $file -> $output"
            sips -s format jpeg "$file" --out "$output" -s formatOptions 90
        fi
    fi
done

echo "✓ Conversion complete! Now run: npm run process-images"