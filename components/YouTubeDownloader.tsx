'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDownloader } from '@/hooks/useDownloader';
import { useToast } from '@/hooks/use-toast';
import { ToSWarning } from './ToSWarning';
import { FormatTable } from './FormatTable';
import { DownloadProgress } from './DownloadProgress';
import { DownloadModal } from './DownloadModal';
import { SearchResults } from './SearchResults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Info, WifiOff, Link as LinkIcon, Search as SearchIcon } from 'lucide-react';

// Function to determine API URL dynamically
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

async function checkBackendHealth(apiUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function YouTubeDownloader() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { state, downloadAction, handleFetchFormats, handleDownload, cancelDownload, reset } = useDownloader();
  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('http://localhost:8000');
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'link' | 'search'>('link');

  // Set API URL dynamically on client mount and check backend health
  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    console.log('🔍 DEBUG: getApiBaseUrl() returned:', apiUrl);
    console.log('🔍 DEBUG: window.location:', window.location.hostname);
    setApiBaseUrl(apiUrl);

    const check = async () => {
      setCheckingBackend(true);
      console.log('🔍 DEBUG: checking backend at:', apiUrl);
      const isHealthy = await checkBackendHealth(apiUrl);
      console.log('🔍 DEBUG: backend healthy?', isHealthy);
      setBackendHealthy(isHealthy);
      setCheckingBackend(false);
    };
    check();

    // Set active tab from URL params
    const tab = searchParams.get('tab');
    if (tab === 'search') {
      setActiveTab('search');
    }
  }, [searchParams]);

  const isValidYouTubeUrl = (urlStr: string): boolean => {
    const patterns = [
      /youtube\.com\/watch\?v=[^&]+/,
      /youtu\.be\/[^?&]+/,
      /youtube\.com\/embed\/[^?&]+/,
    ];
    return patterns.some((pattern) => pattern.test(urlStr));
  };

  const handleFetch = async () => {
    setValidationError(null);
    
    if (!url.trim()) {
      const errorMsg = 'Please enter a YouTube URL';
      setValidationError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      const errorMsg = 'Please enter a valid YouTube video URL (youtube.com/watch?v=... or youtu.be/...)';
      setValidationError(errorMsg);
      toast({
        title: 'Invalid Link',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    try {
      await handleFetchFormats(url);
      setSelectedFormat(null);
      setValidationError(null);
      toast({
        title: 'Success',
        description: 'Formats fetched successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch formats';
      setValidationError(errorMessage);
      
      const isInvalidLink = 
        errorMessage.includes('Not a valid YouTube URL') ||
        errorMessage.includes('Invalid') ||
        errorMessage.includes('unavailable') ||
        errorMessage.includes('private') ||
        errorMessage.includes('deleted');
      
      toast({
        title: isInvalidLink ? 'Invalid Link' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadClick = async (formatId: string, outputFormat: 'mp4' | 'mp3') => {
    setSelectedFormat(formatId);
    try {
      const format = state.formats.find((f) => f.format_id === formatId);
      const formatInfo = format ? {
        quality: format.height ? `${format.height}p` : format.audio_bitrate ? `${Math.round(format.audio_bitrate / 1000)}kbps` : format.ext.toUpperCase(),
        codec: [format.vcodec, format.acodec].filter(Boolean).map(c => c?.split('.')[0].toUpperCase()).join(' + ') || 'Unknown',
        type: format.vcodec && format.acodec ? 'Video + Audio' : format.vcodec ? 'Just Video' : 'Just Audio',
      } : undefined;

      await handleDownload(url, formatId, outputFormat, formatInfo);
      toast({
        title: 'Success',
        description: 'Download complete! Check your downloads folder.',
      });
      setTimeout(() => {
        setSelectedFormat(null);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setUrl('');
    setSelectedFormat(null);
    setValidationError(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-5 md:mb-8 space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-2">YouTube Downloader</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground px-2">
            Download videos as MP4 or extract audio as MP3 - Personal use only
          </p>
          <div>
            <Link
              href="/terms-and-conditions"
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Terms and Conditions
            </Link>
          </div>
        </div>

        {/* ToS Warning */}
        <ToSWarning />

        {/* Backend Status Alert */}
        {!checkingBackend && !backendHealthy && (
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-xs sm:text-sm">
            <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <AlertDescription className="mt-2">
              <p className="font-semibold mb-1">Backend Server Not Running</p>
              <p className="mb-2">
                The API server at <code className="bg-red-100 dark:bg-red-900 px-1 py-0.5 rounded text-xs">{apiBaseUrl}</code> is not responding.
              </p>
              <p>
                To use this tool, please start the FastAPI backend:
              </p>
              <code className="block bg-red-100 dark:bg-red-900 px-2 py-1 rounded mt-1 text-xs overflow-x-auto">
                cd python-backend && python -m uvicorn main:app --reload
              </code>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Card with Tabs */}
        <Card className="p-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'link' | 'search')} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-secondary/50 p-0 h-auto">
              <TabsTrigger 
                value="link" 
                className="rounded-none border-r text-xs sm:text-sm md:text-base px-3 sm:px-4 py-3 data-[state=active]:bg-background"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Link</span>
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="rounded-none text-xs sm:text-sm md:text-base px-3 sm:px-4 py-3 data-[state=active]:bg-background"
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
            </TabsList>

            {/* Link Tab */}
            <TabsContent value="link" className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* URL Input Section */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm md:text-base font-semibold block">YouTube URL</label>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    disabled={state.loading || downloadAction.loading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleFetch();
                    }}
                    className="flex-1 text-sm h-10 sm:h-auto"
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFetch();
                    }}
                    disabled={state.loading || downloadAction.loading}
                    className="gap-2 w-full sm:w-auto whitespace-nowrap text-xs sm:text-sm py-2 sm:py-1 px-4 sm:px-3 h-10 sm:h-auto font-medium"
                  >
                    {state.loading ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                        <span className="hidden sm:inline">Fetching...</span>
                        <span className="sm:hidden">Fetching</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Fetch Formats</span>
                        <span className="sm:hidden">Fetch</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Download Progress */}
              {downloadAction.loading && (
                <div className="border rounded-lg p-3 sm:p-4 md:p-6 bg-secondary/50">
                  <DownloadProgress
                    isLoading={downloadAction.loading}
                    progress={downloadAction.progress}
                    error={downloadAction.error}
                  />
                </div>
              )}

              {/* Reset Button */}
              {state.formats.length > 0 && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    disabled={downloadAction.loading}
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Download Another Video
                  </Button>
                </div>
              )}

              {/* Error Alert */}
              {(state.error || validationError) && (
                <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-xs sm:text-sm">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <AlertDescription className="mt-2">
                    <p className="font-semibold mb-1">
                      {(state.error || validationError)?.includes('Invalid') || (state.error || validationError)?.includes('Not a valid') ? 'Invalid Link' : 'Error'}
                    </p>
                    <p>{state.error || validationError}</p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Video Info */}
              {state.videoInfo && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex flex-col space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-6">
                    {state.videoInfo.thumbnail && (
                      <div className="relative w-full max-w-xl mx-auto sm:max-w-lg">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted shadow-md">
                          <img 
                            src={state.videoInfo.thumbnail} 
                            alt={state.videoInfo.title ?? 'Video thumbnail'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3 sm:space-y-4 w-full">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Title</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold line-clamp-3">{state.videoInfo.title}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                        {state.videoInfo.duration && (
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-semibold">
                              {Math.floor(state.videoInfo.duration / 60)}m {state.videoInfo.duration % 60}s
                            </p>
                          </div>
                        )}
                        {(state.videoInfo.ageRestricted || state.videoInfo.isLive) && (
                          <div className="flex flex-col gap-1">
                            {state.videoInfo.ageRestricted && (
                              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                                Age Restricted
                              </span>
                            )}
                            {state.videoInfo.isLive && (
                              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                                Live Stream
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {state.formats.length > 0 && (
                      <div className="pt-2 sm:pt-3 md:pt-4 border-t">
                        <FormatTable
                          formats={state.formats}
                          title="Available Formats"
                          onDownload={handleDownloadClick}
                          isDownloading={downloadAction.loading}
                          selectedFormatId={selectedFormat ?? undefined}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!state.formats.length && !state.error && (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <p className="text-xs sm:text-sm">
                    Paste a YouTube URL above to see available download formats
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="p-0 h-full">
              <SearchResults />
            </TabsContent>
          </Tabs>

          {/* Download Modal */}
          <DownloadModal
            isOpen={downloadAction.loading}
            isLoading={downloadAction.loading}
            progress={downloadAction.progress}
            error={downloadAction.error ?? null}
            onCancel={cancelDownload}
            formatInfo={downloadAction.formatInfo}
          />
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-2 py-3 sm:py-4 px-2">
          <p>
            This tool is for personal and educational use only. Always respect copyright laws.
          </p>
        </div>
      </div>
    </div>
  );
}
