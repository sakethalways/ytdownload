'use client';

import { useState } from 'react';
import { Format } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Music, Film } from 'lucide-react';

interface FormatTableProps {
  formats: Format[];
  title?: string;
  onDownload: (formatId: string, outputFormat: 'mp4' | 'mp3') => void;
  isDownloading: boolean;
  selectedFormatId?: string;
}

export function FormatTable({
  formats,
  title,
  onDownload,
  isDownloading,
  selectedFormatId,
}: FormatTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const videoFormats = formats.filter((f) => f.vcodec && !f.is_dash);
  const audioFormats = formats.filter((f) => f.acodec && !f.vcodec);

  const getQualityLabel = (format: Format): string => {
    if (format.height) {
      return `${format.height}p`;
    }
    if (format.audio_bitrate) {
      return `${Math.round(format.audio_bitrate / 1000)}kbps`;
    }
    return format.ext.toUpperCase();
  };

  const getCodecInfo = (format: Format): string => {
    const parts = [];
    if (format.vcodec) parts.push(format.vcodec.toUpperCase());
    if (format.acodec) parts.push(`${format.acodec.toUpperCase()} Audio`);
    return parts.join(' + ') || 'Unknown';
  };

  const getCodecDescription = (format: Format): string => {
    const descriptions: Record<string, string> = {
      'AVC1': 'H.264 (Compatible)',
      'VP9': 'VP9 (Better Quality)',
      'AV01': 'AV1 (Best Compression)',
      'OPUS': 'Modern Audio (Better Quality)',
      'MP4A': 'AAC Audio (Standard)',
    };

    if (format.vcodec) {
      const codec = format.vcodec.split('.')[0].toUpperCase();
      return descriptions[codec] || format.vcodec;
    }
    if (format.acodec) {
      const codec = format.acodec.split('.')[0].toUpperCase();
      return descriptions[codec] || format.acodec;
    }
    return '';
  };

  const getFormatType = (format: Format): string => {
    if (format.vcodec && format.acodec) return 'Video + Audio';
    if (format.vcodec && !format.acodec) return 'Just Video';
    if (!format.vcodec && format.acodec) return 'Just Audio';
    return 'Unknown';
  };

  const formatSize = (size: number | null | undefined): string => {
    if (!size) return 'Unknown';
    if (size > 1024) return `${(size / 1024).toFixed(1)} GB`;
    return `${size.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {title && (
        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1.5 sm:mb-2">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {formats.length} format{formats.length !== 1 ? 's' : ''} available
          </p>
        </div>
      )}

      {/* Tabbed Format Sections */}
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
          <TabsTrigger value="video" className="gap-1 sm:gap-2">
            <Film className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Video</span>
            <span className="sm:hidden">V</span>
            {videoFormats.length > 0 && ` (${videoFormats.length})`}
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-1 sm:gap-2">
            <Music className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Audio</span>
            <span className="sm:hidden">A</span>
            {audioFormats.length > 0 && ` (${audioFormats.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Video Formats Tab */}
        <TabsContent value="video" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
          {videoFormats.length > 0 ? (
            videoFormats.map((format) => (
              <Card
                key={format.format_id}
                className="p-3 sm:p-4 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors border-l-4 border-l-blue-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <span className="font-bold text-sm sm:text-base">{getQualityLabel(format)}</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{getFormatType(format)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-xs sm:text-sm">
                      <span className="text-muted-foreground">{getCodecInfo(format)}</span>
                      <span className="text-green-700 dark:text-green-400 font-medium">— {getCodecDescription(format)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 sm:space-x-2 flex flex-col sm:flex-row sm:flex-wrap gap-1.5">
                      <span>📦 ~{formatSize(format.estimated_size_mb)}</span>
                      {format.fps && <span>⚡ {format.fps} fps</span>}
                      {format.width && <span>📐 {format.width}x{format.height}</span>}
                    </div>
                  </div>
                  <Button
                    onClick={() => onDownload(format.format_id, 'mp4')}
                    disabled={isDownloading}
                    variant={selectedFormatId === format.format_id ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 sm:gap-2 whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm flex-shrink-0"
                  >
                    <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">
                      {selectedFormatId === format.format_id && isDownloading ? 'Downloading...' : 'Download'}
                    </span>
                    <span className="sm:hidden">
                      {selectedFormatId === format.format_id && isDownloading ? 'DL' : 'Get'}
                    </span>
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No video formats available</p>
          )}
        </TabsContent>

        {/* Audio Formats Tab */}
        <TabsContent value="audio" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
          {audioFormats.length > 0 ? (
            audioFormats.map((format) => (
              <Card
                key={format.format_id}
                className="p-3 sm:p-4 hover:bg-green-50 dark:hover:bg-green-950/30 cursor-pointer transition-colors border-l-4 border-l-green-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <span className="font-bold text-sm sm:text-base">{getQualityLabel(format)}</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">{getFormatType(format)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-xs sm:text-sm">
                      <span className="text-muted-foreground">{getCodecInfo(format)}</span>
                      <span className="text-green-700 dark:text-green-400 font-medium">— {getCodecDescription(format)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 sm:space-x-2 flex flex-col sm:flex-row sm:flex-wrap gap-1.5">
                      <span>📦 ~{formatSize(format.estimated_size_mb)}</span>
                      {format.audio_bitrate && <span>🔊 {Math.round(format.audio_bitrate / 1000)}kbps</span>}
                    </div>
                  </div>
                  <Button
                    onClick={() => onDownload(format.format_id, 'mp3')}
                    disabled={isDownloading}
                    variant={selectedFormatId === format.format_id ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 sm:gap-2 whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm flex-shrink-0"
                  >
                    <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">
                      {selectedFormatId === format.format_id && isDownloading ? 'Downloading...' : 'Download'}
                    </span>
                    <span className="sm:hidden">
                      {selectedFormatId === format.format_id && isDownloading ? 'DL' : 'Get'}
                    </span>
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No audio formats available</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
