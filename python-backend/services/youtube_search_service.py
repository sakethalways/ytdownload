"""YouTube Search Service using Google API"""

import logging
import os
from typing import Optional, List, Dict, Tuple
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)


class YouTubeSearchService:
    """Service for searching YouTube videos using Google API"""
    
    _youtube_client = None
    
    @classmethod
    def initialize(cls, api_key: str):
        """Initialize YouTube API client"""
        try:
            cls._youtube_client = build('youtube', 'v3', developerKey=api_key)
            logger.info("YouTube API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize YouTube API: {str(e)}")
            cls._youtube_client = None
    
    @classmethod
    def is_initialized(cls) -> bool:
        """Check if YouTube API client is initialized"""
        return cls._youtube_client is not None
    
    @classmethod
    async def search_videos(
        cls, 
        query: str, 
        max_results: int = 20,
        page_token: Optional[str] = None
    ) -> Tuple[bool, Dict]:
        """
        Search for YouTube videos
        
        Args:
            query: Search query string
            max_results: Maximum results to return (default 20, max 50)
            page_token: Token for pagination
        
        Returns:
            Tuple of (success, data/error)
        """
        try:
            if not cls.is_initialized():
                return False, {"error": "YouTube API not initialized", "error_code": "API_NOT_INITIALIZED"}
            
            if not query or not query.strip():
                return False, {"error": "Search query cannot be empty", "error_code": "EMPTY_QUERY"}
            
            if max_results > 50:
                max_results = 50
            if max_results < 1:
                max_results = 1
            
            # Search request
            request = cls._youtube_client.search().list(
                part='snippet',
                q=query,
                type='video',
                maxResults=max_results,
                order='relevance',
                pageToken=page_token,
                fields='items(id/videoId,snippet(title,description,thumbnails/default/url,channelTitle,publishedAt)),nextPageToken,prevPageToken'
            )
            
            response = request.execute()
            
            # Extract video data
            videos = []
            for item in response.get('items', []):
                video_id = item['id']['videoId']
                snippet = item['snippet']
                
                videos.append({
                    'video_id': video_id,
                    'title': snippet['title'],
                    'description': snippet['description'],
                    'thumbnail': snippet['thumbnails']['default']['url'],
                    'channel': snippet['channelTitle'],
                    'published_at': snippet['publishedAt'],
                    'url': f'https://www.youtube.com/watch?v={video_id}'
                })
            
            return True, {
                'videos': videos,
                'next_page_token': response.get('nextPageToken'),
                'prev_page_token': response.get('prevPageToken'),
                'total_results': len(videos)
            }
        
        except HttpError as e:
            error_msg = f"YouTube API error: {e.resp.status} - {e.content.decode('utf-8')}"
            logger.error(error_msg)
            return False, {"error": error_msg, "error_code": "YOUTUBE_API_ERROR"}
        
        except Exception as e:
            error_msg = f"Search error: {str(e)}"
            logger.error(error_msg)
            return False, {"error": error_msg, "error_code": "SEARCH_ERROR"}
    
    @classmethod
    async def get_video_details(cls, video_id: str) -> Tuple[bool, Dict]:
        """
        Get detailed information about a video
        
        Args:
            video_id: YouTube video ID
        
        Returns:
            Tuple of (success, data/error)
        """
        try:
            if not cls.is_initialized():
                return False, {"error": "YouTube API not initialized", "error_code": "API_NOT_INITIALIZED"}
            
            if not video_id or not video_id.strip():
                return False, {"error": "Video ID cannot be empty", "error_code": "EMPTY_VIDEO_ID"}
            
            request = cls._youtube_client.videos().list(
                part='snippet,contentDetails,statistics',
                id=video_id,
                fields='items(id,snippet(title,description,thumbnails/high/url,channelTitle,publishedAt),contentDetails(duration),statistics(viewCount,likeCount))'
            )
            
            response = request.execute()
            
            if not response.get('items'):
                return False, {"error": "Video not found", "error_code": "VIDEO_NOT_FOUND"}
            
            item = response['items'][0]
            snippet = item['snippet']
            details = item.get('contentDetails', {})
            stats = item.get('statistics', {})
            
            # Parse ISO 8601 duration to seconds
            duration_str = details.get('duration', 'PT0S')
            duration_seconds = cls._parse_duration(duration_str)
            
            return True, {
                'video_id': video_id,
                'title': snippet['title'],
                'description': snippet['description'],
                'thumbnail': snippet['thumbnails']['high']['url'],
                'channel': snippet['channelTitle'],
                'published_at': snippet['publishedAt'],
                'duration': duration_seconds,
                'views': stats.get('viewCount', '0'),
                'likes': stats.get('likeCount', '0'),
                'url': f'https://www.youtube.com/watch?v={video_id}'
            }
        
        except HttpError as e:
            error_msg = f"YouTube API error: {e.resp.status}"
            logger.error(error_msg)
            return False, {"error": error_msg, "error_code": "YOUTUBE_API_ERROR"}
        
        except Exception as e:
            error_msg = f"Error fetching video details: {str(e)}"
            logger.error(error_msg)
            return False, {"error": error_msg, "error_code": "DETAILS_ERROR"}
    
    @staticmethod
    def _parse_duration(duration_str: str) -> int:
        """
        Parse ISO 8601 duration string to seconds
        Example: PT1H23M45S -> 5025
        """
        import re
        
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_str)
        
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 3600 + minutes * 60 + seconds
