import os
import re
import unicodedata
from pathlib import Path
from config import get_settings

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to be safe for filesystem with Unicode support"""
    # Normalize Unicode characters (NFD = decompose, then remove accents)
    filename = unicodedata.normalize('NFKD', filename)
    
    # Remove non-ASCII characters and convert to ASCII
    filename = filename.encode('ASCII', 'ignore').decode('ASCII')
    
    # Replace common Unicode characters before normalization
    replacements = {
        '"': '_',  # Smart quotes
        '"': '_',  # Smart quotes
        ''': '_',  # Apostrophe
        ''': '_',  # Apostrophe
        '–': '-',  # En dash
        '—': '-',  # Em dash
        '…': '.',  # Ellipsis
        '•': '_',  # Bullet
        '°': 'deg',  # Degree
    }
    
    for char, replacement in replacements.items():
        filename = filename.replace(char, replacement)
    
    # Remove invalid filesystem characters
    filename = re.sub(r'[<>:"/\\|?*\n\t\r]', '', filename)
    
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    
    # Remove multiple underscores
    filename = re.sub(r'_+', '_', filename)
    
    # Remove leading/trailing underscores
    filename = filename.strip('_')
    
    # Ensure filename is not empty
    if not filename:
        filename = 'download'
    
    # Limit length to 200 characters
    filename = filename[:200]
    
    return filename

def ensure_temp_dir() -> str:
    """Ensure temporary download directory exists"""
    settings = get_settings()
    temp_dir = settings.TEMP_DOWNLOAD_DIR
    Path(temp_dir).mkdir(parents=True, exist_ok=True)
    return temp_dir

def get_file_size_estimate(url: str, format_id: str) -> float:
    """
    Estimate file size from duration and bitrate
    Returns size in MB
    """
    try:
        # This is a placeholder - actual calculation happens in yt_dlp_service
        return 0.0
    except Exception:
        return 0.0

def cleanup_temp_files(max_age_hours: int = 24) -> None:
    """Clean up old temporary files"""
    settings = get_settings()
    temp_dir = settings.TEMP_DOWNLOAD_DIR
    
    if not os.path.exists(temp_dir):
        return
    
    import time
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    
    for filename in os.listdir(temp_dir):
        filepath = os.path.join(temp_dir, filename)
        if os.path.isfile(filepath):
            file_age = current_time - os.path.getmtime(filepath)
            if file_age > max_age_seconds:
                try:
                    os.remove(filepath)
                except Exception as e:
                    print(f"Error removing temp file {filepath}: {e}")

def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return ""

def format_duration(seconds: int) -> str:
    """Format duration in seconds to HH:MM:SS"""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"
