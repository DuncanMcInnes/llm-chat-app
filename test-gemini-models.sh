#!/bin/bash

# Script to list available Google Gemini models for your API key
# This queries the Gemini API to get the actual list of available models

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ -z "$GOOGLE_API_KEY" ]; then
  echo "Loading .env file..."
  # Try to load from project root .env
  if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
  fi
fi

if [ -z "$GOOGLE_API_KEY" ]; then
  echo -e "${RED}❌ Error: GOOGLE_API_KEY not found${NC}"
  echo "Please set it in your .env file or export it:"
  echo "  export GOOGLE_API_KEY=your_key_here"
  exit 1
fi

echo -e "${BLUE}🔍 Querying Google Gemini API for available models...${NC}"
echo ""

# Query the Gemini API for available models
response=$(curl -s -w "\n%{http_code}" -X GET "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_API_KEY")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
  echo -e "${GREEN}✅ Successfully retrieved models!${NC}"
  echo ""
  echo "Available models (that support generateContent):"
  echo "================================================"
  
  # Try to parse JSON and extract model names
  if command -v jq &> /dev/null; then
    # Filter models that support generateContent
    echo "$body" | jq -r '.models[]? | select(.supportedGenerationMethods[]? | contains("generateContent")) | .name' 2>/dev/null | while read model; do
      if [ -n "$model" ]; then
        # Extract just the model name (remove "models/" prefix)
        model_name=$(echo "$model" | sed 's|models/||')
        echo -e "${GREEN}  • $model_name${NC}"
      fi
    done
    
    # If jq didn't find models, show raw response
    model_count=$(echo "$body" | jq -r '.models[]? | select(.supportedGenerationMethods[]? | contains("generateContent")) | .name' 2>/dev/null | wc -l | tr -d ' ')
    if [ "$model_count" -eq 0 ]; then
      echo -e "${YELLOW}⚠️  Could not parse model list. Showing raw response:${NC}"
      echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
  else
    # Fallback: show raw JSON response
    echo -e "${YELLOW}⚠️  jq not installed. Showing raw response:${NC}"
    echo "$body" | head -100
    echo ""
    echo -e "${YELLOW}💡 Install jq for better formatting: brew install jq${NC}"
    echo ""
    echo -e "${BLUE}Look for models with 'generateContent' in supportedGenerationMethods${NC}"
  fi
  
elif [ "$http_code" -eq 401 ]; then
  echo -e "${RED}❌ 401 Unauthorized${NC}"
  echo "Your API key appears to be invalid or expired."
  echo "Please check your GOOGLE_API_KEY in .env"
  
else
  echo -e "${RED}❌ Error: HTTP $http_code${NC}"
  echo "Response:"
  echo "$body" | head -20
  echo ""
  echo -e "${YELLOW}💡 Trying alternative: testing common model names...${NC}"
  echo ""
  
  # Alternative: Test common model names
  MODELS=(
    "gemini-1.5-flash"
    "gemini-1.5-pro"
    "gemini-1.5-flash-latest"
    "gemini-1.5-pro-latest"
    "gemini-pro"
    "gemini-pro-vision"
  )
  
  available_models=()
  
  for model in "${MODELS[@]}"; do
    echo -n "  Testing: $model ... "
    
    test_response=$(curl -s -w "\n%{http_code}" -X POST "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$GOOGLE_API_KEY" \
      -H "content-type: application/json" \
      -d '{
        "contents": [{
          "parts": [{"text": "test"}]
        }]
      }')
    
    test_http_code=$(echo "$test_response" | tail -n1)
    
    if [ "$test_http_code" -eq 200 ]; then
      echo -e "${GREEN}✅ AVAILABLE${NC}"
      available_models+=("$model")
    elif [ "$test_http_code" -eq 404 ]; then
      echo -e "${RED}❌ Not found${NC}"
    else
      echo -e "${YELLOW}HTTP $test_http_code${NC}"
    fi
  done
  
  if [ ${#available_models[@]} -gt 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Available Models:${NC}"
    for model in "${available_models[@]}"; do
      echo -e "  ${GREEN}• $model${NC}"
    done
  fi
fi

echo ""
echo -e "${BLUE}💡 Documentation:${NC}"
echo "   https://ai.google.dev/models/gemini"
echo ""
if [ ${#available_models[@]} -gt 0 ]; then
  echo -e "${BLUE}💡 To use one of these models, update your .env:${NC}"
  echo "   GEMINI_DEFAULT_MODEL=${available_models[0]}"
fi

