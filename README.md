# YouTube Downloader - Full-Stack Application

A full-stack web application for downloading YouTube videos as MP4 or extracting audio as MP3. Built with **Next.js 16 (React)** frontend and **Python FastAPI** backend.

**⚠️ EDUCATIONAL USE ONLY**: This tool is designed for personal and educational use only. Users are responsible for complying with YouTube's Terms of Service and applicable copyright laws.

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- FFmpeg (required for audio conversion)

### Installation

**1. Install FFmpeg**

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
choco install ffmpeg
```

**2. Clone and setup (from project root)**

```bash
# Install frontend dependencies
npm install

# Setup backend
cd python-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Running Locally

**Terminal 1: Start Frontend**
```bash
npm run dev
```
Frontend runs on: `http://localhost:3000`

**Terminal 2: Start Backend**
```bash
cd python-backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
Backend runs on: `http://localhost:8000`

**Access the app**: Open http://localhost:3000 in your browser

## Project Structure

```
youtube-downloader/
├── app/
│   ├── page.tsx                 # Main page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── YouTubeDownloader.tsx   # Main component
│   ├── FormatTable.tsx         # Formats display
│   ├── DownloadProgress.tsx    # Progress indicator
│   ├── ToSWarning.tsx          # Legal warnings
│   └── ui/                     # shadcn/ui components
├── hooks/
│   └── useDownloader.ts        # Download logic hook
├── lib/
│   └── api-client.ts           # API communication
├── python-backend/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── schemas.py              # Data models
│   ├── utils.py                # Utilities
│   ├── requirements.txt        # Python dependencies
│   ├── services/
│   │   ├── yt_dlp_service.py   # YouTube format fetching
│   │   └── converter_service.py # FFmpeg integration
│   └── middleware/
│       └── rate_limiting.py    # Rate limiter
├── .env.local                  # Frontend config (local dev)
├── .env.example                # Example env variables
└── README.md                   # This file
```

## Features

### Frontend
- ✅ Clean, modern UI with Tailwind CSS
- ✅ Real-time format fetching and display
- ✅ Support for MP4 video and MP3 audio downloads
- ✅ Download progress tracking
- ✅ Error handling and user feedback
- ✅ Prominent ToS and legal warnings
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode support

### Backend
- ✅ FastAPI with async processing
- ✅ yt-dlp integration for format fetching
- ✅ FFmpeg integration for audio conversion
- ✅ Comprehensive error handling
- ✅ Rate limiting (30 req/10min for fetch, 5 req/10min for download)
- ✅ Streaming downloads (no memory issues)
- ✅ Automatic temporary file cleanup
- ✅ CORS support for frontend communication

### Supported Features
- All video resolutions (144p to 4K/8K)
- Multiple audio bitrates (128kbps to 320kbps)
- Combined video+audio formats
- Audio-only format extraction
- Age-restricted video detection
- Live stream detection
- DASH and progressive formats
- Automatic codec detection and display

## API Endpoints

### Health Check
```bash
GET /health
```

### Fetch Available Formats
```bash
POST /api/fetch-formats
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language": "en"
}
```

### Download Format
```bash
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "format_id": "22",
  "output_format": "mp4"
}
```

See `/python-backend/README.md` for detailed API documentation.

## Configuration

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update to your deployed backend URL.

### Backend (.env)
```
DEBUG=False
API_PORT=8000
```

## Environment Variables

### Frontend (NEXT_PUBLIC_API_URL)
- **Local**: `http://localhost:8000`
- **Production**: Your deployed backend URL (e.g., `https://api.example.com`)

### Backend (python-backend/.env)
- **DEBUG**: Set to `True` for development, `False` for production
- **API_PORT**: Port where FastAPI runs (default: 8000)

## Deployment

### Frontend (Next.js)
Deploy to Vercel with one click:
```bash
npm run build
# Deploy to Vercel or any Next.js hosting
```

### Backend (Python/FastAPI)

**Option 1: Fly.io**
```bash
cd python-backend
fly launch
fly deploy
```

**Option 2: Railway.app**
- Connect GitHub repo
- Deploy from dashboard
- Set start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

**Option 3: Render.com**
- Create new Web Service
- Connect GitHub repo
- Set start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Important: Public Deployment Warnings

⚠️ **Do NOT deploy this to a public URL without understanding the legal implications:**

