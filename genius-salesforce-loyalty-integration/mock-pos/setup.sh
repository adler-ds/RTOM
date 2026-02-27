#!/bin/bash

# Mock Genius POS Setup Script

echo "=========================================="
echo "Mock Genius POS Setup"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required"
    exit 1
fi
echo "✓ Node.js $(node -v) installed"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the Mock POS:"
echo "  npm start"
echo ""
echo "Then open: http://localhost:4000"
echo ""
echo "Make sure the integration service is running on port 3000!"
echo ""
