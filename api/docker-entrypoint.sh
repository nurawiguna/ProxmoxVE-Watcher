#!/bin/sh
set -e

echo "🚀 Starting ProxmoxVE Watcher API with Gunicorn! 🐍"
echo "🔗 Listening on http://0.0.0.0:5000"
echo "👤 Running as user: $(whoami)"

# Wait for any dependencies if needed
# Add any pre-start checks here

exec gunicorn app:app \
    --bind 0.0.0.0:5000 \
    --workers 2 \
    --timeout 30 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload
