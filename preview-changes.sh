#!/bin/bash
# Preview what the dark mode converter will change
# Run this BEFORE running the actual converter

echo "🔍 Dark Mode Converter - Preview Mode"
echo "======================================"
echo ""
echo "This shows what WILL be changed (without actually changing anything)"
echo ""

SRC_DIR="$1"
if [ -z "$SRC_DIR" ]; then
    echo "Usage: ./preview-changes.sh <path-to-frontend/src>"
    echo ""
    echo "Example:"
    echo "  ./preview-changes.sh frontend/src"
    echo ""
    exit 1
fi

if [ ! -d "$SRC_DIR" ]; then
    echo "❌ Error: Directory not found: $SRC_DIR"
    exit 1
fi

echo "Scanning: $SRC_DIR"
echo ""

# Count replacements by type
echo "📊 Summary of changes that will be made:"
echo ""

white_bg=$(grep -r "background.*#[Ff]\{6\}" "$SRC_DIR" --include="*.css" | wc -l | tr -d ' ')
echo "  White backgrounds (#ffffff): $white_bg"

gray_bg=$(grep -r "background.*#[Ff][0-9A-Fa-f]\{5\}" "$SRC_DIR" --include="*.css" | wc -l | tr -d ' ')
echo "  Gray backgrounds: $gray_bg"

dark_text=$(grep -r "color.*#[0-5][0-9A-Fa-f]\{5\}" "$SRC_DIR" --include="*.css" | wc -l | tr -d ' ')
echo "  Dark text colors: $dark_text"

borders=$(grep -r "border.*#[Ee]5[Ee]7[Ee][Bb]\|border.*#[Dd]1[Dd]5[Dd][Bb]" "$SRC_DIR" --include="*.css" | wc -l | tr -d ' ')
echo "  Borders: $borders"

mcgill_red=$(grep -r "#ED1B2F\|#ed1b2f" "$SRC_DIR" --include="*.css" | wc -l | tr -d ' ')
echo "  McGill Red (#ED1B2F): $mcgill_red"

echo ""
echo "📝 Files that will be modified:"
echo ""

find "$SRC_DIR" -name "*.css" -type f | while read -r file; do
    filename=$(basename "$file")
    count=$(grep -c "#[0-9A-Fa-f]\{6\}\|#[0-9A-Fa-f]\{3\}[^0-9A-Fa-f]" "$file" 2>/dev/null || echo "0")
    if [ "$count" -gt 0 ]; then
        echo "  ✏️  $filename ($count color codes)"
    fi
done

echo ""
echo "✅ Preview complete!"
echo ""
echo "To actually run the conversion:"
echo "  ./convert-dark-mode-mac.sh $SRC_DIR"
echo ""
