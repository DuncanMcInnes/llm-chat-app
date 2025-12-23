# API Keys Setup Guide

## Security Overview

**✅ `.env` files are secure IF:**
- They are in `.gitignore` (never committed to git)
- They stay on your local machine
- They are not shared publicly

**❌ `.env` files are NOT secure if:**
- Committed to git repository
- Shared in screenshots/emails
- Stored in public locations

## How to Get API Keys

### 1. OpenAI (GPT)

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Give it a name (e.g., "LLM Chat App")
5. **Copy the key immediately** - you won't see it again!
6. Paste into your `.env` file

**Note:** OpenAI charges per API call. Start with a small budget limit.

### 2. Anthropic (Claude)

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Give it a name
6. **Copy the key immediately**
7. Paste into your `.env` file

**Note:** Anthropic has usage-based pricing. Check their pricing page.

### 3. Google (Gemini)

1. Go to: https://makersuite.google.com/app/apikey
   OR
   https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. **Copy the key immediately**
6. Paste into your `.env` file

**Note:** Google Gemini has free tier with usage limits.

## Setting Up Your .env File

### Step 1: Create .env from template

```bash
# From project root
cp .env.example .env
```

### Step 2: Add your API keys

Edit `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# LLM Provider API Keys
# Add at least one of these:

OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_DEFAULT_MODEL=gpt-4

ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_DEFAULT_MODEL=claude-3-5-sonnet-20241022

GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_DEFAULT_MODEL=gemini-pro
```

### Step 3: Verify .env is in .gitignore

```bash
# Check that .env is ignored
git check-ignore .env
# Should output: .env
```

## Security Best Practices

### ✅ DO:

1. **Keep `.env` in `.gitignore`**
   - Already configured in this project ✅

2. **Use different keys for different environments**
   - Development keys for local dev
   - Production keys for deployed apps

3. **Rotate keys regularly**
   - Especially if you suspect a key was exposed

4. **Set usage limits/budgets**
   - Most platforms allow you to set spending limits

5. **Use environment-specific keys**
   - Don't use production keys for development

### ❌ DON'T:

1. **Never commit `.env` to git**
   - Check before committing: `git status`

2. **Don't share keys in:**
   - Screenshots
   - Emails
   - Slack/Discord messages
   - Public repositories

3. **Don't hardcode keys in source code**
   - Always use environment variables

4. **Don't use the same key everywhere**
   - Use separate keys for dev/staging/prod

## Verifying Security

### Check if .env is tracked by git:

```bash
git ls-files | grep .env
# Should return nothing (empty)
```

### Check .gitignore includes .env:

```bash
grep .env .gitignore
# Should show: .env
```

### Test that .env is ignored:

```bash
# Create a test .env file
echo "TEST=value" > .env.test
git status
# .env.test should NOT appear in git status
rm .env.test
```

## For Production Deployment

When deploying to cloud (Digital Ocean, etc.):

1. **Use platform environment variables**
   - Don't upload `.env` files
   - Use platform's secret management

2. **Example for Digital Ocean:**
   ```bash
   # Set via Digital Ocean dashboard or CLI
   doctl apps create --spec app.yaml
   # Where app.yaml contains env vars
   ```

3. **Use secret management services:**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Platform-native secret storage

## Troubleshooting

### "Provider not available" error

1. Check `.env` file exists in project root
2. Verify key is correct (no extra spaces)
3. Restart the server after adding keys
4. Check key hasn't expired or been revoked

### Key format issues

- **OpenAI**: Should start with `sk-proj-` or `sk-`
- **Anthropic**: Should start with `sk-ant-api03-`
- **Google**: Should start with `AIzaSy`

### Testing keys

```bash
# Test OpenAI (if you have curl and jq)
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.data[0].id'

# Test Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

## Cost Management

### Set Budget Alerts

- **OpenAI**: Set usage limits in dashboard
- **Anthropic**: Monitor usage in console
- **Google**: Set quotas in Google Cloud Console

### Free Tiers

- **Google Gemini**: Free tier available
- **OpenAI**: Pay-as-you-go (no free tier for GPT-4)
- **Anthropic**: Pay-as-you-go

## Quick Start

1. Get at least one API key (start with Google Gemini - it's free)
2. Add to `.env` file
3. Restart backend server
4. Test with: `curl http://localhost:3001/api/providers`

You should see your provider as `available: true`!

