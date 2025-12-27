#!/bin/bash

# Test script for Document Processing API
# Tests document upload, processing, and summarization

set -e

BASE_URL="http://localhost:3001"
TEST_PDF=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Document Processing API${NC}"
echo ""

# Check if backend is running
echo -e "${BLUE}1. Checking backend health...${NC}"
if curl -s "${BASE_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running. Please start it first:${NC}"
    echo "   cd backend && npm run dev"
    exit 1
fi

# Check for test PDF
echo ""
echo -e "${BLUE}2. Looking for test PDF...${NC}"
if [ -f "test-document.pdf" ]; then
    TEST_PDF="test-document.pdf"
    echo -e "${GREEN}✅ Found test-document.pdf${NC}"
elif [ -n "$1" ] && [ -f "$1" ]; then
    TEST_PDF="$1"
    echo -e "${GREEN}✅ Using provided PDF: $1${NC}"
else
    echo -e "${YELLOW}⚠️  No test PDF found. Creating a simple test file...${NC}"
    # Create a simple text file for testing
    echo "This is a test document for the LLM Chat App.
    
It contains multiple paragraphs to test document processing.

The document processing system should be able to:
- Extract text from documents
- Chunk the text appropriately
- Summarize the content using LLM providers

This is the final paragraph of the test document." > test-document.txt
    TEST_PDF="test-document.txt"
    echo -e "${GREEN}✅ Created test-document.txt${NC}"
fi

# Test 1: Upload document
echo ""
echo -e "${BLUE}3. Testing document upload...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST \
    -F "file=@${TEST_PDF}" \
    "${BASE_URL}/api/documents/upload")

DOCUMENT_ID=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['document']['id'])" 2>/dev/null || echo "")

if [ -n "$DOCUMENT_ID" ]; then
    echo -e "${GREEN}✅ Document uploaded successfully${NC}"
    echo "   Document ID: $DOCUMENT_ID"
    echo "$UPLOAD_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15 || echo "$UPLOAD_RESPONSE"
else
    echo -e "${RED}❌ Upload failed${NC}"
    echo "$UPLOAD_RESPONSE"
    exit 1
fi

# Test 2: List documents
echo ""
echo -e "${BLUE}4. Testing list documents...${NC}"
LIST_RESPONSE=$(curl -s "${BASE_URL}/api/documents")
DOCUMENT_COUNT=$(echo "$LIST_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['documents']))" 2>/dev/null || echo "0")
echo -e "${GREEN}✅ Found $DOCUMENT_COUNT document(s)${NC}"

# Test 3: Get document details
echo ""
echo -e "${BLUE}5. Testing get document details...${NC}"
DETAILS_RESPONSE=$(curl -s "${BASE_URL}/api/documents/${DOCUMENT_ID}")
if echo "$DETAILS_RESPONSE" | grep -q "document"; then
    echo -e "${GREEN}✅ Document details retrieved${NC}"
    echo "$DETAILS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -20 || echo "$DETAILS_RESPONSE"
else
    echo -e "${RED}❌ Failed to get document details${NC}"
    echo "$DETAILS_RESPONSE"
fi

# Test 4: Summarize document
echo ""
echo -e "${BLUE}6. Testing document summarization...${NC}"
echo "   This may take a moment..."
SUMMARY_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"provider\": \"openai\"}" \
    "${BASE_URL}/api/documents/${DOCUMENT_ID}/summarize")

if echo "$SUMMARY_RESPONSE" | grep -q "summary"; then
    echo -e "${GREEN}✅ Document summarized successfully${NC}"
    echo "$SUMMARY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SUMMARY_RESPONSE"
else
    echo -e "${YELLOW}⚠️  Summarization may have failed (check if OpenAI API key is set)${NC}"
    echo "$SUMMARY_RESPONSE"
fi

# Test 5: Get document content
echo ""
echo -e "${BLUE}7. Testing get document content...${NC}"
CONTENT_RESPONSE=$(curl -s "${BASE_URL}/api/documents/${DOCUMENT_ID}/content")
if echo "$CONTENT_RESPONSE" | grep -q "content"; then
    echo -e "${GREEN}✅ Document content retrieved${NC}"
    CONTENT_LENGTH=$(echo "$CONTENT_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['content']))" 2>/dev/null || echo "0")
    echo "   Content length: $CONTENT_LENGTH characters"
    echo "$CONTENT_RESPONSE" | python3 -m json.tool 2>/dev/null | head -10 || echo "$CONTENT_RESPONSE" | head -5
else
    echo -e "${RED}❌ Failed to get document content${NC}"
fi

echo ""
echo -e "${GREEN}🎉 API Testing Complete!${NC}"
echo ""
echo "Document ID for further testing: $DOCUMENT_ID"
echo "Test it manually:"
echo "  curl ${BASE_URL}/api/documents/${DOCUMENT_ID}"
echo "  curl -X DELETE ${BASE_URL}/api/documents/${DOCUMENT_ID}"

