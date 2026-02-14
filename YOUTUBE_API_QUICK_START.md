# YouTube API Integration - Quick Start

## 🚀 5-Minute Setup

### Step 1: Get YouTube API Key (2 minutes)
1. Go to https://console.cloud.google.com/
2. Create new project: "YouTube Downloader"
3. Search for "YouTube Data API v3" → Enable
4. Go to Credentials → Create API Key
5. Copy the key

### Step 2: Configure App (1 minute)
Open `.env.local` and update:
```
YOUTUBE_API_KEY=AIzaSy...YOUR_KEY...
```

### Step 3: Start App (1 minute)
```bash
pnpm run dev
```

### Step 4: Use It! (1 minute)
- Open http://localhost:3000
- Click **Search** tab
- Search for "JavaScript tutorial"
- Click video → Download!

---

## 🎯 What You Can Do Now

### Mode 1: Search YouTube Videos 🔍
- **Tab**: Search (icon: 🔍)
- **Steps**:
  1. Type search query
  2. Click Search
  3. Click video card
  4. View details + Download

### Mode 2: Paste Direct Links (Original) 🔗
- **Tab**: Link (icon: 🔗)  
- **Steps**:
  1. Paste YouTube URL
  2. Click Fetch Formats
  3. Select format
  4. Download MP4 or MP3

### Both Modes Support
- ✅ MP4 video download
- ✅ MP3 audio extraction
- ✅ Format selection (quality)
- ✅ Multiple quality options
- ✅ Mobile responsive
- ✅ Error handling

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Frontend (Next.js)                     │
│  ┌─────────────────────────────────────────┐   │
│  │ YouTube Downloader Component             │   │
│  │ ┌──────────────────────────────────────┐ │   │
│  │ │ Tabs: Link | Search                   │ │   │
│  │ │ ┌──────────────────┐                  │ │   │
│  │ │ │ Link Tab         │  Existing logic  │ │   │
│  │ │ ├──────────────────┤                  │ │   │
│  │ │ │ Search Tab       │  ← NEW!         │ │   │
│  │ │ │ • SearchResults  │                  │ │   │
│  │ │ │ • VideoPlayer    │                  │ │   │
│  │ │ └──────────────────┘                  │ │   │
│  │ └──────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────┘   │
└──────────────────┬────────────────────────────┘
                   │ HTTP/JSON
                   ↓
┌─────────────────────────────────────────────────┐
│         Backend (FastAPI Python)                │
│  ┌─────────────────────────────────────────┐   │
│  │ New YouTube Search Endpoints             │   │
│  │ ┌──────────────────────────────────────┐ │   │
│  │ │ POST /api/search                      │ │   │
│  │ │ • Google YouTube API integration     │ │   │
│  │ │ • Returns: Video list with metadata  │ │   │
│  │ ├──────────────────────────────────────┤ │   │
│  │ │ GET /api/video/{video_id}             │ │   │
│  │ │ • Get detailed video info             │ │   │
│  │ │ • Returns: Duration, views, likes    │ │   │
│  │ ├──────────────────────────────────────┤ │   │
│  │ │ Existing Endpoints (unchanged)       │ │   │
│  │ │ • POST /api/fetch-formats            │ │   │
│  │ │ • POST /api/download                 │ │   │
│  │ └──────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────┘   │
│                   │                             │
│                   ↓                             │
│  ┌──────────────────────────────────────────┐  │
│  │ YouTube API (Google)                      │  │
│  │ • Search videos                           │  │
│  │ • Get video metadata                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                   │
                   ↓
            yt-dlp (download)
