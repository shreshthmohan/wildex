#!/bin/bash

# Script to convert all images in a folder to WebP format
# Usage: ./convert_to_webp.sh [input_directory] [quality]
# Example: ./convert_to_webp.sh ./my_images 80

# Default values
INPUT_DIR="${1:-.}"     # Default to current directory if not specified
QUALITY="${2:-80}"      # Default quality is 80 (0-100)

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first."
    echo "You can install it using your package manager, for example:"
    echo "  - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  - macOS: brew install imagemagick"
    echo "  - Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Output directory will be the same as input directory
OUTPUT_DIR="${INPUT_DIR}"

# Count total number of image files (excluding existing .webp files)
total_files=$(find "$INPUT_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" -o -iname "*.tiff" \) -not -iname "*.webp" | wc -l)
if [ "$total_files" -eq 0 ]; then
    echo "No image files found in $INPUT_DIR"
    exit 0
fi

echo "Found $total_files image files to convert"
echo "Converting images to WebP format with quality: $QUALITY"

# Counter for progress tracking
counter=0

# Loop through all image files and convert them (excluding existing .webp files)
find "$INPUT_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" -o -iname "*.tiff" \) -not -iname "*.webp" | while read -r file; do
    filename=$(basename "$file")
    name="${filename%.*}"
    
    # Convert the image to WebP format
    magick "$file" -quality "$QUALITY" "$OUTPUT_DIR/$name.webp"
    
    # Update counter and show progress
    counter=$((counter + 1))
    echo "[$counter/$total_files] Converted: $filename → $name.webp"
done

echo "Conversion complete! All images have been converted to WebP format in the same directory."