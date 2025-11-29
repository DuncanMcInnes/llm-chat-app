# Development Environment Setup

## Installing Node.js with nvm (Recommended)

### Step 1: Install nvm

For macOS/Linux, run this in your terminal:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Or using Homebrew (if you have it):
```bash
brew install nvm
```

### Step 2: Reload your shell

After installation, reload your shell configuration:
```bash
source ~/.zshrc
# or if using bash:
# source ~/.bash_profile
```

### Step 3: Verify nvm installation

```bash
nvm --version
```

### Step 4: Install Node.js LTS

```bash
# Install the latest LTS (Long Term Support) version
nvm install --lts

# Use it as default
nvm use --default

# Verify installation
node --version
npm --version
```

You should see something like:
```
v20.11.0
10.2.4
```

## Alternative: Direct Node.js Installation

If you prefer not to use nvm, you can install Node.js directly:

### Option 1: Official Installer
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version for macOS
3. Run the installer

### Option 2: Homebrew
```bash
brew install node
```

## Verify Installation

After installation, verify everything works:

```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

## Next Steps

Once Node.js is installed, you can proceed with:

1. **Install project dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Troubleshooting

### nvm command not found
- Make sure you've reloaded your shell: `source ~/.zshrc`
- Check that nvm was added to your shell config file (`~/.zshrc` or `~/.bash_profile`)

### Permission errors
- nvm installs to your home directory, so no sudo needed
- If you get permission errors with npm, avoid using `sudo npm`

### Multiple Node versions
- Use `nvm list` to see installed versions
- Use `nvm use <version>` to switch versions
- Use `nvm alias default <version>` to set default

