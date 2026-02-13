# Quick Start Guide

## One-Command Startup

```bash
pnpm run dev
```

That's it! Both servers start automatically:
- **Frontend:** http://localhost:3000 (Desktop)
- **Frontend:** http://192.168.0.5:3000 (Mobile/Tablet)
- **Backend:** http://0.0.0.0:8000 (Internal)

---

## Requirements

Before running, make sure you have:

✅ **Node.js 18+** - [Download](https://nodejs.org/)  
✅ **Python 3.9+** - [Download](https://www.python.org/)  
✅ **pnpm** - Run `npm install -g pnpm`  
✅ **FFmpeg** - Run `node install-ffmpeg.bat` (Windows only)  

---

## Initial Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Setup Python backend
node setup.js

# 3. Run the application
pnpm run dev
```

---

## Project Features

### What You Can Do
✅ Download YouTube videos as MP4  
✅ Extract audio as MP3  
✅ Select quality/format  
✅ Track download progress  
✅ Works on mobile & desktop  
✅ Fully responsive design  

### What You Cannot Do
❌ Batch downloads (Phase 2)
❌ Download playlists (Phase 2)
❌ Commercial use  
❌ Copyright-protected content  

---

## Troubleshooting

### Backend not responding?
```bash
# Check if FFmpeg is installed
python python-backend/main.py
```

### Port 3000 in use?
```bash
# Kill existing process
lsof -i:3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Python module errors?
```bash
# Reinstall dependencies
cd python-backend
pip install -r requirements.txt
```

---

## File Structure

```
/
├── app/                    Frontend app
├── components/            React components
├── hooks/                Custom hooks
├── lib/                  Utilities
├── python-backend/      FastAPI backend
├── public/              Static files
├── PHASE_1_COMPLETE.md  Full documentation
└── start-dev.js         Start script
```

---

## Environment Variables

Already configured in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://192.168.0.5:8000
```

Change `192.168.0.5` to your machine's IP if different.

---

## Key Commands

```bash
pnpm run dev              # Start development
pnpm run build            # Production build
pnpm run lint             # Check code
npm run start-production  # Run production build
node diagnose.js          # System check
node setup.js             # Setup dependencies
```

---

## Support

📧 Contact: muthyapuwarsaketh@gmail.com

For issues, check:
- TROUBLESHOOTING.md
- DEPLOYMENT_GUIDE.md
- PHASE_1_COMPLETE.md

---

**Status:** ✅ Production Ready - Phase 1 Complete
