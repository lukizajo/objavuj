import { useEffect } from 'react';
import { X, Calendar, Headphones, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpotifyPlayer } from './SpotifyPlayer';
import { MarkdownContent } from '@/components/MarkdownContent';
import type { PodcastEpisode } from '@/hooks/usePodcastData';

interface EpisodeModalProps {
  episode: PodcastEpisode | null;
  onClose: () => void;
}

export function EpisodeModal({ episode, onClose }: EpisodeModalProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  // Reset transcript state when episode changes
  useEffect(() => {
    setShowTranscript(false);
  }, [episode?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (episode) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [episode, onClose]);

  if (!episode) return null;

  const formattedDate = new Date(episode.published_at).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      
      {/* Modal content */}
      <GlassCard 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/80 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with image */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          {episode.image_url ? (
            <img 
              src={episode.image_url} 
              alt={episode.title}
              className="w-full sm:w-40 aspect-square object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-full sm:w-40 aspect-square bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Headphones className="h-12 w-12 text-primary/50" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary">Ep. {episode.episode_number}</Badge>
              {episode.is_special && (
                <Badge className="bg-accent/20 text-accent-foreground">Špeciál</Badge>
              )}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
            
            <h2 className="text-2xl font-display font-bold mb-4">{episode.title}</h2>
            
            {/* Spotify Player */}
            <SpotifyPlayer spotifyUrl={episode.spotify_episode_url} height={152} />
          </div>
        </div>

        {/* Description */}
        {episode.description_md && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">O epizóde</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownContent content={episode.description_md} />
            </div>
          </div>
        )}

        {/* Transcript */}
        {episode.transcript && (
          <div className="border-t border-border/40 pt-6">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <span className="font-semibold">Prepis epizódy</span>
              {showTranscript ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {showTranscript && (
              <div className="mt-4 p-4 bg-secondary/30 rounded-lg max-h-96 overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownContent content={episode.transcript} />
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
