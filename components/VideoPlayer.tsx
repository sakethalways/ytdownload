'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { useDownloader } from '@/hooks/useDownloader';
import { useToast } from '@/hooks/use-toast';
import { DownloadProgress } from './DownloadProgress';
import { FormatTable } from './FormatTable';

function getApiBaseUrl(): string {
  // PRIORITY 1: Runtime detection (for mobile/network access like 192.168.0.5:3000 -> 192.168.0.5:8000)
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000`;
  }
  // PRIORITY 2: Env var (for production/build time)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // FALLBACK: localhost
  return 'http://localhost:8000';
}

interface VideoResult {
  video_id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  published_at: string;
  url: string;
}

interface VideoPlayerProps {
  video: VideoResult | null;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const { toast } = useToast();
  const { state, handleFetchFormats, handleDownload, cancelDownload, reset } = useDownloader();
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('http://localhost:8000');
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  // Set API URL dynamically on client mount
  useEffect(() => {
    setApiBaseUrl(getApiBaseUrl());
  }, []);

  // Fetch video details when video changes
  useEffect(() => {
    if (!video) return;

    // Reset formats and state when new video is selected
    reset();
    setSelectedFormat(null);

    const fetchDetails = async () => {
      setLoadingDetails(true);
      setDetailsError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/video/${video.video_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }

        const data = await response.json();
        if (data.success) {
          setVideoDetails(data);
        } else {
          setDetailsError(data.error || 'Failed to fetch details');
        }
      } catch (err) {
        setDetailsError(err instanceof Error ? err.message : 'Error loading video details');
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [video, apiBaseUrl, reset]);

  const handleFetchFromSearch = async () => {
    if (!video) return;

    try {
      await handleFetchFormats(video.url);
      setSelectedFormat(null);
      toast({
        title: 'Success',
        description: 'Formats fetched successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch formats';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-4 pb-4">
      <Card className="w-full max-w-2xl m-4 bg-white dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate pr-4">Video Player</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          {/* YouTube Video Player */}
          <div className="relative w-full pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.video_id}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            />
          </div>

          {/* Video Title & Channel */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold line-clamp-2">{video.title}</h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{video.channel}</p>
          </div>

          {/* Fetch Formats Button */}
          {state.formats.length === 0 && (
            <Button
              onClick={handleFetchFromSearch}
              disabled={state.loading}
              className="w-full text-sm sm:text-base h-10"
            >
              {state.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Formats...
                </>
              ) : (
                'Get Formats'
              )}
            </Button>
          )}

          {/* Video Details (shown after formats are fetched) */}
          {state.formats.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              {/* Details Loading */}
              {loadingDetails && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading details...
                </div>
              )}

              {/* Details Error */}
              {detailsError && (
                <Alert variant="destructive" className="text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{detailsError}</AlertDescription>
                </Alert>
              )}

              {/* Video Stats */}
              {videoDetails && !loadingDetails && (
                <div className="flex flex-wrap gap-2">
                  {videoDetails.duration && (
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      Duration: {formatDuration(videoDetails.duration)}
                    </Badge>
                  )}
                  {videoDetails.views && (
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      Views: {parseInt(videoDetails.views).toLocaleString()}
                    </Badge>
                  )}
                  {videoDetails.likes && (
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      Likes: {parseInt(videoDetails.likes).toLocaleString()}
                    </Badge>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                {video.description}
              </p>
            </div>
          )}

          {/* Format Selection */}
          {state.formats.length > 0 && (
            <>
              <FormatTable
                formats={state.formats}
                title="Available Formats"
                selectedFormatId={selectedFormat ?? undefined}
                onDownload={(formatId, outputFormat) => {
                  if (selectedFormat) {
                    handleDownload(video.url, formatId, outputFormat as 'mp4' | 'mp3');
                  }
                }}
                isDownloading={state.loading}
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={reset}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base h-10"
                >
                  Reset
                </Button>
              </div>
            </>
          )}

          {/* Download Progress */}
          {state.loading && (
            <div className="border rounded-lg p-3 sm:p-4 md:p-6 bg-secondary/50">
              <DownloadProgress
                isLoading={state.loading}
                progress={0}
                error={state.error}
              />
            </div>
          )}

          {/* Error Alert */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">{state.error}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}
