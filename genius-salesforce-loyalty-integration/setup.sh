#!/bin/bash

# Genius POS to Salesforce Loyalty Integration Setup Script

set -e

echo "=============================================="
echo "Genius Loyalty Integration Setup"
echo "=============================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18 or higher is required"
    echo "Current version: $(node -v)"
    exit 1
fi
echo "✓ Node.js $(node -v) installed"
echo ""

# Check if Redis is installed
echo "Checking Redis..."
if ! command -v redis-cli &> /dev/null; then
    echo "Warning: Redis not found. Please install Redis:"
    echo "  macOS: brew install redis"
    echo "  Ubuntu: sudo apt-get install redis-server"
    echo "  RHEL/CentOS: sudo yum install redis"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ Redis installed"
fi
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "Warning: .env file already exists"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        echo "✓ .env file created from template"
    else
        echo "  Using existing .env file"
    fi
else
    cp .env.example .env
    echo "✓ .env file created from template"
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Build TypeScript
echo "Building TypeScript..."
npm run build
echo "✓ Build completed"
echo ""

# Create logs directory
echo "Creating logs directory..."
mkdir -p logs
echo "✓ Logs directory created"
echo ""

# Test Redis connection
echo "Testing Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        echo "✓ Redis connection successful"
    else
        echo "Warning: Cannot connect to Redis"
        echo "  Make sure Redis is running: redis-server"
    fi
fi
echo ""

echo "=============================================="
echo "Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your environment variables:"
echo "   nano .env"
echo ""
echo "2. Update the following required variables:"
echo "   - GENIUS_API_KEY"
echo "   - GENIUS_STORE_ID"
echo "   - SALESFORCE_USERNAME"
echo "   - SALESFORCE_PASSWORD"
echo "   - SALESFORCE_SECURITY_TOKEN"
echo "   - SALESFORCE_CLIENT_ID"
echo "   - SALESFORCE_CLIENT_SECRET"
echo ""
echo "3. Start Redis (if not running):"
echo "   redis-server"
echo ""
echo "4. Start the application:"
echo "   npm run dev     (development)"
echo "   npm start       (production)"
echo ""
echo "5. Test the health endpoint:"
echo "   curl http://localhost:3000/api/webhooks/health"
echo ""
echo "For more information, see README.md"
echo ""
