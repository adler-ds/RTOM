#!/bin/bash

# GitHub Push Helper Script
# This script will help you push to GitHub

set -e

echo "=========================================="
echo "GitHub Push Script"
echo "=========================================="
echo ""

cd "/Users/dadler/Cursor Projects/genius-salesforce-loyalty-integration"

# Check if commit exists
if ! git log -1 > /dev/null 2>&1; then
    echo "❌ No commits found. Please commit first."
    exit 1
fi

echo "✓ Repository ready to push"
echo "  - 44 files"
echo "  - 8,779 lines of code"
echo ""

# Show current remote
echo "Current remote:"
git remote -v
echo ""

# Offer options
echo "Choose push method:"
echo "1) HTTPS (will prompt for GitHub credentials)"
echo "2) SSH (requires SSH key configured)"
echo "3) Cancel"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Setting up HTTPS push..."
        git remote set-url origin https://github.com/adler-ds/genius-salesforce-loyalty-integration.git
        echo ""
        echo "You will be prompted for:"
        echo "  Username: adler-ds"
        echo "  Password: [Use GitHub Personal Access Token]"
        echo ""
        echo "Create a token at: https://github.com/settings/tokens"
        echo ""
        read -p "Press Enter to continue..."
        git push -u origin main
        ;;
    2)
        echo ""
        echo "Setting up SSH push..."
        # Add GitHub to known hosts if not already
        if ! ssh-keygen -F github.com > /dev/null 2>&1; then
            echo "Adding GitHub to known hosts..."
            ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
        fi
        git remote set-url origin git@github.com:adler-ds/genius-salesforce-loyalty-integration.git
        git push -u origin main
        ;;
    3)
        echo "Cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice."
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Successfully pushed to GitHub!"
    echo "=========================================="
    echo ""
    echo "View your repository at:"
    echo "https://github.com/adler-ds/genius-salesforce-loyalty-integration"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please check the error above."
    echo ""
    echo "Common issues:"
    echo "- Wrong credentials (use Personal Access Token, not password)"
    echo "- SSH key not configured"
    echo "- Repository doesn't exist or no access"
    echo ""
fi
