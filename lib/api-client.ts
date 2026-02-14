/**
 * API Base URL - dynamically determined based on environment
 * Production: Set via NEXT_PUBLIC_API_URL env var
 * Development: Uses current hostname to support mobile access (e.g., 192.168.0.5:3000 -> 192.168.0.5:8000)
 */

function getApiBaseUrl(): string {
  // PRIORITY 1: Runtime detection (for mobile/network access like 192.168.0.5:3000 -> 192.168.0.5:8000)
  // This must be checked FIRST before env vars (which are hardcoded at build time)
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000`;
  }

  // PRIORITY 2: Env var (for SSR/build time)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // FALLBACK: localhost
  return 'http://localhost:8000';
}

// NOTE: Do NOT use a module-level constant here!
// getApiBaseUrl() must be called dynamically at runtime in components
// to detect the actual hostname (for mobile access like 192.168.0.5:3000)

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
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/fetch-formats`, {
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
      const apiBaseUrl = getApiBaseUrl();
      throw new Error(`Backend server not running at ${apiBaseUrl}. Make sure to start the FastAPI server.`);
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
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/download`, {
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

    return new Blob(chunks as BlobPart[], {
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
      const apiBaseUrl = getApiBaseUrl();
      throw new Error(`Backend server not running at ${apiBaseUrl}. Make sure to start the FastAPI server.`);
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
