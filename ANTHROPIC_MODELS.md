# Anthropic Claude Model Names

## Current Valid Models (as of 2024)

Based on Anthropic API documentation, here are the valid model identifiers:

### Claude 3.5 Series
- `claude-3-5-sonnet-20240620` - Claude 3.5 Sonnet (June 2024)
- `claude-3-5-sonnet-20241022` - Claude 3.5 Sonnet (October 2024) - **May not be available in all regions**

### Claude 3 Series
- `claude-3-opus-20240229` - Claude 3 Opus (most capable)
- `claude-3-sonnet-20240229` - Claude 3 Sonnet
- `claude-3-haiku-20240307` - Claude 3 Haiku (fastest, cheapest)

## Troubleshooting Model 404 Errors

If you're getting a 404 error for a model:

1. **Check your API key has access** - Some models require specific API access
2. **Verify the model name** - Model names are case-sensitive and must match exactly
3. **Check your region** - Some models may be region-specific
4. **List available models** - Use this command to see what's available:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-3-5-sonnet-20240620","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

## Recommended Default

For most use cases, try:
- `claude-3-5-sonnet-20240620` (if available)
- `claude-3-sonnet-20240229` (fallback)
- `claude-3-haiku-20240307` (if you need speed/cost efficiency)

## Update Your .env

If a model isn't working, try updating your `.env`:

```env
ANTHROPIC_DEFAULT_MODEL=claude-3-sonnet-20240229
```

Then restart your backend server.

