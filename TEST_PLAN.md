# Test Plan - LLM Chat Backend API

## Overview
This test plan covers testing the backend API for Phases 1-3:
- Server health and initialization
- Provider availability endpoints
- Chat functionality with multiple LLM providers
- Error handling and validation

## Prerequisites

1. **Environment Setup**
   ```bash
   # Ensure you have a .env file with at least one API key
   cp .env.example .env
   # Edit .env and add at least one API key (OpenAI, Anthropic, or Google)
   ```

2. **Dependencies Installed**
   ```bash
   cd backend
   npm install
   ```

3. **Backend Server Running**
   ```bash
   cd backend
   npm run dev
   ```
   Expected output:
   ```
   🤖 Initialized LLM providers: openai (or list of available providers)
   🚀 Server running on http://localhost:3001
   ```

## Test Cases

### Test 1: Server Health Check
**Objective**: Verify the server starts and responds to basic requests

**Steps**:
1. Start the backend server: `cd backend && npm run dev`
2. Check server logs for initialization messages
3. Test health endpoint

**Test Command**:
```bash
curl http://localhost:3001/health
```

**Expected Result**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX..."
}
```

**Success Criteria**:
- ✅ Server starts without errors
- ✅ Health endpoint returns 200 status
- ✅ Response contains status and timestamp

---

### Test 2: Provider Availability Endpoint
**Objective**: Verify the API correctly reports available LLM providers

**Steps**:
1. Ensure backend is running
2. Call the providers endpoint

**Test Command**:
```bash
curl http://localhost:3001/api/providers
```

**Expected Result** (with all API keys configured):
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI GPT",
      "available": true
    },
    {
      "id": "anthropic",
      "name": "Anthropic Claude",
      "available": true
    },
    {
      "id": "gemini",
      "name": "Google Gemini",
      "available": true
    }
  ]
}
```

**Expected Result** (with only OpenAI configured):
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI GPT",
      "available": true
    },
    {
      "id": "anthropic",
      "name": "Anthropic Claude",
      "available": false
    },
    {
      "id": "gemini",
      "name": "Google Gemini",
      "available": false
    }
  ]
}
```

**Success Criteria**:
- ✅ Endpoint returns 200 status
- ✅ Response includes all three providers
- ✅ `available` field correctly reflects API key presence
- ✅ Providers without API keys show `available: false`

---

### Test 3: Chat with OpenAI (if configured)
**Objective**: Test basic chat functionality with OpenAI

**Prerequisites**: OpenAI API key in `.env`

**Steps**:
1. Send a POST request to `/api/chat` with OpenAI provider

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      {
        "role": "user",
        "content": "Say hello in one sentence"
      }
    ]
  }'
```

**Expected Result**:
```json
{
  "message": "Hello! How can I assist you today?",
  "provider": "openai",
  "model": "gpt-4"
}
```

**Success Criteria**:
- ✅ Returns 200 status
- ✅ Response contains message from OpenAI
- ✅ Provider and model fields are correct
- ✅ Response is coherent and relevant

---

### Test 4: Chat with Anthropic (if configured)
**Objective**: Test chat functionality with Anthropic Claude

**Prerequisites**: Anthropic API key in `.env`

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "messages": [
      {
        "role": "user",
        "content": "What is 2+2? Answer in one word."
      }
    ]
  }'
```

**Expected Result**:
```json
{
  "message": "Four",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022"
}
```

**Success Criteria**:
- ✅ Returns 200 status
- ✅ Response from Claude is correct
- ✅ Provider and model fields match Anthropic

---

### Test 5: Chat with Gemini (if configured)
**Objective**: Test chat functionality with Google Gemini

**Prerequisites**: Google API key in `.env`

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "messages": [
      {
        "role": "user",
        "content": "Name a primary color. One word only."
      }
    ]
  }'
```

**Expected Result**:
```json
{
  "message": "Red",
  "provider": "gemini",
  "model": "gemini-pro"
}
```

**Success Criteria**:
- ✅ Returns 200 status
- ✅ Response from Gemini is correct
- ✅ Provider and model fields match Gemini

---

### Test 6: Multi-turn Conversation
**Objective**: Test conversation history handling

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      {
        "role": "user",
        "content": "My name is Alice"
      },
      {
        "role": "assistant",
        "content": "Nice to meet you, Alice!"
      },
      {
        "role": "user",
        "content": "What is my name?"
      }
    ]
  }'
```

**Expected Result**:
```json
{
  "message": "Your name is Alice.",
  "provider": "openai",
  "model": "gpt-4"
}
```

**Success Criteria**:
- ✅ LLM remembers context from previous messages
- ✅ Response references earlier conversation
- ✅ Conversation history is properly maintained

---

### Test 7: System Message Support
**Objective**: Test system message functionality

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant that always responds in uppercase."
      },
      {
        "role": "user",
        "content": "say hello"
      }
    ]
  }'
```

**Expected Result**:
```json
{
  "message": "HELLO! HOW CAN I HELP YOU TODAY?",
  "provider": "openai",
  "model": "gpt-4"
}
```

