from pydantic import BaseModel, Field, validator
from typing import List, Optional
import re

class FetchFormatsRequest(BaseModel):
    """Request model for fetching available formats"""
    url: str = Field(..., description="YouTube video URL")
    language: Optional[str] = Field(default="en", description="Preferred language")
    
    @validator('url')
    def validate_youtube_url(cls, v):
        """Validate that URL is a YouTube link"""
        youtube_patterns = [
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]+',
            r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/[\w-]+',
            r'(?:https?:\/\/)?(?:m\.)?youtube\.com\/watch\?v=[\w-]+',
        ]
        if not any(re.match(pattern, v) for pattern in youtube_patterns):
            raise ValueError("Invalid YouTube URL format")
        return v

class FormatInfo(BaseModel):
    """Model representing a single downloadable format"""
    format_id: str
    format_name: str
    ext: str
    height: Optional[float] = None
    width: Optional[float] = None
    fps: Optional[float] = None
    vcodec: Optional[str] = None
    acodec: Optional[str] = None
    audio_bitrate: Optional[float] = None
    video_bitrate: Optional[float] = None
    estimated_size_mb: Optional[float] = None
    is_dash: bool = False

class FetchFormatsResponse(BaseModel):
    """Response model for fetching formats"""
    success: bool
    video_id: Optional[str] = None
    title: Optional[str] = None
    duration: Optional[int] = None
    thumbnail: Optional[str] = None
    formats: List[FormatInfo] = []
    age_restricted: bool = False
    is_live: bool = False
    download_url: Optional[str] = None
    error: Optional[str] = None
    error_code: Optional[str] = None

class DownloadRequest(BaseModel):
    """Request model for downloading a format"""
    url: str = Field(..., description="YouTube video URL")
    format_id: str = Field(..., description="Format ID to download")
    output_format: str = Field(..., description="Output format: mp4 or mp3")
    
    @validator('url')
    def validate_url(cls, v):
        """Validate URL"""
        youtube_patterns = [
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]+',
            r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/[\w-]+',
            r'(?:https?:\/\/)?(?:m\.)?youtube\.com\/watch\?v=[\w-]+',
        ]
        if not any(re.match(pattern, v) for pattern in youtube_patterns):
            raise ValueError("Invalid YouTube URL format")
        return v
    
    @validator('format_id')
    def validate_format_id(cls, v):
        """Validate format ID is alphanumeric"""
        if not v.replace('+', '').isalnum():
            raise ValueError("Invalid format ID")
        return v
    
    @validator('output_format')
    def validate_output_format(cls, v):
        """Validate output format"""
        if v.lower() not in ['mp4', 'mp3']:
            raise ValueError("Output format must be mp4 or mp3")
        return v.lower()

class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error: str
    error_code: str
    details: Optional[dict] = None


class VideoSearchResult(BaseModel):
    """Single video result from search"""
    video_id: str
    title: str
    description: str
    thumbnail: str
    channel: str
    published_at: str
    url: str


class SearchRequest(BaseModel):
    """Request model for searching YouTube"""
    query: str = Field(..., description="Search query")
    max_results: int = Field(default=20, ge=1, le=50, description="Maximum results to return")
    page_token: Optional[str] = Field(default=None, description="Token for pagination")


class SearchResponse(BaseModel):
    """Response model for YouTube search"""
    success: bool
    videos: List[VideoSearchResult] = []
    next_page_token: Optional[str] = None
    prev_page_token: Optional[str] = None
    total_results: int = 0
    error: Optional[str] = None
    error_code: Optional[str] = None


class VideoDetailsResponse(BaseModel):
    """Response model for video details"""
    success: bool
    video_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    channel: Optional[str] = None
    published_at: Optional[str] = None
    duration: Optional[int] = None
    views: Optional[str] = None
    likes: Optional[str] = None
    url: Optional[str] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
