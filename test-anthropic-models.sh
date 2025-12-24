#!/bin/bash

# Script to list available Anthropic models for your API key
# This queries the Anthropic API to get the actual list of available models

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Loading .env file..."
  # Try to load from project root .env
  if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
  fi
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo -e "${RED}❌ Error: ANTHROPIC_API_KEY not found${NC}"
  echo "Please set it in your .env file or export it:"
  echo "  export ANTHROPIC_API_KEY=your_key_here"
  exit 1
fi

echo -e "${BLUE}🔍 Querying Anthropic API for available models...${NC}"
echo ""

# Anthropic doesn't have a public models listing endpoint
# So we'll test common model names to discover which ones work
echo -e "${BLUE}Note: Anthropic doesn't provide a models listing endpoint.${NC}"
echo -e "${BLUE}Testing common model names to discover available models...${NC}"
echo ""

# Common Anthropic model names to test
MODELS=(
  "claude-3-5-sonnet-20240620"
  "claude-3-5-sonnet-20241022"
  "claude-3-5-sonnet"
  "claude-3-sonnet-20240229"
  "claude-3-sonnet"
  "claude-3-opus-20240229"
  "claude-3-opus"
  "claude-3-haiku-20240307"
  "claude-3-haiku"
  "claude-2.1"
  "claude-2.0"
  "claude-instant-1.2"
)

available_models=()

echo "Testing model names:"
echo "===================="

for model in "${MODELS[@]}"; do
  echo -n "  Testing: $model ... "
  
  response=$(curl -s -w "\n%{http_code}" -X POST https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d "{
      \"model\": \"$model\",
      \"max_tokens\": 10,
      \"messages\": [{\"role\": \"user\", \"content\": \"test\"}]
    }")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ AVAILABLE${NC}"
    available_models+=("$model")
  elif [ "$http_code" -eq 404 ]; then
    echo -e "${RED}❌ Not found${NC}"
  elif [ "$http_code" -eq 401 ]; then
    echo -e "${RED}❌ Unauthorized${NC}"
    echo ""
    echo -e "${RED}Error: Invalid API key. Please check your ANTHROPIC_API_KEY.${NC}"
    exit 1
  elif [ "$http_code" -eq 400 ]; then
    # 400 might mean invalid model or other request issues
    error_msg=$(echo "$body" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
    if echo "$error_msg" | grep -q "model"; then
      echo -e "${RED}❌ Invalid model${NC}"
    else
      echo -e "${YELLOW}⚠️  HTTP 400${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  HTTP $http_code${NC}"
  fi
done

echo ""
echo "===================="
echo ""

if [ ${#available_models[@]} -eq 0 ]; then
  echo -e "${RED}❌ No available models found!${NC}"
  echo ""
  echo "Possible issues:"
  echo "  1. API key doesn't have access to any models"
  echo "  2. All tested model names are incorrect"
  echo "  3. API key is invalid or expired"
  echo ""
  echo -e "${YELLOW}💡 Check Anthropic's documentation for current model names:${NC}"
  echo "   https://docs.anthropic.com/en/api/models"
else
  echo -e "${GREEN}✅ Available Models:${NC}"
  echo ""
  for model in "${available_models[@]}"; do
    echo -e "  ${GREEN}• $model${NC}"
  done
  echo ""
  echo -e "${BLUE}💡 To use one of these models, update your .env:${NC}"
  echo "   ANTHROPIC_DEFAULT_MODEL=${available_models[0]}"
fi

echo ""
echo -e "${BLUE}💡 Documentation:${NC}"
echo "   https://docs.anthropic.com/en/api/models"

