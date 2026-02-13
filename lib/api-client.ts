/**
 * API Base URL from environment variable
 * Development: http://localhost:8000 (FastAPI running locally)
 * Production: Set via NEXT_PUBLIC_API_URL env var (e.g., Vercel deployment)
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Format {
  format_id: string;
  format_name: string;
  ext: string;
  height: number | null;
  width: number | null;
  fps: number | null;
  vcodec: string | null;
  acodec: string | null;
  audio_bitrate: number | null;
  video_bitrate: number | null;
  estimated_size_mb: number | null;
  is_dash: boolean;
}

export interface FetchFormatsResponse {
  success: boolean;
  video_id: string | null;
  title: string | null;
  duration: number | null;
  thumbnail: string | null;
  formats: Format[];
  age_restricted: boolean;
  is_live: boolean;
  download_url: string | null;
  error?: string;
  error_code?: string;
}

export interface DownloadProgress {
  loaded: number;
  total: number;
}

export async function fetchFormats(url: string): Promise<FetchFormatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fetch-formats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        language: 'en',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Backend server not running at ${API_BASE_URL}. Make sure to start the FastAPI server.`);
    }
    throw error;
  }
}

export async function downloadFormat(
  url: string,
  formatId: string,
  outputFormat: 'mp4' | 'mp3',
  onProgress?: (progress: DownloadProgress) => void,
  abortSignal?: AbortSignal
): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        format_id: formatId,
        output_format: outputFormat,
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Track download progress
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength || '0', 10);
    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (onProgress) {
        onProgress({ loaded, total });
      }
    }

    return new Blob(chunks, {
      type: outputFormat === 'mp3' ? 'audio/mpeg' : 'video/mp4',
    });
  } catch (error) {
    // Handle abort separately
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[v0] Download cancelled by user');
      throw error;
    }
    console.error('[v0] downloadFormat error:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Backend server not running at ${API_BASE_URL}. Make sure to start the FastAPI server.`);
    }
    throw error;
  }
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
