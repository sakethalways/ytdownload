# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Backend Server Not Running" Error

**Symptom:** You see an alert saying "The API server at http://localhost:8000 is not responding"

**Solution:**
Open a new terminal and run the backend:

```bash
cd python-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The backend should start on `http://localhost:8000`. You should see:
```
INFO:     Started server process [XXXXX]
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### 2. "Failed to fetch" Error in Console

**Symptom:** You see "Failed to fetch" in the browser console

**Causes & Solutions:**
- **Backend not running:** See solution #1 above
- **Wrong API URL:** Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- **CORS issues:** The backend has CORS enabled by default for `http://localhost:3000`
- **Port conflict:** If port 8000 is in use, change it:
  ```bash
  python -m uvicorn main:app --reload --port 8001
  # Then update .env.local to NEXT_PUBLIC_API_URL=http://localhost:8001
  ```

### 3. FFmpeg Not Found

**Symptom:** Backend starts but downloads fail with "FFmpeg not found" error

**Solution:**
Install FFmpeg on your system:

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
```bash
choco install ffmpeg
# Or download from https://ffmpeg.org/download.html
```

Verify installation:
```bash
ffmpeg -version
```

### 4. "No module named 'yt_dlp'" Error

**Symptom:** Backend fails to start with import error

**Solution:**
Make sure dependencies are installed:

```bash
cd python-backend
source venv/bin/activate
pip install -r requirements.txt
```

List installed packages to verify:
```bash
pip list
```

Should see: `yt-dlp`, `fastapi`, `uvicorn`, `pydantic`

### 5. Video Download Hangs or Times Out

**Symptom:** Download seems to be stuck, no progress for a long time

**Solutions:**
- **Slow internet:** Large videos can take time. Check browser console for errors.
- **Age-restricted video:** Certain videos may not be downloadable
- **Live stream:** Live streams have limited support and may not download
- **Video blocked in region:** Some videos have geographic restrictions

**Check backend logs:**
Look at the terminal where FastAPI is running for error messages.

### 6. "Invalid URL" Error

**Symptom:** You get "Invalid URL" error even with a valid YouTube URL

**Solution:**
Make sure the URL is in one of these formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**Example valid URLs:**
- ✅ `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- ✅ `https://youtu.be/dQw4w9WgXcQ`
- ❌ `https://www.youtube.com/` (no video ID)
- ❌ `youtube.com/watch?v=dQw4w9WgXcQ` (missing https://)

### 7. Downloaded File is Corrupted

**Symptom:** Downloaded MP4 or MP3 won't play

**Solutions:**
- **Incomplete download:** Make sure download finished completely (100% progress)
- **FFmpeg issue:** Verify FFmpeg is working:
  ```bash
  ffmpeg -codecs | grep mp3
  ffmpeg -codecs | grep h264
  ```
- **Browser cache:** Clear browser cache and try again
- **Large file:** Very large videos may have issues; try a smaller video first

### 8. Rate Limit Error

**Symptom:** "Rate limit exceeded" error after multiple downloads

**Current limits:**
- Fetch formats: 30 requests per 10 minutes per IP
- Download: 5 requests per 10 minutes per IP

**Solution:**
Wait 10 minutes before making more requests, or:
- Change your IP (restart router, use VPN)
- Adjust rate limits in `python-backend/middleware/rate_limiting.py`

### 9. Port Already in Use

**Symptom:** "Address already in use" when starting backend

**Solution:**
Find what's using the port and either kill it or use a different port:

**On macOS/Linux:**
```bash
lsof -i :8000
kill -9 <PID>
```

**On Windows:**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Or use a different port:**
```bash
python -m uvicorn main:app --reload --port 8001
```

### 10. API Response 422 Error (Validation Error)

**Symptom:** Backend returns 422 error

**Solution:**
This means the request data format is wrong. Check:
- URL format is correct
- Sending JSON in request body
- Content-Type header is `application/json`

### 11. Age-Restricted Videos Not Working

**Symptom:** Can't fetch formats for age-restricted videos

**Note:** YouTube's age restriction is detected by yt-dlp. These videos have limited download options. The app will show a warning: "Age Restricted"

### 12. Can't Download Audio (MP3)

**Symptom:** MP3 download button doesn't work or fails

**Solutions:**
- Verify FFmpeg is installed (see #3)
- Check backend logs for FFmpeg errors
- Try downloading video (MP4) first to test basic functionality
- Some videos may not have audio available

### 13. Frontend Running But Can't Fetch Formats

**Symptom:** Frontend works but "Fetch Formats" button doesn't do anything

**Debug steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for error messages starting with `[v0]`
4. Go to Network tab and reload
5. Click "Fetch Formats"
6. Look for requests to `http://localhost:8000`
7. Check response status and data

### 14. "Temporary File Directory Not Found" Error

**Symptom:** Backend error about temp directory

**Solution:**
Backend will auto-create temp directory. If it doesn't:
```bash
mkdir -p python-backend/temp
chmod 755 python-backend/temp
```

## Getting More Help

**Check logs:**
1. **Frontend:** Browser Console (F12)
2. **Backend:** Terminal where FastAPI is running

**Look in these files:**
- `README.md` - Project overview
- `SETUP.md` - Detailed setup
- `ARCHITECTURE.md` - How everything works
- `python-backend/README.md` - Backend API docs

**Common patterns:**
- All API calls log to console with `[v0]` prefix
- Backend logs appear in terminal where uvicorn runs
- Errors are descriptive and suggest solutions

## Still Having Issues?

1. Make sure both frontend AND backend are running
2. Verify .env.local has correct API_URL
3. Check FFmpeg is installed
4. Review logs in browser console and backend terminal
5. Try with a different YouTube video
6. Restart both frontend and backend completely
