import { useState, useCallback, useRef } from 'react';
import {
  fetchFormats,
  downloadFormat,
  triggerDownload,
  Format,
  FetchFormatsResponse,
  DownloadProgress,
} from '@/lib/api-client';

export interface DownloadState {
  loading: boolean;
  error: string | null;
  formats: Format[];
  videoInfo: {
    title: string | null;
    duration: number | null;
    thumbnail: string | null;
    videoId: string | null;
    ageRestricted: boolean;
    isLive: boolean;
  } | null;
}

export interface DownloadAction {
  loading: boolean;
  progress: number;
  error: string | null;
  formatInfo?: {
    quality: string;
    codec: string;
    type: string;
  };
}

export function useDownloader() {
  const [state, setState] = useState<DownloadState>({
    loading: false,
    error: null,
    formats: [],
    videoInfo: null,
  });

  const [downloadAction, setDownloadAction] = useState<DownloadAction>({
    loading: false,
    progress: 0,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFetchFormats = useCallback(async (url: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response: FetchFormatsResponse = await fetchFormats(url);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch formats');
      }
      setState({
        loading: false,
        error: null,
        formats: response.formats,
        videoInfo: {
          title: response.title,
          duration: response.duration,
          thumbnail: response.thumbnail,
          videoId: response.video_id,
          ageRestricted: response.age_restricted,
          isLive: response.is_live,
        },
      });

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch formats';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const handleDownload = useCallback(
    async (
      url: string,
      formatId: string,
      outputFormat: 'mp4' | 'mp3',
      formatInfo?: { quality: string; codec: string; type: string }
    ) => {
      // Create new abort controller for this download
      abortControllerRef.current = new AbortController();

      setDownloadAction({
        loading: true,
        progress: 0,
        error: null,
        formatInfo,
      });
      try {
        console.log('[v0] Starting download:', { formatId, outputFormat });
        const blob = await downloadFormat(
          url,
          formatId,
          outputFormat,
          (progress) => {
            const percent =
              progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
            console.log('[v0] Download progress:', percent.toFixed(1) + '%');
            setDownloadAction((prev) => ({
              ...prev,
              progress: Math.min(percent, 99.9), // Cap at 99.9% until complete
            }));
          },
          abortControllerRef.current?.signal
        );

        console.log('[v0] Download complete, blob size:', blob.size);

        if (blob.size === 0) {
          throw new Error('Download resulted in empty file');
        }

        const filename =
          state.videoInfo?.title || `download.${outputFormat}`;
        triggerDownload(blob, `${filename}.${outputFormat}`);

        setDownloadAction({ loading: false, progress: 100, error: null });
        console.log('[v0] File download triggered successfully');
      } catch (error) {
        // Handle abort error differently
        if (
          error instanceof Error &&
          (error.name === 'AbortError' || error.message.includes('cancelled'))
        ) {
          console.log('[v0] Download was cancelled by user');
          setDownloadAction({
            loading: false,
            progress: 0,
            error: 'Download cancelled',
          });
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Download failed';
        console.error('[v0] Download error:', errorMessage);
        setDownloadAction({
          loading: false,
          progress: 0,
          error: errorMessage,
        });
        throw error;
      }
    },
    [state.videoInfo]
  );

  const cancelDownload = useCallback(() => {
    console.log('[v0] Cancelling download...');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDownloadAction({
      loading: false,
      progress: 0,
      error: 'Download cancelled',
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      formats: [],
      videoInfo: null,
    });
    setDownloadAction({ loading: false, progress: 0, error: null });
  }, []);

  return {
    state,
    downloadAction,
    handleFetchFormats,
    handleDownload,
    cancelDownload,
    reset,
  };
}
