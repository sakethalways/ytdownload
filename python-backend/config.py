import logging
from functools import lru_cache
from dotenv import load_dotenv
import os
from pathlib import Path
import tempfile
import shutil

load_dotenv()

class Settings:
    """Application settings and configuration"""
    
    # FastAPI
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    API_TITLE: str = "YouTube Downloader API"
    API_VERSION: str = "1.0.0"
    
    # CORS - Allow Vercel frontend, Render backend, and development
    # For production, restrict to specific domains via environment variable
    def get_allowed_origins(self):
        """Get allowed origins, can be overridden by CORS_ALLOWED_ORIGINS env var"""
        env_origins = os.getenv("CORS_ALLOWED_ORIGINS")
        if env_origins:
            return [origin.strip() for origin in env_origins.split(",")]
        
        # Default for production and development
        origins = [
            # Vercel production frontend
            "https://youtube-downloader-app.vercel.app",
            # Render backend (itself)
            "https://ytdownload-1-gpug.onrender.com",
            # Localhost (desktop development)
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            # Local network (mobile development on same network)
            "http://192.168.0.7:3000",
            "http://192.168.0.7:8000",
            "http://192.168.1.7:3000",
            "http://192.168.1.7:8000",
            "http://192.168.0.5:3000",
            "http://192.168.0.5:8000",
        ]
        
        # Add dynamic local IP if available
        try:
            import socket
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            if local_ip and local_ip != "127.0.0.1":
                origins.append(f"http://{local_ip}:3000")
                origins.append(f"http://{local_ip}:8000")
        except:
            pass
        
        return origins
    
    @property
    def ALLOWED_ORIGINS(self):
        """Dynamic allowed origins property"""
        return self.get_allowed_origins()
    
    # Rate limiting
    RATE_LIMIT_FETCH = "30/10m"  # 30 requests per 10 minutes
    RATE_LIMIT_DOWNLOAD = "5/10m"  # 5 requests per 10 minutes
    
    # Timeouts
    REQUEST_TIMEOUT = 30
    DOWNLOAD_TIMEOUT = 3600  # 1 hour
    
    # File handling - Use OS-appropriate temp directory
    TEMP_DOWNLOAD_DIR = os.path.join(tempfile.gettempdir(), "youtube_downloads")
    MAX_FILE_SIZE_MB = 5000  # 5GB max
    
    # yt-dlp options
    YDL_SOCKET_TIMEOUT = 30
    
    def __init__(self):
        """Initialize settings and find FFmpeg"""
        # FFmpeg
        self.FFMPEG_QUALITY = "192"  # Default bitrate for MP3
        
        # Try multiple known FFmpeg locations
        ffmpeg_candidates = [
            r"C:\Users\SAKETH\.vscode\extensions\video-binaries\ffmpeg.exe",
            r"C:\Program Files\BlueStacks_nxt\ffmpeg.exe",
            "ffmpeg",  # Fallback to PATH
        ]
        
        self.FFMPEG_PATH = None
        self.FFPROBE_PATH = None
        
        # Find ffmpeg
        for candidate in ffmpeg_candidates:
            try:
                # Try direct path first
                if os.path.exists(candidate):
                    self.FFMPEG_PATH = candidate
                    break
                # Try using shutil.which for PATH
                elif shutil.which(candidate):
                    self.FFMPEG_PATH = candidate
                    break
            except Exception:
                continue
        
        # Find ffprobe
        if self.FFMPEG_PATH:
            if os.path.exists(self.FFMPEG_PATH):
                ffprobe_candidate = self.FFMPEG_PATH.replace('ffmpeg.exe', 'ffprobe.exe')
                if os.path.exists(ffprobe_candidate):
                    self.FFPROBE_PATH = ffprobe_candidate

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO if not get_settings().DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
