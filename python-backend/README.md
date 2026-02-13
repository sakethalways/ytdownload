# YouTube Downloader - Python FastAPI Backend

## Overview

This is the backend service for the YouTube Downloader application. It provides APIs for fetching available video formats and downloading videos/audio from YouTube.

**⚠️ IMPORTANT: Educational Use Only**

This tool is designed for educational purposes only. Users are responsible for ensuring they comply with YouTube's Terms of Service and applicable copyright laws. Downloading copyrighted content without permission is illegal.

## Prerequisites

### System Requirements
- Python 3.8 or higher
- FFmpeg (required for audio conversion)
- FFprobe (comes with FFmpeg)

### Install FFmpeg

**macOS (using Homebrew):**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**Windows:**
- Download from https://ffmpeg.org/download.html
- Or use: `choco install ffmpeg`

**Verify Installation:**
```bash
ffmpeg -version
ffprobe -version
```

## Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create or edit `.env` file:
```
DEBUG=False
API_PORT=8000
```

## Running the Server

### Development Mode
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints

### 1. Health Check
```
GET /health
```

Returns server health and FFmpeg availability status.

### 2. Fetch Formats
```
POST /api/fetch-formats
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "video_id": "VIDEO_ID",
  "title": "Video Title",
  "duration": 213,
  "formats": [
    {
      "format_id": "22",
      "format_name": "720p H.264 Video 128kbps Audio",
      "ext": "mp4",
      "height": 720,
      "width": 1280,
      "fps": 30,
      "vcodec": "h264",
      "acodec": "aac",
      "audio_bitrate": 128000,
      "video_bitrate": null,
      "estimated_size_mb": 120.5,
      "is_dash": false
    }
  ],
  "age_restricted": false,
  "is_live": false,
  "download_url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Error Response (429 - Rate Limited):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "error_code": "RATE_LIMITED",
  "retry_after_seconds": 600,
  "reset_time": "2024-02-12T15:30:00"
}
```

### 3. Download
```
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "format_id": "22",
  "output_format": "mp4"
}
```

**Response:** File download (streaming)

**For Audio (MP3):**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "format_id": "140",
  "output_format": "mp3"
}
```

## Rate Limiting

To prevent abuse:
- `/api/fetch-formats`: 30 requests per 10 minutes per IP
- `/api/download`: 5 requests per 10 minutes per IP

Rate limit information is returned in response headers and body.

## Error Handling

### Common Errors

| Status | Code | Meaning |
|--------|------|---------|
| 400 | INVALID_URL | URL format is invalid |
| 403 | AGE_RESTRICTED | Video requires age verification |
| 404 | VIDEO_NOT_FOUND | Video is private or deleted |
| 429 | RATE_LIMIT | Too many requests from your IP |
| 500 | SERVER_ERROR | Internal server error |

## Project Structure

```
python-backend/
├── main.py                 # FastAPI application
├── config.py              # Configuration and settings
├── schemas.py             # Pydantic models for validation
├── utils.py               # Utility functions
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── services/
│   ├── yt_dlp_service.py      # yt-dlp wrapper for format fetching
│   └── converter_service.py    # FFmpeg wrapper for conversion
└── middleware/
    └── rate_limiting.py       # Rate limiting implementation
```

## Supported Features

### Video Formats
- MP4 (H.264, VP9)
- WEBM
- Various resolutions from 144p to 4K/8K

### Audio Formats
- M4A (AAC audio)
- MP3 (converted from audio using FFmpeg)
- Various bitrates (128kbps, 192kbps, 256kbps, 320kbps)

### Special Cases
- Age-restricted videos (with appropriate flags)
- Live streams (may have limited quality options)
- Videos with multiple audio tracks
- DASH vs Progressive formats

## Deployment

### Local Development
```bash
# Terminal 1: Backend
cd python-backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend (separate)
cd ..
npm run dev
```

### Deployment Platforms

**Fly.io:**
```bash
fly launch
fly deploy
```

**Railway.app:**
- Connect GitHub repo
- Deploy from dashboard

**Render.com:**
- New → Web Service
- Connect GitHub repo
- Set start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Important Warnings for Public Deployment

⚠️ **Do not deploy this application to a public URL without understanding the legal implications:**

1. **YouTube Terms of Service**: Downloading videos may violate YouTube ToS
2. **Copyright**: Ensure users understand copyright compliance
3. **Regional Restrictions**: Some videos may be geographically restricted
4. **Rate Limiting**: Implement stronger rate limiting for public access
5. **Authentication**: Consider adding user authentication for accountability

## Troubleshooting

### FFmpeg Not Found
```bash
# Check if installed
which ffmpeg

# If not found, install it (see Prerequisites section)
```

### Video Not Found
- Check URL is correct
- Video may be private or deleted
- Check if region-restricted

### Timeout Errors
- Video may be very large
- Network connection issue
- YouTube may be rate limiting

### Conversion Failures
- Ensure FFmpeg is properly installed
- Check disk space
- Verify audio codec compatibility

## Performance Tips

1. **Caching**: Formats are fetched fresh each time (no caching)
2. **Streaming**: Large files are streamed to prevent memory issues
3. **Cleanup**: Temporary files are deleted after 5 minutes
4. **Async**: Operations are async for better concurrency

## Legal & Ethical Considerations

This tool is provided for **educational purposes only**. Users must:

1. ✅ Only download videos they own or have permission to download
2. ✅ Respect copyright and intellectual property rights
3. ✅ Comply with YouTube's Terms of Service
4. ✅ Comply with local laws regarding digital downloads
5. ❌ NOT download copyrighted content without permission
6. ❌ NOT redistribute this tool for illegal purposes
7. ❌ NOT use this for commercial purposes without consent

**The developers assume no liability for misuse.**

## Contributing

To extend this project:

1. Add support for other video platforms (Vimeo, etc.)
2. Implement better error recovery
3. Add webhook support for batch downloads
4. Implement database logging for analytics
5. Add playlist support

## Dependencies

- **yt-dlp**: Most reliable YouTube downloader (fork of youtube-dl)
- **FastAPI**: Modern async web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **FFmpeg**: Audio/video processing

## License

This project is provided as-is for educational purposes. Use responsibly and legally.

---

**Last Updated:** 2024
**Python Version:** 3.8+
**Status:** Working
