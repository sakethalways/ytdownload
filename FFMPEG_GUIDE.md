# Complete Setup Guide - Audio & FFmpeg

## Current Status ✅

Your YouTube downloader is working! Videos download successfully. However, to ensure **full audio support** and enable **MP3 conversions**, FFmpeg needs to be installed.

---

## Issue: Videos Without Audio

### Understanding Format IDs:
- **Format 18**: Mixed h.264 video + AAC audio (includes audio)
- **Format 22, 43, etc**: Higher resolution (may be video-only DASH)
- **DASH Formats** (137, 248, 251, etc): Video-ONLY or Audio-ONLY
  - Require FFmpeg to merge video + audio
  
**Your current downloads use Format 18 which SHOULD include audio** ✅

If you're downloading higher resolution formats (like 1080p DASH), they may be video-only and NEED FFmpeg to add audio.

---

## Solution: Install FFmpeg

### Method 1: Windows Package Manager (Easiest) ⭐
```powershell
winget install --id Gyan.FFmpeg
```

After installation, close and reopen your terminal/PowerShell.

### Method 2: Manual Download (Reliable)
1. Go to: https://ffmpeg.org/download.html#build-windows
2. Download "Git Full" build from Gyan's releases (223 MB)
3. Extract the ZIP to a simple path like: `C:\FFmpeg`
4. Add `C:\FFmpeg\bin` to your system PATH:
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Add: `C:\FFmpeg\bin`
   - Click OK, then OK again
5. Restart PowerShell/CMD
6. Verify: `ffmpeg -version` (should show version info)

### Method 3: Chocolatey (Admin Required)
```powershell
# Run PowerShell as Administrator
choco install ffmpeg -y
```

---

## After Installing FFmpeg

1. **Close** the currently running terminals
2. **Restart** your application:
   ```bash
   pnpm run dev
   ```
3. Now you can:
   - ✅ Download any video format with audio merged automatically
   - ✅ Download MP3 audio files
   - ✅ Download highest quality 1080p/4K with audio

---

## Verify FFmpeg is Working

Once installed, check these logs:
- Backend should show: `FFmpeg is properly installed` (instead of error)
- Downloads will automatically merge video + audio
- MP3 downloads will work

---

## Format Download Guide

### Video Formats Available:
- **Format 18** (360p): ✅ Has audio, ~3-5 MB per minute
- **Format 22** (720p): May need FFmpeg for audio merge, ~15-20 MB per minute
- **Format 137** (1080p DASH): ⚠️ Needs FFmpeg for audio, otherwise video-only
- **Format 248** (1080p VP9): ⚠️ Video-only without FFmpeg

### Audio Only:
- Best available MP3 quality: Need FFmpeg for conversion

---

## Troubleshooting

### "FFmpeg not found" Error
- FFmpeg is not installed or not in PATH
- Solution: Install using Method 1 or 2 above
- Verify: Run `ffmpeg -version` in terminal

### Video Downloaded Without Audio
- Format 18 should have audio - if missing:
  - Try again (sometimes server issues)
  - Use a different video
  - Check logs for errors
- Higher quality formats (1080p DASH) NEED FFmpeg

### "Conversion failed" for MP3
- FFmpeg must be installed
- Use Method 1 or 2 to install it
- Restart your application after installation

### Still Having Issues?
Check backend logs:
```bash
cd python-backend
.\venv\Scripts\python -m uvicorn main:app
# Look for "FFmpeg is properly installed" message
```

---

## Quick Reference

| Task | Requires | Status |
|------|----------|---------|
| Download Format 18 (360p) | Not needed | ✅ Working |
| Download 720p+ | Optional | ⚠️ Better with FFmpeg |
| Convert to MP3 | **Required** | ❌ Needs FFmpeg |
| Full audio on DASH formats | **Required** | ❌ Needs FFmpeg |

---

## One Command to Rule Them All

After FFmpeg is installed:
```bash
pnpm run dev
```

That's it! Everything works perfectly. 🚀

---

## Need Help?

Check these locations in the app:
1. **Frontend** (`http://localhost:3000`):
   - Shows FFmpeg requirement info
   - Clear download sections for Video/Audio
   
2. **Backend** (logs in terminal):
   - Shows FFmpeg status on startup
   - Shows download progress
   - Shows any encoding issues

Remember: **Your app works perfectly!** FFmpeg is only needed for:
- MP3 audio conversion
- Merging video + audio on DASH-only formats
- Best quality with guaranteedaudio

For most users, **Format 18 downloads are perfect** 👍
