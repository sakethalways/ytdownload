import asyncio
import logging
import sys
import os
from typing import List, Dict, Optional, Tuple
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/..')
import yt_dlp
from schemas import FormatInfo
from config import get_settings
from utils import sanitize_filename, extract_video_id, ensure_temp_dir

logger = logging.getLogger(__name__)
settings = get_settings()

class YtDlpService:
    """Service for interacting with yt-dlp"""
    
    @staticmethod
    def _get_ydl_opts(download: bool = False, format_id: str = None, output_path: str = None) -> dict:
        """Get yt-dlp options"""
        opts = {
            'quiet': False,
            'no_warnings': False,
            'socket_timeout': settings.YDL_SOCKET_TIMEOUT,
            'skip_unavailable_fragments': True,
            'ignore_errors': False,
            'no_color': True,
            'geo_bypass': True,
            'socket_timeout': 30,
            'abort_on_error': False,  # Don't abort on format merge errors
            'verbose': True,  # Enable verbose logging for debugging
        }
        
        if download:
            if format_id:
                opts['format'] = format_id
            if output_path:
                opts['outtmpl'] = output_path
                opts['quiet'] = False  # Don't suppress output, we need error messages
            opts['progress_hooks'] = []
            
            # Set FFmpeg location if available
            if settings.FFMPEG_PATH:
                opts['ffmpeg_location'] = settings.FFMPEG_PATH
                logger.info(f"Using FFmpeg from: {settings.FFMPEG_PATH}")
            else:
                logger.warning("FFmpeg not found - high quality formats may fail")
        
        return opts

    @staticmethod
    async def fetch_formats(url: str) -> Tuple[bool, Dict]:
        """
        Fetch all available formats for a YouTube video
        Returns: (success: bool, data: dict with formats or error info)
        """
        try:
            logger.info(f"Fetching formats for URL: {url}")
            
            opts = YtDlpService._get_ydl_opts(download=False)
            
            # Run yt-dlp in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            
            def extract_info():
                with yt_dlp.YoutubeDL(opts) as ydl:
                    return ydl.extract_info(url, download=False)
            
            info = await loop.run_in_executor(None, extract_info)
            
            if not info:
                return False, {"error": "Could not fetch video information"}
            
            # Check if age restricted
            age_restricted = info.get('age_limit', 0) >= 18
            
            # Check if live stream
            is_live = info.get('is_live', False)
            
            # Extract formats
            formats_list = info.get('formats', [])
            video_id = info.get('id', '')
            title = info.get('title', 'Unknown')
            duration = info.get('duration', 0)
            
            # Get best thumbnail - try multiple fields
            thumbnail = None
            
            # Try direct thumbnail field first
            if info.get('thumbnail'):
                thumbnail = info.get('thumbnail')
            # Try thumbnails array
            elif info.get('thumbnails'):
                thumbnails = info.get('thumbnails')
                if thumbnails:
                    # Get highest quality thumbnail
                    thumbnail = max(thumbnails, key=lambda x: (x.get('width', 0), x.get('height', 0))).get('url')
            
            # Process and filter formats
            processed_formats = YtDlpService._process_formats(formats_list)
            
            return True, {
                'video_id': video_id,
                'title': title,
                'duration': duration,
                'thumbnail': thumbnail,
                'formats': processed_formats,
                'age_restricted': age_restricted,
                'is_live': is_live,
                'download_url': url,
            }
        
        except yt_dlp.utils.DownloadError as e:
            logger.error(f"yt-dlp DownloadError: {str(e)}")
            return False, {"error": str(e), "error_code": "DOWNLOAD_ERROR"}
        
        except Exception as e:
            logger.error(f"Error fetching formats: {str(e)}")
            return False, {"error": f"Failed to fetch formats: {str(e)}", "error_code": "FETCH_ERROR"}

    @staticmethod
    def _process_formats(formats: List[Dict]) -> List[FormatInfo]:
        """Process raw yt-dlp formats into our FormatInfo objects"""
        processed = []
        seen_ids = set()
        
        for fmt in formats:
            format_id = str(fmt.get('format_id', ''))
            
            # Skip if already processed
            if format_id in seen_ids:
                continue
            
            # Skip formats without ext
            ext = fmt.get('ext', '')
            if not ext:
                continue
            
            # Skip audio-only formats without acodec
            if fmt.get('vcodec') == 'none' and not fmt.get('acodec'):
                continue
            
            height = fmt.get('height')
            width = fmt.get('width')
            fps = fmt.get('fps')
            vcodec = fmt.get('vcodec', 'unknown')
            acodec = fmt.get('acodec', 'unknown')
            filesize = fmt.get('filesize')
            bitrate = fmt.get('abr') or fmt.get('vbr')
            tbr = fmt.get('tbr')  # Total bitrate
            is_dash = fmt.get('format_note', '').lower() == 'dash video'
            
            # Estimate file size if not provided
            estimated_size_mb = 0.0
            if filesize:
                estimated_size_mb = filesize / (1024 * 1024)
            elif bitrate and fmt.get('duration'):
                # Rough estimate: (bitrate in kbps * duration in seconds) / 8 / 1024 / 1024
                estimated_size_mb = (bitrate * fmt.get('duration', 0)) / 8 / 1024 / 1024
            
            # Create format name
            format_parts = []
            if height:
                format_parts.append(f"{height}p")
            if vcodec and vcodec != 'none':
                format_parts.append(f"({vcodec})")
            if acodec and acodec != 'none':
                format_parts.append(f"Audio:{acodec}")
            if bitrate:
                format_parts.append(f"{bitrate}kbps")
            
            format_name = " ".join(format_parts) if format_parts else f"Format {format_id}"
            
            format_info = FormatInfo(
                format_id=format_id,
                format_name=format_name,
                ext=ext,
                height=height,
                width=width,
                fps=fps,
                vcodec=vcodec if vcodec != 'none' else None,
                acodec=acodec if acodec != 'none' else None,
                audio_bitrate=fmt.get('abr'),
                video_bitrate=fmt.get('vbr'),
                estimated_size_mb=estimated_size_mb if estimated_size_mb > 0 else None,
                is_dash=is_dash,
            )
            
            processed.append(format_info)
            seen_ids.add(format_id)
        
        # Sort by resolution (descending) then by bitrate (descending)
        processed.sort(
            key=lambda f: (
                -(f.height or 0),
                -(f.audio_bitrate or f.video_bitrate or 0),
            )
        )
        
        return processed

    @staticmethod
    async def download_format(url: str, format_id: str, output_path: str) -> Tuple[bool, str]:
        """
        Download a specific format
        Returns: (success: bool, message: str)
        """
        try:
            logger.info(f"Starting download: URL={url}, format={format_id}, output={output_path}")
            
            opts = YtDlpService._get_ydl_opts(
                download=True,
                format_id=format_id,
                output_path=output_path
            )
            
            loop = asyncio.get_event_loop()
            
            download_errors = []
            
            def download():
                try:
                    with yt_dlp.YoutubeDL(opts) as ydl:
                        logger.info(f"YoutubeDL starting download with format: {format_id}")
                        result = ydl.download([url])
                        logger.info(f"YoutubeDL download result: {result}")
                        return result
                except Exception as e:
                    logger.error(f"YoutubeDL error: {str(e)}")
                    download_errors.append(str(e))
                    raise
            
            result = await loop.run_in_executor(None, download)
            
            if result == 0:
                logger.info(f"Successfully downloaded format {format_id}")
                if os.path.exists(output_path):
                    file_size = os.path.getsize(output_path)
                    logger.info(f"Output file size: {file_size} bytes")
                    return True, "Download successful"
                else:
                    return False, "Download completed but output file not found"
            else:
                error_msg = download_errors[-1] if download_errors else f"Download failed with code {result}"
                logger.error(f"Download failed: {error_msg}")
                return False, error_msg
        
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error downloading format {format_id}: {error_msg}")
            return False, f"Download failed: {error_msg}"

    @staticmethod
    async def is_age_restricted(url: str) -> bool:
        """Check if video is age restricted"""
        try:
            success, data = await YtDlpService.fetch_formats(url)
            return data.get('age_restricted', False)
        except Exception:
            return False

    @staticmethod
    async def is_live_stream(url: str) -> bool:
        """Check if video is a live stream"""
        try:
            success, data = await YtDlpService.fetch_formats(url)
            return data.get('is_live', False)
        except Exception:
            return False

    @staticmethod
    def get_best_audio_format(formats: List[FormatInfo]) -> Optional[FormatInfo]:
        """Get best audio-only format from formats list"""
        audio_formats = [f for f in formats if f.acodec and not f.vcodec]
        if audio_formats:
            return max(audio_formats, key=lambda f: f.audio_bitrate or 0)
        return None

    @staticmethod
    def get_best_video_format(formats: List[FormatInfo]) -> Optional[FormatInfo]:
        """Get best combined video+audio format from formats list"""
        video_formats = [f for f in formats if f.vcodec and f.acodec]
        if video_formats:
            return max(video_formats, key=lambda f: (f.height or 0, f.fps or 0))
        return None
