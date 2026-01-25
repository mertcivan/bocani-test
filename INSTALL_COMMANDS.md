# Installation Commands

## Windows (Command Prompt / PowerShell)

```cmd
# Navigate to project directory
cd d:\opencv_app\Bocani_test

# Install dependencies
npm install

# Start development server
npm run dev
```

## Windows (Git Bash / MSYS)

```bash
# Navigate to project directory
cd /d/opencv_app/Bocani_test

# Install dependencies
npm install

# Start development server
npm run dev
```

## macOS / Linux

```bash
# Navigate to project directory
cd ~/opencv_app/Bocani_test

# Install dependencies
npm install

# Start development server
npm run dev
```

## Alternative Package Managers

### Using Yarn
```bash
yarn install
yarn dev
```

### Using pnpm
```bash
pnpm install
pnpm dev
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Verify Installation

After running `npm run dev`, you should see:

```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

Then open your browser to: **http://localhost:3000**

## Troubleshooting

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Node version issues
```bash
# Check your Node version (should be 18+)
node --version

# If too old, download from: https://nodejs.org/
```

### Permission errors (macOS/Linux)
```bash
# Don't use sudo, fix npm permissions instead
# https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

### Clear cache and reinstall
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Development Workflow

```bash
# 1. Make changes to files
# 2. Save (auto-reload happens automatically)
# 3. Test in browser
# 4. Repeat!
```

## Common Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Create production build
npm start            # Run production server
npm run lint         # Run ESLint
```

## Next Steps After Installation

1. ✅ Verify the app loads at http://localhost:3000
2. ✅ Test Practice Mode
3. ✅ Test Mock Exam Mode
4. ✅ Add your questions to data/questions.csv
5. ✅ Customize branding and colors
6. ✅ Build for production

**Happy coding!** 🚀
