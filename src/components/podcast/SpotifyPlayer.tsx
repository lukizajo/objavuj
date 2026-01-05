import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSpotifyEmbedUrl } from '@/hooks/usePodcastData';

interface SpotifyPlayerProps {
  spotifyUrl: string;
  height?: number;
  className?: string;
}

export function SpotifyPlayer({ spotifyUrl, height = 152, className = '' }: SpotifyPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const embedUrl = getSpotifyEmbedUrl(spotifyUrl);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center p-4 bg-secondary/50 rounded-lg ${className}`}>
        <Button 
          variant="outline" 
          onClick={() => window.open(spotifyUrl, '_blank')}
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Otvoriť v Spotify
        </Button>
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height={height}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className={`rounded-xl ${className}`}
      onError={() => setHasError(true)}
    />
  );
}
