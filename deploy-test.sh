#!/bin/bash

echo "=== DigitalOcean API Deployment Test ==="
echo "Testing at: $(date)"
echo

echo "1. Testing /health endpoint:"
curl -s https://spaghetti-platform-drgev.ondigitalocean.app/health | head -3

echo
echo "2. Testing /api/health endpoint:"
curl -s https://spaghetti-platform-drgev.ondigitalocean.app/api/health | head -3

echo
echo "3. Testing for API service indicators:"
if curl -s https://spaghetti-platform-drgev.ondigitalocean.app/api/health | grep -q "DOCTYPE"; then
    echo "❌ API service NOT running - returning frontend HTML"
else
    echo "✅ API service appears to be responding"
fi

echo
echo "4. Checking response headers:"
curl -s -I https://spaghetti-platform-drgev.ondigitalocean.app/api/health | grep -E "(content-type|x-do-app)"

echo
echo "=== Test Complete ==="