import logging
import os
import asyncio
from typing import Optional
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from config import get_settings
from schemas import FetchFormatsRequest, FetchFormatsResponse, DownloadRequest, ErrorResponse, FormatInfo
from services import YtDlpService, ConverterService
from middleware.rate_limiting import rate_limiter
from utils import sanitize_filename, ensure_temp_dir, extract_video_id, cleanup_temp_files

logger = logging.getLogger(__name__)
settings = get_settings()

# Ensure temp directory exists
ensure_temp_dir()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app lifespan"""
    logger.info("YouTube Downloader API starting...")
    
    # Validate FFmpeg on startup
    ffmpeg_valid, ffmpeg_msg = await ConverterService.validate_ffmpeg()
    if not ffmpeg_valid:
        logger.warning(f"FFmpeg validation: {ffmpeg_msg}")
    
    yield
    
    logger.info("YouTube Downloader API shutting down...")
    cleanup_temp_files()

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="YouTube Video/Audio Downloader API - Educational Use Only",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    ffmpeg_valid, _ = await ConverterService.validate_ffmpeg()
    return {
        "status": "healthy",
        "version": settings.API_VERSION,
        "ffmpeg_available": ffmpeg_valid
    }

# Main API endpoints
@app.post("/api/fetch-formats", response_model=FetchFormatsResponse)
async def fetch_formats(request: Request, body: FetchFormatsRequest):
    """
    Fetch available formats for a YouTube video
    
    Returns all available video and audio formats with metadata
    """
    try:
        # Rate limiting disabled for development
        # is_allowed, rate_info = rate_limiter.is_allowed(
        #     request,
        #     "/api/fetch-formats",
        #     max_requests=30,
        #     window_minutes=10
        # )
        # 
        # if not is_allowed:
        #     raise HTTPException(
        #         status_code=429,
        #         detail={
        #             "error": "Rate limit exceeded",
        #             "retry_after_seconds": rate_info["retry_after_seconds"],
        #             "reset_time": rate_info["reset_time"]
        #         }
        #     )
        
        logger.info(f"Fetching formats for: {body.url}")
        
        # Fetch formats using yt-dlp
        success, data = await YtDlpService.fetch_formats(body.url)
        
        if not success:
            error_code = data.get("error_code", "UNKNOWN_ERROR")
            error_msg = data.get("error", "Failed to fetch formats")
            
            if "Private" in error_msg or "not available" in error_msg:
                raise HTTPException(status_code=404, detail={"error": error_msg, "error_code": "VIDEO_NOT_FOUND"})
            elif "age-restricted" in error_msg.lower():
                raise HTTPException(status_code=403, detail={"error": error_msg, "error_code": "AGE_RESTRICTED"})
            else:
                raise HTTPException(status_code=400, detail={"error": error_msg, "error_code": error_code})
        
        # Build response
        formats = [
            FormatInfo(
                format_id=f.format_id,
                format_name=f.format_name,
                ext=f.ext,
                height=f.height,
                width=f.width,
                fps=f.fps,
                vcodec=f.vcodec,
                acodec=f.acodec,
                audio_bitrate=f.audio_bitrate,
                video_bitrate=f.video_bitrate,
                estimated_size_mb=f.estimated_size_mb,
                is_dash=f.is_dash,
            )
            for f in data.get('formats', [])
        ]
        
        response = FetchFormatsResponse(
            success=True,
            video_id=data.get('video_id'),
            title=data.get('title'),
            duration=data.get('duration'),
            thumbnail=data.get('thumbnail'),
            formats=formats,
            age_restricted=data.get('age_restricted', False),
            is_live=data.get('is_live', False),
            download_url=data.get('download_url'),
        )
        
        logger.info(f"Successfully fetched {len(formats)} formats")
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in fetch_formats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": f"Server error: {str(e)}", "error_code": "SERVER_ERROR"}
        )

@app.post("/api/download")
async def download(request: Request, body: DownloadRequest, background_tasks: BackgroundTasks):
    """
    Download a specific format from YouTube video
    
    Supports MP4 for video and MP3 for audio extraction
    """
    try:
        # Rate limiting disabled for development
        # is_allowed, rate_info = rate_limiter.is_allowed(
        #     request,
        #     "/api/download",
        #     max_requests=5,
        #     window_minutes=10
        # )
        # 
        # if not is_allowed:
        #     raise HTTPException(
        #         status_code=429,
        #         detail={
        #             "error": "Rate limit exceeded for downloads",
        #             "retry_after_seconds": rate_info["retry_after_seconds"],
        #             "reset_time": rate_info["reset_time"]
        #         }
        #     )
        
        logger.info(f"Download request: {body.url} format={body.format_id} output={body.output_format}")
        
        # Fetch video info to get title
        success, data = await YtDlpService.fetch_formats(body.url)
        if not success:
            raise HTTPException(
                status_code=400,
                detail={"error": "Could not fetch video information", "error_code": "FETCH_ERROR"}
            )
        
        video_title = data.get('title', 'download')
        sanitized_title = sanitize_filename(video_title)
        
        # Determine output path
        temp_dir = settings.TEMP_DOWNLOAD_DIR
        
        if body.output_format == "mp4":
            output_filename = f"{sanitized_title}.mp4"
            output_path = os.path.join(temp_dir, output_filename)
            temp_path = output_path
            content_type = "video/mp4"
        else:  # mp3
            # Download audio first
            m4a_filename = f"{sanitized_title}_temp.m4a"
            m4a_path = os.path.join(temp_dir, m4a_filename)
            mp3_filename = f"{sanitized_title}.mp3"
            output_path = os.path.join(temp_dir, mp3_filename)
            temp_path = m4a_path
            content_type = "audio/mpeg"
        
        # Download the format
        logger.info(f"Downloading format {body.format_id} to {temp_path}")
        success, msg = await YtDlpService.download_format(body.url, body.format_id, temp_path)
        
        if not success:
            raise HTTPException(
                status_code=400,
                detail={"error": f"Download failed: {msg}", "error_code": "DOWNLOAD_ERROR"}
            )
        
        if not os.path.exists(temp_path):
            raise HTTPException(
                status_code=400,
                detail={"error": "Download file was not created", "error_code": "FILE_NOT_CREATED"}
            )
        
        # Convert to MP3 if needed
        if body.output_format == "mp3":
            logger.info(f"Converting to MP3: {output_path}")
            success, msg = await ConverterService.convert_to_mp3(temp_path, output_path)
            
            if not success:
                # Cleanup temp file
                try:
                    os.remove(temp_path)
                except:
                    pass
                raise HTTPException(
                    status_code=500,
                    detail={"error": f"Conversion failed: {msg}", "error_code": "CONVERSION_ERROR"}
                )
            
            # Cleanup temp M4A file
            try:
                os.remove(temp_path)
            except:
                pass
        
        # Check final file exists
        if not os.path.exists(output_path):
            raise HTTPException(
                status_code=500,
                detail={"error": "Output file was not created", "error_code": "OUTPUT_NOT_CREATED"}
            )
        
        file_size = os.path.getsize(output_path)
        logger.info(f"File ready for download: {output_path} ({file_size} bytes)")
        
        # Schedule cleanup after download
        background_tasks.add_task(cleanup_file_delayed, output_path, delay_seconds=300)
        
        # Prepare filename with proper encoding (RFC 5987)
        base_filename = os.path.basename(output_path)
        # Use UTF-8 encoded filename parameter
        from urllib.parse import quote
        filename_param = quote(base_filename.encode('utf-8'), safe='')
        content_disposition = f'attachment; filename*=UTF-8\'\'{filename_param}'
        
        # Return file
        return FileResponse(
            output_path,
            media_type=content_type,
            filename=base_filename,
            headers={"Content-Disposition": content_disposition}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in download: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": f"Server error: {str(e)}", "error_code": "SERVER_ERROR"}
        )

async def cleanup_file_delayed(filepath: str, delay_seconds: int = 300):
    """Clean up a file after delay"""
    try:
        await asyncio.sleep(delay_seconds)
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Cleaned up file: {filepath}")
    except Exception as e:
        logger.error(f"Error cleaning up file: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API documentation"""
    return {
        "name": "YouTube Downloader API",
        "version": settings.API_VERSION,
        "description": "Educational YouTube Video/Audio Downloader",
        "disclaimer": "For personal/educational use only. Downloading copyrighted content violates YouTube ToS.",
        "endpoints": {
            "health": "/health",
            "fetch_formats": "POST /api/fetch-formats",
            "download": "POST /api/download",
            "docs": "/docs"
        }
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail.get("error") if isinstance(exc.detail, dict) else str(exc.detail),
            "error_code": exc.detail.get("error_code") if isinstance(exc.detail, dict) else "HTTP_ERROR"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )
