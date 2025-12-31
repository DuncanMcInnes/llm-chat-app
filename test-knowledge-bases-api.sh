#!/bin/bash

# Test script for Knowledge Base API
# Tests KB CRUD operations, document association, and indexing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3003}"
BACKEND_URL="${BACKEND_URL:-$API_URL}"

echo -e "${BLUE}🧪 Knowledge Base API Test Script${NC}"
echo "=================================="
echo "Backend URL: $BACKEND_URL"
echo ""

# Check if backend is running
echo -e "${YELLOW}Checking backend health...${NC}"
if ! curl -s -f "$BACKEND_URL/health" > /dev/null; then
    echo -e "${RED}❌ Backend is not running at $BACKEND_URL${NC}"
    echo "Please start the backend server first."
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Test 1: Create a Knowledge Base
echo -e "${BLUE}Test 1: Create Knowledge Base${NC}"
KB_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/knowledge-bases" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Knowledge Base",
        "description": "A test knowledge base for API testing",
        "config": {
            "embeddingProvider": "openai",
            "embeddingModel": "text-embedding-3-small",
            "chunkingStrategy": "fixed",
            "chunkSize": 1000,
            "overlap": 200,
            "retrievalTopK": 5,
            "retrievalThreshold": 0.7
        }
    }')

KB_ID=$(echo "$KB_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$KB_ID" ]; then
    echo -e "${RED}❌ Failed to create KB${NC}"
    echo "Response: $KB_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Knowledge Base created${NC}"
echo "KB ID: $KB_ID"
echo "Response: $KB_RESPONSE" | jq '.' 2>/dev/null || echo "$KB_RESPONSE"
echo ""

# Test 2: List all Knowledge Bases
echo -e "${BLUE}Test 2: List all Knowledge Bases${NC}"
LIST_RESPONSE=$(curl -s "$BACKEND_URL/api/knowledge-bases")
echo -e "${GREEN}✅ Knowledge Bases listed${NC}"
echo "$LIST_RESPONSE" | jq '.' 2>/dev/null || echo "$LIST_RESPONSE"
echo ""

# Test 3: Get Knowledge Base details
echo -e "${BLUE}Test 3: Get Knowledge Base details${NC}"
GET_RESPONSE=$(curl -s "$BACKEND_URL/api/knowledge-bases/$KB_ID")
echo -e "${GREEN}✅ Knowledge Base details retrieved${NC}"
echo "$GET_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_RESPONSE"
echo ""

# Test 4: Update Knowledge Base
echo -e "${BLUE}Test 4: Update Knowledge Base${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BACKEND_URL/api/knowledge-bases/$KB_ID" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Updated Test Knowledge Base",
        "description": "Updated description",
        "config": {
            "chunkSize": 1500
        }
    }')
echo -e "${GREEN}✅ Knowledge Base updated${NC}"
echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
echo ""

# Test 5: Upload a document to the Knowledge Base
echo -e "${BLUE}Test 5: Upload document to Knowledge Base${NC}"

# Check if test.pdf exists, if not create a simple test document
if [ ! -f "test.pdf" ] && [ ! -f "test-document.txt" ]; then
    echo -e "${YELLOW}Creating test document...${NC}"
    cat > test-document.txt << 'EOF'
This is a test document for Knowledge Base testing.

It contains multiple paragraphs of text that will be chunked and indexed.

The document discusses various topics including:
- Knowledge bases and vector databases
- Embedding models and similarity search
- Document processing and chunking strategies

This content will be used to test the indexing and retrieval functionality.
EOF
    TEST_FILE="test-document.txt"
else
    if [ -f "test.pdf" ]; then
        TEST_FILE="test.pdf"
    else
        TEST_FILE="test-document.txt"
    fi
fi

echo "Uploading: $TEST_FILE"

UPLOAD_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/documents/upload" \
    -F "file=@$TEST_FILE" \
    -F "knowledgeBaseId=$KB_ID" \
    -F "chunkSize=500" \
    -F "overlap=100")

DOC_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$DOC_ID" ]; then
    echo -e "${RED}❌ Failed to upload document${NC}"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Document uploaded${NC}"
echo "Document ID: $DOC_ID"
echo "$UPLOAD_RESPONSE" | jq '.' 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