**Success Criteria**:
- ✅ System message influences response style
- ✅ Response follows system instructions

---

### Test 8: Model Override
**Objective**: Test custom model selection

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ],
    "model": "gpt-3.5-turbo"
  }'
```

**Expected Result**:
```json
{
  "message": "Hello! How can I help you?",
  "provider": "openai",
  "model": "gpt-3.5-turbo"
}
```

**Success Criteria**:
- ✅ Custom model is used instead of default
- ✅ Response model field matches requested model

---

### Test 9: Error Handling - Invalid Provider
**Objective**: Test error handling for unavailable provider

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  }'
```
*(Run this when OpenAI API key is NOT configured)*

**Expected Result**:
```json
{
  "error": "Chat request failed",
  "message": "Provider 'openai' is not available. Please check your API keys."
}
```

**Success Criteria**:
- ✅ Returns 500 status code
- ✅ Error message is clear and helpful
- ✅ No server crash

---

### Test 10: Error Handling - Invalid Request Format
**Objective**: Test validation for malformed requests

**Test Command**:
```bash
# Missing required fields
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai"
  }'
```

**Expected Result**:
```json
{
  "error": "Invalid request",
  "details": [
    {
      "path": ["messages"],
      "message": "Required"
    }
  ]
}
```

**Success Criteria**:
- ✅ Returns 400 status code
- ✅ Validation errors are detailed
- ✅ No processing of invalid data

---

### Test 11: Error Handling - Empty Messages
**Objective**: Test validation for empty message array

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": []
  }'
```

**Expected Result**:
```json
{
  "error": "Invalid request",
  "details": [
    {
      "path": ["messages"],
      "message": "Array must contain at least 1 element(s)"
    }
  ]
}
```

**Success Criteria**:
- ✅ Returns 400 status code
- ✅ Clear validation error message

---

### Test 12: Error Handling - Last Message Not from User
**Objective**: Test validation that last message must be from user

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [
      {
        "role": "assistant",
        "content": "Hello"
      }
    ]
  }'
```

**Expected Result**:
```json
{
  "error": "Chat request failed",
  "message": "Last message must be from user"
}
```

**Success Criteria**:
- ✅ Returns 500 status code
- ✅ Clear error message

---

### Test 13: Error Handling - Invalid Provider Name
**Objective**: Test validation for invalid provider enum value

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "invalid-provider",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  }'
```

**Expected Result**:
```json
{
  "error": "Invalid request",
  "details": [
    {
      "path": ["provider"],
      "message": "Invalid enum value. Expected 'openai' | 'anthropic' | 'gemini'"
    }
  ]
}
```

**Success Criteria**:
- ✅ Returns 400 status code
- ✅ Validation catches invalid enum value

---

## Test Execution Checklist

### Basic Functionality
- [ ] Test 1: Server Health Check
- [ ] Test 2: Provider Availability Endpoint
- [ ] Test 3: Chat with OpenAI (if configured)
- [ ] Test 4: Chat with Anthropic (if configured)
- [ ] Test 5: Chat with Gemini (if configured)

### Advanced Features
- [ ] Test 6: Multi-turn Conversation
- [ ] Test 7: System Message Support
- [ ] Test 8: Model Override

### Error Handling
- [ ] Test 9: Invalid Provider (no API key)
- [ ] Test 10: Invalid Request Format
- [ ] Test 11: Empty Messages
- [ ] Test 12: Last Message Not from User
- [ ] Test 13: Invalid Provider Name

## Testing Tools

### Option 1: curl (Command Line)
All test commands above use `curl`. Works on macOS/Linux.

### Option 2: HTTPie (More Readable)
```bash
# Install: brew install httpie
http POST http://localhost:3001/api/chat \
  provider=openai \
  messages:='[{"role":"user","content":"Hello"}]'
```

### Option 3: Postman/Insomnia
Import the test cases into a REST client:
- Base URL: `http://localhost:3001`
- Endpoints: `/health`, `/api/providers`, `/api/chat`

### Option 4: Browser (for GET requests)
- Health: http://localhost:3001/health
- Providers: http://localhost:3001/api/providers

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "=== Test 1: Health Check ==="
curl -s $BASE_URL/health | jq .

echo -e "\n=== Test 2: Providers ==="
curl -s $BASE_URL/api/providers | jq .

echo -e "\n=== Test 3: Chat (OpenAI) ==="
curl -s -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [{"role": "user", "content": "Say hello"}]
  }' | jq .
```

Make executable: `chmod +x test-api.sh`
Run: `./test-api.sh`

## Success Criteria Summary

✅ **All tests pass** when:
- Server starts without errors
- Health endpoint works
- Provider endpoint correctly reports availability
- Chat works with at least one configured provider
- Error handling returns appropriate status codes and messages
- Validation catches invalid input
- Multi-turn conversations maintain context

## Next Steps After Testing

Once all tests pass:
1. Document any issues found
2. Fix any bugs discovered
3. Proceed to Phase 4: Frontend Development
4. Create integration tests between frontend and backend

