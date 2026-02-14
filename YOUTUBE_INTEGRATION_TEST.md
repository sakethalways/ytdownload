# YouTube Downloader - YouTube Search API Integration Guide

## ✅ What's Been Implemented

### Backend (FastAPI)
- ✅ YouTube Search API integration via `google-api-python-client`
- ✅ New endpoints:
  - `POST /api/search` - Search for YouTube videos
  - `GET /api/video/{video_id}` - Get detailed video information
- ✅ Session service for YouTube API client initialization
- ✅ Full error handling and logging
- ✅ CORS enabled for frontend communication

### Frontend (Next.js/React)
- ✅ **Search Tab** - Search YouTube directly in the app
- ✅ **Link Tab** - Original link paste functionality (backward compatible)
- ✅ **Search Results** - Grid display of videos with:
  - Thumbnail preview
  - Title and channel name
  - Published date
  - Clickable cards
- ✅ **Video Player Modal** - Detailed view with:
  - Full video information
  - Duration, views, and likes
  - Video description
  - Download options (MP4/MP3)
- ✅ **Download Integration** - Use existing download logic with search results

### User Interface
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Tab navigation (Link | Search)
- ✅ Real-time search results
- ✅ Error handling and validation
- ✅ Loading states and spinners

## 📋 Setup Instructions

### Step 1: Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project called "YouTube Downloader"
3. Go to **APIs & Services** → **Library**
4. Search for "YouTube Data API v3"
5. Click **ENABLE**
6. Go to **Credentials** → **Create Credentials** → **API Key**
7. Copy your new API key

### Step 2: Configure Local Environment

Open `.env.local` in your project root and replace:
```
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
```

With your actual API key:
```
YOUTUBE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Install Dependencies

```bash
# Python backend
cd python-backend
pip install -r requirements.txt

# Or if using the existing installation:
python -m pip install google-api-python-client==2.108.0
```

### Step 4: Run the Application

```bash
# From project root
pnpm run dev
```

Both servers will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎮 How to Use

### YouTube Search Feature

#### Search for Videos
1. Open http://localhost:3000
2. Click the **Search** tab (🔍 icon)
3. Type your search query (e.g., "JavaScript tutorial", "cooking recipe")
4. Click **Search** or press Enter
5. Browse through the results

#### Select and View Video Details
1. Click on any video card
2. A modal will open showing:
   - Video thumbnail preview
   - Full title and channel name
   - Duration, view count, likes
   - Video description
3. Click **Fetch Download Formats** to get available quality options

#### Download the Video
1. From the video player modal:
   - Select a format from the dropdown
   - Click **Download MP4** for the full video
   - Click **Download MP3** to extract audio only
2. The file will download to your downloads folder
3. Filename will be the video title

### Link Paste Feature (Original)

1. Click the **Link** tab
2. Paste a YouTube URL
3. Click **Fetch Formats**
4. Select a format
5. Download as MP4 or MP3

## 📊 API Endpoints Documentation

### Search Videos
```
POST /api/search
Content-Type: application/json

Body:
{
  "query": "string",           // Search term (required)
  "max_results": 20,           // Results per page (optional, default: 20)
  "page_token": "string"       // Pagination token (optional)
}

