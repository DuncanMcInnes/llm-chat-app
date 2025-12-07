#!/bin/bash

# Quick API Test Script
# Make sure backend is running: cd backend && npm run dev

BASE_URL="http://localhost:3001"

echo "🧪 Testing LLM Chat Backend API"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "📋 Test 1: Health Check"
echo "----------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ PASS${NC} - Status: $HTTP_CODE"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}❌ FAIL${NC} - Status: $HTTP_CODE"
  echo "$BODY"
fi
echo ""

# Test 2: Providers
echo "📋 Test 2: Get Available Providers"
echo "-----------------------------------"
PROVIDERS_RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/api/providers)
HTTP_CODE=$(echo "$PROVIDERS_RESPONSE" | tail -n1)
BODY=$(echo "$PROVIDERS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ PASS${NC} - Status: $HTTP_CODE"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  
  # Check which providers are available
  AVAILABLE=$(echo "$BODY" | jq -r '.providers[] | select(.available == true) | .id' 2>/dev/null)
  if [ -n "$AVAILABLE" ]; then
    echo -e "${YELLOW}Available providers: $(echo $AVAILABLE | tr '\n' ' ')${NC}"
  else
    echo -e "${YELLOW}⚠️  No providers available. Check your API keys in .env${NC}"
  fi
else
  echo -e "${RED}❌ FAIL${NC} - Status: $HTTP_CODE"
  echo "$BODY"
fi
echo ""

# Test 3: Chat (if OpenAI is available)
echo "📋 Test 3: Chat with OpenAI (if available)"
echo "-------------------------------------------"
CHAT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [{"role": "user", "content": "Say hello in one sentence"}]
  }')
HTTP_CODE=$(echo "$CHAT_RESPONSE" | tail -n1)
BODY=$(echo "$CHAT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ PASS${NC} - Status: $HTTP_CODE"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
elif [ "$HTTP_CODE" -eq 500 ]; then
  ERROR_MSG=$(echo "$BODY" | jq -r '.message' 2>/dev/null || echo "$BODY")
  if echo "$ERROR_MSG" | grep -q "not available"; then
    echo -e "${YELLOW}⚠️  SKIP${NC} - OpenAI not configured: $ERROR_MSG"
  else
    echo -e "${RED}❌ FAIL${NC} - Status: $HTTP_CODE"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  fi
else
  echo -e "${RED}❌ FAIL${NC} - Status: $HTTP_CODE"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
fi
echo ""

# Test 4: Error Handling - Invalid Request
echo "📋 Test 4: Error Handling - Invalid Request"
echo "--------------------------------------------"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai"
  }')
HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}✅ PASS${NC} - Status: $HTTP_CODE (expected)"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}❌ FAIL${NC} - Expected 400, got: $HTTP_CODE"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
fi
echo ""

echo "================================"
echo "✅ Test suite complete!"
echo ""
echo "💡 Tip: Install 'jq' for better JSON formatting:"
echo "   brew install jq"