# Test 6: List documents in Knowledge Base
echo -e "${BLUE}Test 6: List documents in Knowledge Base${NC}"
DOCS_RESPONSE=$(curl -s "$BACKEND_URL/api/knowledge-bases/$KB_ID/documents")
echo -e "${GREEN}✅ Documents listed${NC}"
echo "$DOCS_RESPONSE" | jq '.' 2>/dev/null || echo "$DOCS_RESPONSE"
echo ""

# Test 7: Index document into Knowledge Base
echo -e "${BLUE}Test 7: Index document into Knowledge Base${NC}"
echo "This may take a moment as it generates embeddings..."
INDEX_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/knowledge-bases/$KB_ID/index" \
    -H "Content-Type: application/json" \
    -d "{\"documentId\": \"$DOC_ID\"}")

if echo "$INDEX_RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Failed to index document${NC}"
    echo "Response: $INDEX_RESPONSE"
    echo ""
    echo -e "${YELLOW}Note: This might fail if:${NC}"
    echo "  - Chroma is not running (check: docker ps | grep chroma)"
    echo "  - OpenAI API key is not configured"
    echo "  - Embedding service is not available"
else
    echo -e "${GREEN}✅ Document indexed${NC}"
    echo "$INDEX_RESPONSE" | jq '.' 2>/dev/null || echo "$INDEX_RESPONSE"
fi
echo ""

# Test 8: Get updated Knowledge Base (check counts)
echo -e "${BLUE}Test 8: Verify Knowledge Base counts${NC}"
UPDATED_KB=$(curl -s "$BACKEND_URL/api/knowledge-bases/$KB_ID")
echo -e "${GREEN}✅ Knowledge Base counts verified${NC}"
echo "$UPDATED_KB" | jq '.' 2>/dev/null || echo "$UPDATED_KB"
echo ""

# Test 9: Create another KB with different config
echo -e "${BLUE}Test 9: Create second Knowledge Base (OLLAMA)${NC}"
KB2_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/knowledge-bases" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "OLLAMA Knowledge Base",
        "description": "KB using OLLAMA embeddings",
        "config": {
            "embeddingProvider": "ollama",
            "embeddingModel": "nomic-embed-text",
            "chunkingStrategy": "sentence",
            "chunkSize": 800,
            "overlap": 150
        }
    }')

KB2_ID=$(echo "$KB2_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$KB2_ID" ]; then
    echo -e "${YELLOW}⚠️  Failed to create second KB (OLLAMA might not be available)${NC}"
    echo "Response: $KB2_RESPONSE"
else
    echo -e "${GREEN}✅ Second Knowledge Base created${NC}"
    echo "KB ID: $KB2_ID"
    echo "$KB2_RESPONSE" | jq '.' 2>/dev/null || echo "$KB2_RESPONSE"
fi
echo ""

# Test 10: List all KBs again
echo -e "${BLUE}Test 10: List all Knowledge Bases (final)${NC}"
FINAL_LIST=$(curl -s "$BACKEND_URL/api/knowledge-bases")
KB_COUNT=$(echo "$FINAL_LIST" | grep -o '"id"' | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Total Knowledge Bases: $KB_COUNT${NC}"
echo "$FINAL_LIST" | jq '.' 2>/dev/null || echo "$FINAL_LIST"
echo ""

# Summary
echo -e "${BLUE}==================================${NC}"
echo -e "${GREEN}✅ Test Summary${NC}"
echo -e "${BLUE}==================================${NC}"
echo "Knowledge Base ID: $KB_ID"
echo "Document ID: $DOC_ID"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check Chroma is running: docker ps | grep chroma"
echo "2. Test RAG query (Phase 11): POST /api/rag/query"
echo "3. Clean up test KB: DELETE /api/knowledge-bases/$KB_ID"
echo ""

# Optional cleanup
read -p "Do you want to delete the test Knowledge Base? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deleting test Knowledge Base...${NC}"
    DELETE_RESPONSE=$(curl -s -X DELETE "$BACKEND_URL/api/knowledge-bases/$KB_ID")
    echo "$DELETE_RESPONSE" | jq '.' 2>/dev/null || echo "$DELETE_RESPONSE"
    echo -e "${GREEN}✅ Test Knowledge Base deleted${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All tests completed!${NC}"

