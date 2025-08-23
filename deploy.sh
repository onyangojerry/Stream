#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests (if any)
echo "🧪 Running tests..."
npm test 2>/dev/null || echo "⚠️  No tests found or test command failed"

# Build the project
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build files created in 'dist' directory"
    echo ""
    echo "🌐 To deploy to Netlify:"
    echo "   1. Push your code to GitHub"
    echo "   2. Go to netlify.com"
    echo "   3. Connect your repository"
    echo "   4. Set build command: npm run build"
    echo "   5. Set publish directory: dist"
    echo ""
    echo "📊 Build stats:"
    echo "   - HTML: $(ls -lh dist/index.html | awk '{print $5}')"
    echo "   - CSS: $(ls -lh dist/assets/*.css | awk '{print $5}')"
    echo "   - JS: $(ls -lh dist/assets/*.js | awk '{print $5}')"
else
    echo "❌ Build failed!"
    exit 1
fi
