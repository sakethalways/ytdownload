import asyncio
import logging
import os
import subprocess
import shutil
import sys
from pathlib import Path
from typing import Tuple
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/..')
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class ConverterService:
    """Service for audio/video conversion using FFmpeg"""
    
    @staticmethod
    def _check_ffmpeg_installed() -> bool:
        """Check if ffmpeg is installed"""
        if settings.FFMPEG_PATH:
            return os.path.exists(settings.FFMPEG_PATH) or shutil.which(settings.FFMPEG_PATH) is not None
        return shutil.which('ffmpeg') is not None

    @staticmethod
    def _check_ffprobe_installed() -> bool:
        """Check if ffprobe is installed"""
        if settings.FFPROBE_PATH:
            return os.path.exists(settings.FFPROBE_PATH) or shutil.which(settings.FFPROBE_PATH) is not None
        return shutil.which('ffprobe') is not None

    @staticmethod
    async def validate_ffmpeg() -> Tuple[bool, str]:
        """
        Validate that FFmpeg is properly installed
        Returns: (is_valid: bool, message: str)
        """
        if not ConverterService._check_ffmpeg_installed():
            msg = "FFmpeg is not installed. Please install FFmpeg: https://ffmpeg.org/download.html"
            logger.error(msg)
            return False, msg
        
        if not ConverterService._check_ffprobe_installed():
            msg = "FFprobe is not installed. FFprobe comes with FFmpeg."
            logger.error(msg)
            return False, msg
        
        return True, "FFmpeg is properly installed"

    @staticmethod
    def _get_ffmpeg_cmd() -> str:
        """Get FFmpeg command path"""
        if settings.FFMPEG_PATH:
            return settings.FFMPEG_PATH
        return 'ffmpeg'
    
    @staticmethod
    def _get_ffprobe_cmd() -> str:
        """Get FFprobe command path"""
        if settings.FFPROBE_PATH:
            return settings.FFPROBE_PATH
        return 'ffprobe'

    @staticmethod
    async def convert_to_mp3(
        input_path: str,
        output_path: str,
        bitrate: str = "192k"
    ) -> Tuple[bool, str]:
        """
        Convert audio file to MP3 using FFmpeg
        Returns: (success: bool, message: str)
        """
        try:
            if not os.path.exists(input_path):
                return False, f"Input file not found: {input_path}"
            
            is_valid, msg = await ConverterService.validate_ffmpeg()
            if not is_valid:
                return False, msg
            
            logger.info(f"Converting {input_path} to MP3: {output_path}")
            
            # FFmpeg command to convert to MP3
            cmd = [
                ConverterService._get_ffmpeg_cmd(),
                '-i', input_path,
                '-q:a', '0',  # Highest quality
                '-map', 'a',  # Map audio stream
                '-b:a', bitrate,  # Bitrate
                '-y',  # Overwrite output file
                output_path
            ]
            
            loop = asyncio.get_event_loop()
            
            def run_ffmpeg():
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=settings.DOWNLOAD_TIMEOUT
                )
                return result.returncode, result.stderr
            
            returncode, stderr = await loop.run_in_executor(None, run_ffmpeg)
            
            if returncode != 0:
                logger.error(f"FFmpeg conversion failed: {stderr}")
                return False, f"Conversion failed: {stderr}"
            
            if not os.path.exists(output_path):
                return False, "Output file was not created"
            
            logger.info(f"Successfully converted to MP3: {output_path}")
            return True, "Conversion successful"
        
        except subprocess.TimeoutExpired:
            return False, "Conversion timeout"
        except Exception as e:
            logger.error(f"Error converting to MP3: {str(e)}")
            return False, f"Conversion error: {str(e)}"

    @staticmethod
    async def get_audio_duration(file_path: str) -> int:
        """
        Get audio duration in seconds using ffprobe
        Returns: duration in seconds (0 if error)
        """
        try:
            if not os.path.exists(file_path):
                return 0
            
            cmd = [
                ConverterService._get_ffprobe_cmd(),
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1:nokey=1',
                file_path
            ]
            
            loop = asyncio.get_event_loop()
            
            def run_ffprobe():
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                return result.stdout.strip()
            
            duration_str = await loop.run_in_executor(None, run_ffprobe)
            return int(float(duration_str))
        
        except Exception as e:
            logger.error(f"Error getting audio duration: {str(e)}")
            return 0

    @staticmethod
    async def merge_video_audio(
        video_path: str,
        audio_path: str,
        output_path: str
    ) -> Tuple[bool, str]:
        """
        Merge video and audio files using FFmpeg
        Returns: (success: bool, message: str)
        """
        try:
            if not os.path.exists(video_path):
                return False, f"Video file not found: {video_path}"
            if not os.path.exists(audio_path):
                return False, f"Audio file not found: {audio_path}"
            
            is_valid, msg = await ConverterService.validate_ffmpeg()
            if not is_valid:
                return False, msg
            
            logger.info(f"Merging {video_path} and {audio_path} to {output_path}")
            
            cmd = [
                ConverterService._get_ffmpeg_cmd(),
                '-i', video_path,
                '-i', audio_path,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-y',
                output_path
            ]
            
            loop = asyncio.get_event_loop()
            
            def run_ffmpeg():
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=settings.DOWNLOAD_TIMEOUT
                )
                return result.returncode, result.stderr
            
            returncode, stderr = await loop.run_in_executor(None, run_ffmpeg)
            
            if returncode != 0:
                logger.error(f"FFmpeg merge failed: {stderr}")
                return False, f"Merge failed: {stderr}"
            
            if not os.path.exists(output_path):
                return False, "Output file was not created"
            
            logger.info(f"Successfully merged: {output_path}")
            return True, "Merge successful"
        
        except subprocess.TimeoutExpired:
            return False, "Merge timeout"
        except Exception as e:
            logger.error(f"Error merging video and audio: {str(e)}")
            return False, f"Merge error: {str(e)}"