1. **YouTube ToS**: Downloading content may violate YouTube's Terms of Service
2. **Copyright Issues**: Downloading copyrighted content without permission is illegal
3. **Legal Liability**: You assume liability for how others use your deployment
4. **Regional Restrictions**: Some content is geographically restricted
5. **Rate Limiting**: Implement stronger rate limiting for public access
6. **Monitoring**: Monitor for abuse and potential violations

**Recommendation**: Use for local development and private deployments only.

## Troubleshooting

### Backend issues
- **"FFmpeg not found"**: Install FFmpeg (see Prerequisites)
- **"Video not found"**: URL might be invalid, private, or deleted
- **"Rate limited"**: Wait 10 minutes or use different IP
- **"Age-restricted"**: Some videos require YouTube account verification

### Frontend issues
- **"Cannot reach backend"**: Ensure backend is running on localhost:8000
- **"CORS errors"**: Check NEXT_PUBLIC_API_URL is correct
- **"Download fails"**: Check network connection and disk space

### General
- **Logs**: Check browser console (F12) and terminal output
- **Clear cache**: `npm run build && npm run dev`
- **Reset**: Delete `python-backend/venv` and reinstall

## Performance

- Format fetching: 2-5 seconds
- MP4 download: Limited by YouTube (typically 1-2 MB/s)
- MP3 conversion: 10-30x faster than realtime
- Memory usage: Minimal (streaming downloads)
- Concurrent requests: Limited by rate limiting

## Security

- **Input validation**: All URLs and parameters validated
- **Rate limiting**: Per-IP rate limiting prevents abuse
- **CORS**: Restricted to configured origins
- **File cleanup**: Temporary files deleted after 5 minutes
- **Sanitization**: Filenames sanitized to prevent injection
- **No storage**: User data not stored (stateless)

## Legal & Ethical

### Allowed Uses
✅ Download videos you own or created  
✅ Download videos with explicit permission from creator  
✅ Download public domain content  
✅ Educational research and analysis  
✅ Personal archival of your own content  

### Prohibited Uses
❌ Download copyrighted videos without permission  
❌ Circumvent YouTube's terms of service  
❌ Commercial use without licensing  
❌ Remove/alter video metadata or attribution  
❌ Distribute downloaded copyrighted content  

### Disclaimer
This application is provided "as-is" for educational purposes. Users are solely responsible for their use and must comply with YouTube's Terms of Service and all applicable laws. The developers assume no liability for misuse, copyright infringement, or violations of YouTube's policies.

## Development

### Frontend Stack
- Next.js 16 with React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide Icons

### Backend Stack
- FastAPI (Python)
- yt-dlp (YouTube downloading)
- FFmpeg (audio conversion)
- Pydantic (validation)
- Uvicorn (ASGI server)

### Adding Features
1. Frontend changes → restart `npm run dev`
2. Backend changes → restart `uvicorn main:app --reload`
3. Database → add migration in `python-backend/migrations/`
4. API → update schemas in `schemas.py`

## Testing

### Manual Testing URLs
- Regular video: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Age-restricted: Test with an age-restricted music video
- Long video: Try a documentary (>1 hour)
- Multiple audio tracks: Look for videos with translations

### Test Cases
- ✅ Valid URL → Formats display correctly
- ✅ Invalid URL → Error message shown
- ✅ MP4 download → File saves successfully
- ✅ MP3 download → Audio converts and saves
- ✅ Rate limit → 429 response after limits exceeded
- ✅ Network error → Graceful error handling

## Performance Optimization

- Formats cached during session
- Downloads streamed to prevent memory issues
- Async API calls prevent UI blocking
- Lazy loading of components
- Image optimization (if any)

## Future Enhancements

- [ ] Playlist support
- [ ] Batch downloads
- [ ] Video quality presets
- [ ] Subtitle downloading
- [ ] Thumbnail extraction
- [ ] Custom video trimming
- [ ] WebSocket live updates
- [ ] Download queue system
- [ ] Local download history
- [ ] Video search integration

## Contributing

Issues and improvements are welcome:

1. Test the application locally
2. Document any bugs with reproduction steps
3. Suggest features with use cases
4. Submit pull requests with detailed descriptions

## Support

If you encounter issues:

1. Check this README's Troubleshooting section
2. Review backend logs in terminal
3. Check browser console (F12)
4. Verify FFmpeg is installed: `ffmpeg -version`
5. Ensure backend is running: `http://localhost:8000/health`

## License

This project is provided for educational purposes. Use responsibly and legally.

---

**Status**: Fully functional  
**Last Updated**: 2024  
**Python Version**: 3.8+  
**Node Version**: 18+  
**FFmpeg**: Required
