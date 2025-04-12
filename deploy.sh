#!/bin/bash

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Restart PM2 process
pm2 restart jobefinder 