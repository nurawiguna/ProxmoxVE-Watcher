#!/bin/bash

# Demo deployment script for Proxmox VE Watcher
# This script builds the frontend in demo mode for static deployment

set -e

echo "🚀 Building Proxmox VE Watcher Demo..."

# Navigate to web directory
cd "$(dirname "$0")/web"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for demo mode
echo "🔨 Building demo version..."
npm run build:demo

echo "✅ Demo build completed!"
echo "📁 Built files are in web/dist/"
echo ""
echo "🌐 You can now deploy the contents of web/dist/ to:"
echo "   - Netlify: Just drag and drop the dist folder"
echo "   - Vercel: Use 'vercel' command in the project root"
echo "   - Any static hosting service"
echo ""
echo "🔍 To preview locally, run: npm run preview"
