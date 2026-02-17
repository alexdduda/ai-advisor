#!/bin/bash
# Complete Dark Mode Fix - All remaining issues
# This catches ALL the colors that were missed

echo "🌙 Complete Dark Mode Fix"
echo "=========================="
echo ""

SRC_DIR="${1:-frontend/src}"

if [ ! -d "$SRC_DIR" ]; then
    echo "❌ Error: Directory not found: $SRC_DIR"
    echo "Usage: ./complete-dark-mode-fix.sh [path-to-frontend/src]"
    exit 1
fi

echo "📦 Creating safety backup..."
BACKUP_DIR="${SRC_DIR}_complete_fix_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$SRC_DIR"/* "$BACKUP_DIR/"
echo "✓ Backup: $BACKUP_DIR"
echo ""

fix_file() {
    local file="$1"
    
    # === TAILWIND-STYLE LIGHT COLORS ===
    
    # Yellow/Amber (#fef3c7, #fde68a, #fffbeb)
    sed -i '' 's/background: *#[Ff][Ee][Ff]3[Cc]7/background: var(--bg-tertiary)/g' "$file"
    sed -i '' 's/background: *#[Ff][Dd][Ee]68[Aa]/background: var(--bg-tertiary)/g' "$file"
    sed -i '' 's/background: *#[Ff][Ff][Ff][Bb][Ee][Bb]/background: var(--bg-tertiary)/g' "$file"
    sed -i '' 's/background: *linear-gradient([^,]*, *#[Ff][Ee][Ff]3[Cc]7[^)]*)/background: var(--bg-tertiary)/g' "$file"
    sed -i '' 's/background: *linear-gradient([^,]*, *#[Ff][Dd][Ee]68[Aa][^)]*)/background: var(--bg-tertiary)/g' "$file"
    
    # Blue (#dbeafe, #bfdbfe, #eff6ff)
    sed -i '' 's/background: *#[Dd][Bb][Ee][Aa][Ff][Ee]/background: var(--bg-tertiary)/g' "$file"
    sed -i '' 's/background: *#[Bb][Ff][Dd][Bb][Ff][Ee]/background: var(--bg-tertiary)/g' "$file"
    sed -i '' 's/background: *#[Ee][Ff][Ff]6[Ff][Ff]/background: var(--bg-tertiary)/g' "$file"
    sed -i '' 's/background: *linear-gradient([^,]*, *#[Dd][Bb][Ee][Aa][Ff][Ee][^)]*)/background: var(--bg-tertiary)/g' "$file"
    
    # Rose/Pink (#fef2f2, #fee2e2, #ffe4e6)
    sed -i '' 's/background: *#[Ff][Ee][Ff]2[Ff]2/background: var(--card-bg)/g' "$file"
    sed -i '' 's/background: *#[Ff][Ee][Ee]2[Ee]2/background: var(--card-bg)/g' "$file"
    sed -i '' 's/background: *#[Ff][Ff][Ee]4[Ee]6/background: var(--card-bg)/g' "$file"
    sed -i '' 's/background: *#FEF2F2/background: var(--card-bg)/g' "$file"
    sed -i '' 's/background: *#FEE2E2/background: var(--card-bg)/g' "$file"
    sed -i '' 's/background: *linear-gradient([^,]*, *#[Ff][Ee][Ff]2[Ff]2[^)]*)/background: var(--card-bg)/g' "$file"
    sed -i '' 's/background: *linear-gradient([^,]*, *#[Ff][Ee][Ee]2[Ee]2[^)]*)/background: var(--card-bg)/g' "$file"
    
    # === CHAT-SPECIFIC ===
    
    # Light grays for chat (#FAFAFA, #F7F8F9)
    sed -i '' 's/background: *#[Ff][Aa][Ff][Aa][Ff][Aa]/background: var(--chat-bg)/g' "$file"
    sed -i '' 's/background: *#[Ff]7[Ff]8[Ff]9/background: var(--chat-bg)/g' "$file"
    sed -i '' 's/background-color: *#[Ff][Aa][Ff][Aa][Ff][Aa]/background-color: var(--chat-bg)/g' "$file"
    
    # === TEXT COLORS FOR BETTER CONTRAST ===
    
    # Medium grays that are too dark for dark mode
    sed -i '' 's/color: *#[Dd]1[Dd]5[Dd][Bb]/color: var(--text-tertiary)/g' "$file"
    sed -i '' 's/color: *#[Aa]0[Aa]0[Aa]0/color: var(--text-tertiary)/g' "$file"
    sed -i '' 's/color: *#888888/color: var(--text-tertiary)/g' "$file"
    sed -i '' 's/color: *#888\([; ]\)/color: var(--text-tertiary)\1/g' "$file"
    
    # === IMPORTANT FLAGS ===
    
    # Fix !important declarations that were missed
    sed -i '' 's/background: *#[Ff][Ee][Ff]2[Ff]2 *!/background: var(--card-bg) !/g' "$file"
    sed -i '' 's/background: *#[Ff][Ff][Ff][Ff][Ff][Ff] *!/background: var(--card-bg) !/g' "$file"
}

echo "🔧 Processing CSS files..."
echo ""

total=0
while IFS= read -r css_file; do
    filename=$(basename "$css_file")
    echo "  ✓ $filename"
    fix_file "$css_file"
    ((total++))
done < <(find "$SRC_DIR" -name "*.css" -type f)

echo ""
echo "=========================="
echo "✅ Complete! Fixed $total files"
echo ""
echo "📋 Summary of changes:"
echo "  • Yellow/amber cards → dark backgrounds"
echo "  • Blue cards → dark backgrounds"
echo "  • Pink/rose cards → dark backgrounds"
echo "  • Chat backgrounds → dark"
echo "  • Text contrast improved"
echo ""
echo "🧪 Test now:"
echo "  npm run dev"
echo ""
echo "🔄 To restore if needed:"
echo "  rm -rf $SRC_DIR"
echo "  cp -r $BACKUP_DIR $SRC_DIR"
echo ""
