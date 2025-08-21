#!/bin/bash

# Script to upload MP3 files to Cloudflare R2 bucket
# Usage: ./upload-to-r2.sh <local_mp3_directory> <r2_bucket_path>

set -e

LOCAL_DIR="$1"
R2_PATH="$2"
BUCKET_NAME="sinister-dexter-music"

if [ -z "$LOCAL_DIR" ] || [ -z "$R2_PATH" ]; then
    echo "Usage: $0 <local_mp3_directory> <r2_bucket_path>"
    echo "Example: $0 ./mp3_output/ unreleased/2025-08-20-Music-In-The-Park/"
    exit 1
fi

if [ ! -d "$LOCAL_DIR" ]; then
    echo "Error: Local directory '$LOCAL_DIR' does not exist"
    exit 1
fi

# Check if wrangler is installed and authenticated
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler CLI is required but not installed"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

echo "Uploading MP3 files from '$LOCAL_DIR' to R2 bucket '$BUCKET_NAME' at path '$R2_PATH'"

# Upload each MP3 file
for mp3_file in "$LOCAL_DIR"/*.mp3; do
    if [ -f "$mp3_file" ]; then
        filename=$(basename "$mp3_file")
        remote_path="${R2_PATH}${filename}"
        
        echo "Uploading: $filename to $remote_path"
        
        # Upload to R2 using wrangler (remote)
        wrangler r2 object put "$BUCKET_NAME/$remote_path" --file "$mp3_file" --content-type "audio/mpeg" --remote
        
        echo "✓ Uploaded: $filename"
    fi
done

echo ""
echo "Upload complete! Files uploaded to R2 bucket: $BUCKET_NAME"
echo "Path: $R2_PATH"

# Also upload the original WAV files that are already in the bucket
echo ""
echo "Note: Original WAV files should already be in the bucket at the same path"
echo "If not, you can upload them separately using:"
echo "wrangler r2 object put $BUCKET_NAME/<path> --file <wav_file> --content-type \"audio/wav\""