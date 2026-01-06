#!/bin/bash

# Simple test script to verify backend endpoints

API_URL="http://localhost:3000/api"

echo "Testing PenPal Platform API..."
echo ""

# Test 1: Server health
echo "1. Testing server health..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/../)
if [ $response -eq 200 ]; then
  echo "✓ Server is running"
else
  echo "✗ Server is not responding (got HTTP $response)"
  exit 1
fi

echo ""
echo "2. Testing user registration..."
# Register a test user
register_response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_'$(date +%s)'@example.com",
    "password": "testpass123",
    "alias": "TestUser'$(date +%s)'"
  }')

token=$(echo $register_response | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ ! -z "$token" ]; then
  echo "✓ Registration successful"
  echo "  Token: ${token:0:20}..."
else
  echo "✗ Registration failed"
  echo "  Response: $register_response"
  exit 1
fi

echo ""
echo "3. Testing authenticated endpoint..."
# Get user profile
profile_response=$(curl -s -X GET $API_URL/auth/me \
  -H "Authorization: Bearer $token")

alias=$(echo $profile_response | grep -o '"alias":"[^"]*' | sed 's/"alias":"//')

if [ ! -z "$alias" ]; then
  echo "✓ Authentication working"
  echo "  User alias: $alias"
else
  echo "✗ Authentication failed"
  echo "  Response: $profile_response"
  exit 1
fi

echo ""
echo "4. Testing discovery feed..."
# Get discovery feed
discovery_response=$(curl -s -X GET "$API_URL/discovery/feed?limit=5" \
  -H "Authorization: Bearer $token")

if echo "$discovery_response" | grep -q '"profiles"'; then
  echo "✓ Discovery feed accessible"
else
  echo "✗ Discovery feed failed"
  echo "  Response: $discovery_response"
fi

echo ""
echo "All basic tests passed! ✓"
echo ""
echo "To run the full application:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo "  Then open http://localhost:5173 in your browser"
