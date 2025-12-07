# GitHub Setup Guide

## Option 1: Create a New Repository on GitHub

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `llm-chat-app` (or your preferred name)
3. **Description**: "Full-stack TypeScript LLM chat interface with multi-provider support"
4. **Visibility**: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## Option 2: Use Existing Repository

If you already have a repository, just note the URL.

## After Creating/Selecting Repository

Run these commands (replace `YOUR_USERNAME` and `REPO_NAME`):

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

