# Testing Guide

## Prerequisites Check

Before testing, ensure you have:
- Node.js 18+ installed
- npm (comes with Node.js)

Check installation:
```bash
node --version
npm --version
```

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory (or backend directory):
```bash
# From project root
cp .env.example .env
```

For basic testing, you can leave API keys empty - the server will still start, but LLM features won't work until you add real keys.

## Step 3: Test Backend Server

### Start the backend:
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📝 Environment: development
🔗 CORS enabled for: http://localhost:3000
```

### Test the health endpoint:

**Option 1: Using curl**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-XX..."}
```

**Option 2: Using browser**
Open: http://localhost:3001/health

**Option 3: Using httpie (if installed)**
```bash
http GET http://localhost:3001/health
```

## Step 4: Test Frontend

In a new terminal:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

Open http://localhost:3000 in your browser. You should see "LLM Chat Interface" with "Frontend coming soon..." message.

## Step 5: Verify TypeScript Compilation

### Backend
```bash
cd backend
npm run type-check
```

Should complete without errors.

### Frontend
```bash
cd frontend
npm run type-check
```

Should complete without errors.

## Troubleshooting

### Port already in use
If port 3001 or 3000 is already in use:
- Change `PORT` in `.env` (backend)
- Change port in `vite.config.ts` (frontend)

### Module not found errors
- Make sure you ran `npm install` in both directories
- Delete `node_modules` and `package-lock.json`, then reinstall

### TypeScript errors
- Run `npm run type-check` to see detailed errors
- Ensure all dependencies are installed

### CORS errors
- Verify `CORS_ORIGIN` in `.env` matches frontend URL (default: http://localhost:3000)

## Quick Test Script

You can also create a simple test script:

```bash
#!/bin/bash
# test-setup.sh

echo "Testing backend health endpoint..."
curl -s http://localhost:3001/health | jq . || echo "Backend not running or jq not installed"

echo "Testing frontend..."
curl -s http://localhost:3000 | grep -q "LLM Chat Interface" && echo "Frontend OK" || echo "Frontend not running"
```

