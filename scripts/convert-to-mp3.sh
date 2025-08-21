#!/bin/bash

# Script to convert WAV files to MP3 with acoustic compression and normalization
# Usage: ./convert-to-mp3.sh <input_directory> <output_directory>

set -e

INPUT_DIR="$1"
OUTPUT_DIR="$2"

if [ -z "$INPUT_DIR" ] || [ -z "$OUTPUT_DIR" ]; then
    echo "Usage: $0 <input_directory> <output_directory>"
    echo "Example: $0 ~/Downloads/music/unreleased/2025-08-20-Music-In-The-Park/ ./mp3_output/"
    exit 1
fi

if [ ! -d "$INPUT_DIR" ]; then
    echo "Error: Input directory '$INPUT_DIR' does not exist"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is required but not installed"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Converting WAV files from '$INPUT_DIR' to MP3 in '$OUTPUT_DIR'"
echo "Applying acoustic compression and normalization..."

# Convert each WAV file (excluding the large full set recording)
for wav_file in "$INPUT_DIR"/*.wav; do
    if [ -f "$wav_file" ]; then
        filename=$(basename "$wav_file" .wav)
        
        # Skip the large full set recording
        if [[ "$filename" == *"DR-100_0026"* ]]; then
            echo "Skipping large full set recording: $filename"
            continue
        fi
        
        output_file="$OUTPUT_DIR/${filename}.mp3"
        
        echo "Converting: $filename"
        
        # Convert with high quality MP3, normalization, and compression
        # -af loudnorm: EBU R128 loudness normalization
        # -af dynaudnorm: Dynamic audio normalizer
        # -c:a libmp3lame: MP3 encoder
        # -b:a 320k: High quality bitrate
        # -ar 44100: Standard sample rate
        ffmpeg -i "$wav_file" \
            -af "loudnorm=I=-16:TP=-1.5:LRA=7,dynaudnorm=p=0.95" \
            -c:a libmp3lame \
            -b:a 320k \
            -ar 44100 \
            -y \
            "$output_file"
        
        echo "✓ Converted: $filename.mp3"
    fi
done

echo ""
echo "Conversion complete! MP3 files are in: $OUTPUT_DIR"
echo ""
echo "Generated files:"
ls -la "$OUTPUT_DIR"