#!/bin/bash
# Dark Mode Converter - macOS Compatible
# Converts CSS files to use CSS variables

echo "🌙 McGill AI Advisor - Dark Mode Converter (macOS)"
echo "=================================================="
echo ""

# Define source directory
SRC_DIR="$1"
if [ -z "$SRC_DIR" ]; then
    echo "Usage: ./convert-dark-mode-mac.sh <path-to-frontend/src>"
    echo ""
    echo "Example:"
    echo "  ./convert-dark-mode-mac.sh frontend/src"
    echo ""
    exit 1
fi

if [ ! -d "$SRC_DIR" ]; then
    echo "❌ Error: Directory not found: $SRC_DIR"
    exit 1
fi

# Create backup directory
BACKUP_DIR="${SRC_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in: $BACKUP_DIR"
cp -r "$SRC_DIR"/* "$BACKUP_DIR/"
echo "✓ Backup created"
echo ""

# Function to convert a CSS file (macOS BSD sed compatible)
convert_css_file() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "  Processing: $filename"
    
    # Note: macOS sed requires '' after -i for in-place editing
    
    # Backgrounds - white
    sed -i '' 's/background: *#[Ff][Ff][Ff][Ff][Ff][Ff]\([; ]\)/background: var(--bg-primary)\1/g' "$file"
    sed -i '' 's/background: *white\([; ]\)/background: var(--bg-primary)\1/g' "$file"
    sed -i '' 's/background-color: *#[Ff][Ff][Ff][Ff][Ff][Ff]\([; ]\)/background-color: var(--bg-primary)\1/g' "$file"
    sed -i '' 's/background-color: *white\([; ]\)/background-color: var(--bg-primary)\1/g' "$file"
    
    # Backgrounds - grays
    sed -i '' 's/background: *#[Ff]9[Ff][Aa][Ff][Bb]/background: var(--bg-secondary)/g' "$file"
    sed -i '' 's/background: *#[Ff]5[Ff]5[Ff]5/background: var(--bg-secondary)/g' "$file"
    sed -i '' 's/background: *#[Ff]3[Ff]4[Ff]6/background: var(--bg-tertiary)/g' "$file"
    sed -i '' 's/background: *#[Ee]5[Ee]7[Ee][Bb]/background: var(--bg-quaternary)/g' "$file"
    sed -i '' 's/background: *#[Dd]1[Dd]5[Dd][Bb]/background: var(--bg-quaternary)/g' "$file"
    sed -i '' 's/background-color: *#[Ff]9[Ff][Aa][Ff][Bb]/background-color: var(--bg-secondary)/g' "$file"
    sed -i '' 's/background-color: *#[Ff]5[Ff]5[Ff]5/background-color: var(--bg-secondary)/g' "$file"
    sed -i '' 's/background-color: *#[Ff]3[Ff]4[Ff]6/background-color: var(--bg-tertiary)/g' "$file"
    
    # Text colors - dark
    sed -i '' 's/color: *#111827/color: var(--text-primary)/g' "$file"
    sed -i '' 's/color: *#1[Ff]2937/color: var(--text-primary)/g' "$file"
    sed -i '' 's/color: *#1[Aa]1[Aa]1[Aa]/color: var(--text-primary)/g' "$file"
    sed -i '' 's/color: *#333333/color: var(--text-primary)/g' "$file"
    sed -i '' 's/color: *#333\([; ]\)/color: var(--text-primary)\1/g' "$file"
    sed -i '' 's/color: *black\([; ]\)/color: var(--text-primary)\1/g' "$file"
    
    # Text colors - medium
    sed -i '' 's/color: *#4[Bb]5563/color: var(--text-secondary)/g' "$file"
    sed -i '' 's/color: *#555555/color: var(--text-secondary)/g' "$file"
    sed -i '' 's/color: *#666666/color: var(--text-secondary)/g' "$file"
    sed -i '' 's/color: *#666\([; ]\)/color: var(--text-secondary)\1/g' "$file"
    
    # Text colors - light  
    sed -i '' 's/color: *#6[Bb]7280/color: var(--text-tertiary)/g' "$file"
    sed -i '' 's/color: *#999999/color: var(--text-muted)/g' "$file"
    sed -i '' 's/color: *#999\([; ]\)/color: var(--text-muted)\1/g' "$file"
    sed -i '' 's/color: *#9[Cc][Aa]3[Aa][Ff]/color: var(--text-muted)/g' "$file"
    
    # Borders
    sed -i '' 's/border: *1px solid #[Ee]5[Ee]7[Ee][Bb]/border: 1px solid var(--border-primary)/g' "$file"
    sed -i '' 's/border: *2px solid #[Ee]5[Ee]7[Ee][Bb]/border: 2px solid var(--border-primary)/g' "$file"
    sed -i '' 's/border-color: *#[Ee]5[Ee]7[Ee][Bb]/border-color: var(--border-primary)/g' "$file"
    sed -i '' 's/border: *1px solid #[Dd]1[Dd]5[Dd][Bb]/border: 1px solid var(--border-secondary)/g' "$file"
    sed -i '' 's/border-color: *#[Dd]1[Dd]5[Dd][Bb]/border-color: var(--border-secondary)/g' "$file"
    sed -i '' 's/border-bottom: *2px solid #[Ee]5[Ee]7[Ee][Bb]/border-bottom: 2px solid var(--border-primary)/g' "$file"
    sed -i '' 's/border-top: *1px solid #[Ee]5[Ee]7[Ee][Bb]/border-top: 1px solid var(--border-primary)/g' "$file"
    
    # McGill Red
    sed -i '' 's/#[Ee][Dd]1[Bb]2[Ff]/var(--accent-primary)/g' "$file"
    sed -i '' 's/#ED1B2F/var(--accent-primary)/g' "$file"
    sed -i '' 's/#[Dd]01929/var(--accent-hover)/g' "$file"
    sed -i '' 's/#[Bb]01623/var(--accent-active)/g' "$file"
    
    # Success/Error/Warning
    sed -i '' 's/#10[Bb]981/var(--success-primary)/g' "$file"
    sed -i '' 's/#10b981/var(--success-primary)/g' "$file"
    sed -i '' 's/#[Ee][Ff]4444/var(--error-primary)/g' "$file"
    sed -i '' 's/#ef4444/var(--error-primary)/g' "$file"
    sed -i '' 's/#[Ff]59[Ee]0[Bb]/var(--warning-primary)/g' "$file"
    sed -i '' 's/#f59e0b/var(--warning-primary)/g' "$file"
}

# Find and convert all CSS files
echo "🔍 Finding and converting CSS files..."
echo ""

total=0
while IFS= read -r css_file; do
    convert_css_file "$css_file"
    ((total++))
done < <(find "$SRC_DIR" -name "*.css" -type f)

echo ""
echo "=================================================="
echo "✅ Conversion Complete!"
echo "   Files processed: $total"
echo "   Backup location: $BACKUP_DIR"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Test your app: npm run dev"
echo "2. Toggle dark mode in sidebar"
echo "3. Check for remaining hardcoded colors:"
echo "   grep -r '#[0-9A-Fa-f]\\{3,6\\}' $SRC_DIR --include='*.css' | grep -v 'var(--'"
echo ""
echo "4. If something looks wrong, restore from backup:"
echo "   rm -rf $SRC_DIR && cp -r $BACKUP_DIR $SRC_DIR"
echo ""
