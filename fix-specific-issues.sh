#!/bin/bash
# Targeted Dark Mode Fixes - Specific User-Reported Issues
# Fixes ONLY the elements that are still light

echo "🎯 Targeted Dark Mode Fixes"
echo "============================"
echo ""

SRC_DIR="${1:-frontend/src}"

if [ ! -d "$SRC_DIR" ]; then
    echo "❌ Error: Directory not found: $SRC_DIR"
    exit 1
fi

echo "📦 Creating backup..."
BACKUP_DIR="${SRC_DIR}_targeted_fix_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$SRC_DIR"/* "$BACKUP_DIR/"
echo "✓ Backup: $BACKUP_DIR"
echo ""

echo "🔧 Applying targeted fixes..."
echo ""

# ═══════════════════════════════════════════════════════
# 1. EXPORT DATA BUTTON (Settings.css)
# ═══════════════════════════════════════════════════════
echo "  ✓ Fixing export data button..."
SETTINGS_FILE="$SRC_DIR/components/Dashboard/Settings.css"
if [ -f "$SETTINGS_FILE" ]; then
    # Change export button to use CSS variables
    sed -i '' 's/background: *#ED1B2F/background: var(--btn-primary-bg)/g' "$SETTINGS_FILE"
    sed -i '' 's/background: *#c91625/background: var(--btn-primary-hover)/g' "$SETTINGS_FILE"
fi

# ═══════════════════════════════════════════════════════
# 2. PERSONALIZED INSIGHTS CARDS (PersonalizedInsights.css)
# ═══════════════════════════════════════════════════════
echo "  ✓ Fixing personalized insights cards..."
INSIGHTS_FILE="$SRC_DIR/components/Dashboard/PersonalizedInsights.css"
if [ -f "$INSIGHTS_FILE" ]; then
    # All insight card backgrounds → dark
    sed -i '' 's/background: *#FFF9E6/background: var(--card-bg)/g' "$INSIGHTS_FILE"
    sed -i '' 's/background: *#E3F2FD/background: var(--card-bg)/g' "$INSIGHTS_FILE"
    sed -i '' 's/background: *#F3E5F5/background: var(--card-bg)/g' "$INSIGHTS_FILE"
    sed -i '' 's/background: *#E8F5E9/background: var(--card-bg)/g' "$INSIGHTS_FILE"
    sed -i '' 's/background: *#FFE0E6/background: var(--card-bg)/g' "$INSIGHTS_FILE"
fi

# ═══════════════════════════════════════════════════════
# 3. COMPLETED ACHIEVEMENTS (Badges.css)
# ═══════════════════════════════════════════════════════
echo "  ✓ Fixing completed achievements..."
BADGES_FILE="$SRC_DIR/components/Dashboard/Badges.css"
if [ -f "$BADGES_FILE" ]; then
    # Unlocked badge background → dark
    sed -i '' 's/background: *linear-gradient(135deg, *#FFF9E6[^)]*)/background: var(--card-bg)/g' "$BADGES_FILE"
    sed -i '' 's/background: *linear-gradient(135deg, *#FFF4D6[^)]*)/background: var(--card-bg)/g' "$BADGES_FILE"
    sed -i '' 's/border: *2px solid #FFD700/border: 2px solid var(--warning-primary)/g' "$BADGES_FILE"
fi

# ═══════════════════════════════════════════════════════
# 4. PROFILE TAB - INFO BOXES (ProfileTab.css)
# ═══════════════════════════════════════════════════════
echo "  ✓ Fixing profile info boxes..."
PROFILE_FILE="$SRC_DIR/components/Dashboard/ProfileTab.css"
if [ -f "$PROFILE_FILE" ]; then
    # Info boxes with light backgrounds
    sed -i '' 's/background: *#[Ff][Ff][Ff][Bb][Ee][Bb]/background: var(--card-bg)/g' "$PROFILE_FILE"
    sed -i '' 's/background: *#[Ff][Ee][Ff]3[Cc]7/background: var(--card-bg)/g' "$PROFILE_FILE"
    sed -i '' 's/background: *#[Ee]8[Ff]5[Ee]9/background: var(--card-bg)/g' "$PROFILE_FILE"
    sed -i '' 's/background: *#[Dd][Bb][Ee][Aa][Ff][Ee]/background: var(--card-bg)/g' "$PROFILE_FILE"
    
    # Lighten text in info boxes
    sed -i '' 's/color: *#[Aa]78[Bb][Ff][Aa]/color: var(--text-secondary)/g' "$PROFILE_FILE"
    sed -i '' 's/color: *#92400[Ee]/color: var(--text-secondary)/g' "$PROFILE_FILE"
fi

# ═══════════════════════════════════════════════════════
# 5. CHAT BACKGROUND (ChatTab.css)
# ═══════════════════════════════════════════════════════
echo "  ✓ Fixing chat background..."
CHAT_FILE="$SRC_DIR/components/Dashboard/ChatTab.css"
if [ -f "$CHAT_FILE" ]; then
    # Replace ALL white backgrounds in chat
    sed -i '' 's/^  background: white;$/  background: var(--chat-bg);/g' "$CHAT_FILE"
    sed -i '' 's/^  background: #FAFAFA;$/  background: var(--chat-bg);/g' "$CHAT_FILE"
    sed -i '' 's/^  background: #F5F5F5;$/  background: var(--chat-input-bg);/g' "$CHAT_FILE"
    
    # Message container backgrounds
    sed -i '' 's/background-color: white/background-color: var(--chat-message-ai-bg)/g' "$CHAT_FILE"
fi

# ═══════════════════════════════════════════════════════
# 6. CHAT HISTORY SIDEBAR (RightSidebar.css)
# ═══════════════════════════════════════════════════════
echo "  ✓ Fixing chat history sidebar..."
SIDEBAR_FILE="$SRC_DIR/components/Dashboard/RightSidebar.css"
if [ -f "$SIDEBAR_FILE" ]; then
    # Sidebar backgrounds
    sed -i '' 's/background: *#f9fafb/background: var(--sidebar-bg)/g' "$SIDEBAR_FILE"
    sed -i '' 's/background: *linear-gradient(to bottom, *#ffffff, *#f9fafb)/background: var(--sidebar-bg)/g' "$SIDEBAR_FILE"
    sed -i '' 's/^  background: white;$/  background: var(--card-bg);/g' "$SIDEBAR_FILE"
fi

# ═══════════════════════════════════════════════════════
# 7. TEXT CONTRAST IMPROVEMENTS
# ═══════════════════════════════════════════════════════
echo "  ✓ Improving text contrast..."
for file in "$SRC_DIR/components/Dashboard"/*.css; do
    if [ -f "$file" ]; then
        # Make warning text lighter in dark mode
        sed -i '' 's/color: *#[Aa]78[Bb][Ff][Aa]/color: var(--text-secondary)/g' "$file"
        sed -i '' 's/color: *#92400[Ee]/color: var(--text-secondary)/g' "$file"
        sed -i '' 's/color: *#059669/color: var(--success-text)/g' "$file"
    fi
done

echo ""
echo "============================"
echo "✅ All targeted fixes applied!"
echo ""
echo "📋 Fixed:"
echo "  1. ✓ Export data button"
echo "  2. ✓ Personalized insights cards"
echo "  3. ✓ Completed achievements"
echo "  4. ✓ Profile info boxes (AP/IB credits, GPA updates)"
echo "  5. ✓ Chat background"
echo "  6. ✓ Chat history sidebar"
echo "  7. ✓ Text contrast"
echo ""
echo "🧪 Test now:"
echo "  npm run dev"
echo ""
echo "📂 Backup location:"
echo "  $BACKUP_DIR"
echo ""
