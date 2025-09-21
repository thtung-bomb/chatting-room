#!/bin/bash

# Netlify Deployment Script for Dudaji Chat App
echo "🚀 Starting Netlify deployment for Dudaji Chat App..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Copy static files to build directory
echo "📋 Copying static files..."
cp public/_redirects build/client/_redirects 2>/dev/null || echo "⚠️  _redirects file not found"
cp public/404.html build/client/404.html 2>/dev/null || echo "⚠️  404.html file not found"

echo "✅ Build completed! Deploy directory: build/client"