```

---

## 📁 New Files Created

| File | Purpose |
|------|---------|
| `components/SearchResults.tsx` | Display search results grid |
| `components/VideoPlayer.tsx` | Video details & download modal |
| `python-backend/services/youtube_search_service.py` | YouTube API integration |
| `YOUTUBE_API_SETUP.md` | Detailed setup guide |
| `YOUTUBE_INTEGRATION_TEST.md` | Test cases & API docs |

## 📝 Files Modified

| File | Changes |
|------|---------|
| `components/YouTubeDownloader.tsx` | Added tabs: Link/Search |
| `python-backend/main.py` | Added /api/search & /api/video endpoints |
| `python-backend/schemas.py` | Added SearchResponse, VideoDetailsResponse |
| `python-backend/requirements.txt` | Added google-api-python-client |
| `.env.local` | Added YOUTUBE_API_KEY |

---

## ✨ Features Implemented

### Search UI
- ✅ Search input with real-time feedback
- ✅ Search results grid (responsive)
- ✅ Video cards with thumbnails
- ✅ Pagination support
- ✅ Error messages
- ✅ Loading states

### Video Details
- ✅ Full video modal
- ✅ Thumbnail preview
- ✅ Title, channel, date
- ✅ Duration, views, likes
- ✅ Video description
- ✅ Close button

### Download Integration
- ✅ Use existing download logic
- ✅ Format selection dropdown
- ✅ MP4 video download
- ✅ MP3 audio extraction
- ✅ Progress tracking
- ✅ Error handling

### Responsive Design
- ✅ Mobile: Single column, compact UI
- ✅ Tablet: Two column grid
- ✅ Desktop: Three column grid
- ✅ All elements touch-friendly
- ✅ Modal scrollable on mobile

---

## 🔄 Workflow Comparison

### Before (Link Mode Only)
```
User Input (URL)
    ↓
Fetch Formats
    ↓
Select Format
    ↓
Download
```

### Now (Search Mode)
```
Search Query
    ↓
YouTube Search API
    ↓
Display Results (20 videos)
    ↓
Click Video
    ↓
Fetch Video Details
    ↓
Show Modal
    ↓
Fetch Formats
    ↓
Select Format
    ↓
Download
```

**Both modes still available!** Link mode unchanged.

---

## 🧪 Quick Test

1. **Backend is running?**
   ```bash
   curl http://localhost:8000/health
   # Should return 200 OK with status info
   ```

2. **Frontend is running?**
   ```
   Open http://localhost:3000
   Should load without errors
   ```

3. **API key configured?**
   ```
   Edit .env.local
   YOUTUBE_API_KEY=YOUR_KEY
   ```

4. **Try search:**
   - Click Search tab
   - Type: "hello world"
   - Results should appear in <2 seconds

---

## 🎓 How It Works (Technical)

### Search Request Flow
```
User clicks Search
    ↓
Frontend sends: POST /api/search
with { query: "music videos", max_results: 20 }
    ↓
Backend receives request
    ↓
YouTubeSearchService uses google-api-python-client
to call Google YouTube Data API
    ↓
API returns: {'items': [...video data...]}
    ↓
Backend processes and returns to frontend
    ↓
Frontend displays 20 video cards
```

### Download Request Flow
```
User clicks "Download MP4"
    ↓
Frontend sends: POST /api/download
with { url: "youtube.com/watch?v=...", format_id: "22", output_format: "mp4" }
    ↓
Backend uses yt-dlp to download
    ↓
File generated
    ↓
Backend streams file to browser
    ↓
File downloads to user's download folder
```

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Search API not available" | Set YOUTUBE_API_KEY in .env.local |
| No results returned | Try simpler search terms (e.g., "cat") |
| Download fails | Use Link tab as fallback |
| Slow search | May be rate-limited; wait a minute |
| Video player won't load | Check internet connection |
| Backend not responding | Run `pnpm run dev` from project root |

---

## 📚 Documentation Files

| File | When to Use |
|------|-------------|
| **YOUTUBE_API_SETUP.md** | Detailed YouTube API key setup |
| **YOUTUBE_INTEGRATION_TEST.md** | API reference & test cases |
| **This file** | Quick start & overview |
| **README.md** | General project documentation |
| **QUICK_START.md** | App usage instructions |

---

## ✅ Checklist Before Using

- [ ] YouTube API key from Google Cloud Console
- [ ] Updated `.env.local` with API key
- [ ] Ran `pnpm run dev`
- [ ] No error messages in terminal
- [ ] Can access http://localhost:3000
- [ ] Backend returns 200 from /health
- [ ] Search tab appears in UI

---

## 🎉 You're All Set!

Your YouTube downloader now has:
1. ✅ YouTube search functionality
2. ✅ Video details display
3. ✅ Direct downloads from search
4. ✅ Original link-paste mode (unchanged)
5. ✅ Mobile responsive UI
6. ✅ Full error handling

**Next**: Set your YouTube API key and start searching!

---

**Questions?** Check YOUTUBE_API_SETUP.md for detailed setup information.