Response:
{
  "success": true,
  "videos": [
    {
      "video_id": "dQw4w9WgXcQ",
      "title": "Video Title",
      "description": "Video description...",
      "thumbnail": "https://...",
      "channel": "Channel Name",
      "published_at": "2024-01-15T10:30:00Z",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  ],
  "next_page_token": "NEXT_PAGE_TOKEN",
  "prev_page_token": "PREV_PAGE_TOKEN",
  "total_results": 20
}
```

### Get Video Details
```
GET /api/video/{video_id}

Response:
{
  "success": true,
  "video_id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "description": "Full description...",
  "thumbnail": "https://...",
  "channel": "Channel Name",
  "published_at": "2024-01-15T10:30:00Z",
  "duration": 212,           // In seconds
  "views": "1234567",
  "likes": "54321",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### Fetch Formats (Existing)
```
POST /api/fetch-formats
Content-Type: application/json

Body:
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}

Response:
{
  "success": true,
  "video_id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "duration": 212,
  "thumbnail": "https://...",
  "formats": [...]
}
```

### Download (Existing)
```
POST /api/download
Content-Type: application/json

Body:
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format_id": "22",
  "output_format": "mp4"     // or "mp3"
}

Response: File download with proper headers
```

## 🧪 Test Cases

### Test Case 1: Search Functionality
```
1. Navigate to Search tab
2. Search for "cat videos"
3. Verify results appear with thumbnails
4. Expected: 20 results displayed within 2 seconds
```

### Test Case 2: Video Details
```
1. Click on first search result
2. Modal opens with video info
3. Verify all fields populated:
   - Title ✓
   - Channel ✓
   - Duration ✓
   - View count ✓
4. Expected: All data loads within 1 second
```

### Test Case 3: Download from Search
```
1. Click "Fetch Download Formats"
2. Select any format
3. Click "Download MP4"
4. Expected: Download starts, file appears in downloads folder
5. File name should be video title
```

### Test Case 4: MP3 Extraction
```
1. Select a video and format
2. Click "Download MP3"
3. Expected: Audio extracted and saved as .mp3
4. File can be played in any audio player
```

### Test Case 5: Direct Link Mode (Backward Compatibility)
```
1. Switch to Link tab
2. Paste YouTube URL
3. Click "Fetch Formats"
4. Download MP4 or MP3
5. Expected: Same behavior as before
```

### Test Case 6: Error Handling
```
1. Search for: "xyzabc123nonexistent"
2. Expected: "No videos found" message
3. Click "Fetch" on invalid link
4. Expected: "Invalid Link" error displayed
5. Expected: Error toast notification appears
```

### Test Case 7: Mobile Responsiveness
```
1. Open on mobile device (or use device emulation)
2. Search tab visible
3. Search input responsive
4. Results grid adapts to screen
5. Video modal readable
6. Download buttons clickable
```

### Test Case 8: API Rate Limiting
```
1. Perform 50+ searches rapidly
2. Expected: API still responds (quota: 10,000/day)
3. If quota exceeded: "Rate limit" error shown
4. System tells user to retry tomorrow
```

## 🔧 Troubleshooting

### Issue: "YouTube Search API not available"
**Cause**: API key not set
**Solution**: 
- Check `.env.local` has `YOUTUBE_API_KEY=YOUR_KEY`
- Restart dev server with `pnpm run dev`
- Check backend logs for confirmation

### Issue: Search returns no results
**Cause**: Search query too specific or API not initialized
**Solution**:
- Try simpler search terms
- Verify API key in Google Cloud Console
- Check backend health: `curl http://localhost:8000/health`

### Issue: Download fails from search modal
**Cause**: Video ID not properly extracted
**Solution**:
- Use Link tab as fallback
- Try different video
- Check browser console for errors (F12)

### Issue: Videos load slowly
**Cause**: Poor network connection or Google API slow
**Solution**:
- Retry the search
- Check internet connection
- Verify YouTube API status

### Issue: "Invalid API key" error
**Cause**: API key is wrong or API not enabled
**Solution**:
1. Go to Google Cloud Console
2. Verify YouTube Data API v3 is **ENABLED**
3. Regenerate API key
4. Update `.env.local`
5. Restart dev server

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## ⚡ Performance Notes

- Average search time: 0.5-2 seconds
- Video details fetch: <1 second
- Search results: 20 videos per page (more available via pagination)
- API quota: 10,000 units/day (1,000 searches or 5,000 video details lookups)

## 🔐 Security

- API key stored in `.env.local` (not committed to Git)
- All data transferred over HTTP (localhost) or HTTPS (production)
- No user data stored
- Rate limiting available on backend
- CORS configured for frontend only

## 📝 Files Modified/Created

### Backend
- `python-backend/services/youtube_search_service.py` - NEW
- `python-backend/schemas.py` - UPDATED (added SearchResponse, VideoDetailsResponse)
- `python-backend/main.py` - UPDATED (added /api/search, /api/video endpoints)
- `python-backend/requirements.txt` - UPDATED (added google-api-python-client)

### Frontend
- `components/YouTubeDownloader.tsx` - UPDATED (added tabs)
- `components/SearchResults.tsx` - NEW
- `components/VideoPlayer.tsx` - NEW
- `.env.local` - UPDATED (added YOUTUBE_API_KEY)

### Documentation
- `YOUTUBE_API_SETUP.md` - NEW (detailed setup guide)
- `YOUTUBE_INTEGRATION_TEST.md` - NEW (this file)

## 🚀 Next Steps

1. **Set up YouTube API key** (follow setup guide above)
2. **Test search functionality** locally
3. **Verify all test cases pass**
4. **Deploy to production** (Vercel + Render)
5. **Add YouTube API key to Render environment variables**

## 📞 Support

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Check backend logs (terminal where you ran `pnpm run dev`)
3. Review this guide
4. Check [YOUTUBE_API_SETUP.md](./YOUTUBE_API_SETUP.md)

---

**Status**: ✅ Ready to use with YouTube API key configured
**Version**: 2.0 (with YouTube Search)
**Last Updated**: 2026-02-13
