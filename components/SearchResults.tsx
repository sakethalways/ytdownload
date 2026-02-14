'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search as SearchIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export function SearchResults() {
  const router = useRouter();
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('http://localhost:8000');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Set API URL dynamically on client mount
  useEffect(() => {
    setApiBaseUrl(getApiBaseUrl());
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, max_results: 20 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Search failed');
      }

      const data = await response.json();
      if (data.success) {
        setResults(data.videos);
      } else {
        setError(data.error || 'No results found');
        setResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full space-y-4 p-3 sm:p-4 md:p-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          placeholder="Search YouTube videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="flex-1 text-sm sm:text-base"
        />
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="w-full sm:w-auto text-sm sm:text-base h-10"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <SearchIcon className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {hasSearched && results.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm sm:text-base">No videos found. Try a different search.</p>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {results.map((video) => (
          <Card
            key={video.video_id}
            className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
            onClick={() => {
              console.log('🔍 SEARCH: Clicking video:', video);
              console.log('🔍 SEARCH: Video ID:', video.video_id);
              const videoParam = encodeURIComponent(JSON.stringify(video));
              console.log('🔍 SEARCH: Encoded video param:', videoParam);
              router.push(`/video?data=${videoParam}`);
            }}
          >
            <div className="space-y-2 p-0">
              {/* Thumbnail */}
              <div className="relative w-full pt-[56.25%] bg-gray-200">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover absolute inset-0"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Info */}
              <div className="p-2 sm:p-3 space-y-1">
                <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 hover:text-blue-600">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-xs line-clamp-1">{video.channel}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(video.published_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
