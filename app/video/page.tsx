'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useDownloader } from '@/hooks/useDownloader';
import { useToast } from '@/hooks/use-toast';
import { DownloadProgress } from '@/components/DownloadProgress';
import { FormatTable } from '@/components/FormatTable';
import { DownloadModal } from '@/components/DownloadModal';

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

export default function VideoDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { state, downloadAction, handleFetchFormats, handleDownload, cancelDownload, reset } = useDownloader();
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('http://localhost:8000');

  const [video, setVideo] = useState<VideoResult | null>(null);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  // Set API URL dynamically on client mount
  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    console.log('🔍 VIDEO PAGE DEBUG: getApiBaseUrl() returned:', apiUrl);
    console.log('🔍 VIDEO PAGE DEBUG: window.location.hostname:', window.location.hostname);
    setApiBaseUrl(apiUrl);
  }, []);

  // Parse video from URL params
  useEffect(() => {
    const videoData = searchParams.get('data');
    console.log('🔍 VIDEO PAGE: Raw video data from URL:', videoData);
    if (videoData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(videoData));
        console.log('🔍 VIDEO PAGE: Parsed video object:', parsed);
        console.log('🔍 VIDEO PAGE: Video ID extracted:', parsed.video_id);
        setVideo(parsed);
      } catch (err) {
        console.error('Failed to parse video data:', err);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  // Fetch video details when video changes
  useEffect(() => {
    if (!video) return;

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
  }, [video, reset, apiBaseUrl]);

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

  const handleDownloadClick = useCallback(
    async (formatId: string, outputFormat: 'mp4' | 'mp3') => {
      if (!video) return;

      try {
        setSelectedFormat(formatId);
        await handleDownload(video.url, formatId, outputFormat);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Download failed';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [video, handleDownload, toast]
  );

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

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/?tab=search')}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Search</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Main Card with Responsive Grid */}
        <Card className="p-3 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Video Player (2/3 on desktop, full on mobile) */}
            <div className="md:col-span-2 space-y-4">
              {/* YouTube Video Player */}
              <div className="relative w-full pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.video_id}?modestbranding=1&rel=0`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0"
                />
              </div>

              {/* Video Title & Channel - Visible on All Screens */}
              <div className="md:hidden">
                <h1 className="text-xl sm:text-2xl font-bold mb-2">{video.title}</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{video.channel}</p>
              </div>
            </div>

            {/* Right Column - Details and Formats (1/3 on desktop, full on mobile) */}
            <div className="md:col-span-1 space-y-4">
              {/* Video Title & Channel - Desktop Only */}
              <div className="hidden md:block">
                <h1 className="text-xl lg:text-2xl font-bold mb-2">{video.title}</h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{video.channel}</p>
              </div>

              {/* Get Formats Button */}
              {state.formats.length === 0 && (
                <Button
                  onClick={handleFetchFromSearch}
                  disabled={state.loading}
                  className="w-full text-sm h-10"
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    'Get Formats'
                  )}
                </Button>
              )}

              {/* Fetch Loading Animation */}
              {state.loading && state.formats.length === 0 && (
                <div className="border rounded-lg p-4 bg-secondary/50 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-center text-xs text-muted-foreground">
                    Fetching formats...
                  </p>
                </div>
              )}

              {/* Video Details (shown after formats are fetched) */}
              {state.formats.length > 0 && (
                <div className="space-y-4 border-t md:border-t-0 md:border-l md:pl-4 pt-4 md:pt-0">
                  {/* Details Loading */}
                  {loadingDetails && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading details...
                    </div>
                  )}

                  {/* Details Error */}
                  {detailsError && (
                    <Alert variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription className="text-xs">{detailsError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Video Stats */}
                  {videoDetails && !loadingDetails && (
                    <div className="flex flex-col gap-2">
                      {videoDetails.duration && (
                        <Badge variant="secondary" className="text-xs justify-start">
                          Duration: {formatDuration(videoDetails.duration)}
                        </Badge>
                      )}
                      {videoDetails.views && (
                        <Badge variant="secondary" className="text-xs justify-start">
                          Views: {parseInt(videoDetails.views).toLocaleString()}
                        </Badge>
                      )}
                      {videoDetails.likes && (
                        <Badge variant="secondary" className="text-xs justify-start">
                          Likes: {parseInt(videoDetails.likes).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {video.description && (
                    <div className="hidden md:block">
                      <h3 className="font-semibold text-xs mb-2">Description</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-4">
                        {video.description}
                      </p>
                    </div>
                  )}

                  {/* Reset Button on Mobile */}
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="w-full text-xs h-9 md:hidden"
                  >
                    Clear Formats
                  </Button>
                </div>
              )}

              {/* Error Alert */}
              {state.error && (
                <Alert variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{state.error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Full Width - Format Table (shown after formats are fetched) */}
          {state.formats.length > 0 && (
            <div className="mt-6 border-t pt-6 space-y-4">
              <FormatTable
                formats={state.formats}
                title="Available Formats"
                selectedFormatId={selectedFormat ?? undefined}
                onDownload={handleDownloadClick}
                isDownloading={downloadAction.loading}
              />

              {/* Reset Button on Desktop */}
              <Button
                onClick={reset}
                variant="outline"
                className="w-full hidden md:flex"
              >
                Clear Formats
              </Button>
            </div>
          )}
        </Card>

        {/* Download Modal */}
        <DownloadModal
          isOpen={downloadAction.loading}
          isLoading={downloadAction.loading}
          progress={downloadAction.progress}
          error={downloadAction.error ?? null}
          onCancel={cancelDownload}
          formatInfo={downloadAction.formatInfo}
        />
      </div>
    </div>
  );
}
