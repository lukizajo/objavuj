import { Calendar, Headphones } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { SpotifyPlayer } from './SpotifyPlayer';
import type { PodcastEpisode } from '@/hooks/usePodcastData';

interface EpisodeCardProps {
  episode: PodcastEpisode;
  variant?: 'default' | 'featured' | 'compact';
  onClick?: () => void;
}

export function EpisodeCard({ episode, variant = 'default', onClick }: EpisodeCardProps) {
  const formattedDate = new Date(episode.published_at).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (variant === 'featured') {
    return (
      <GlassCard 
        className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
        onClick={onClick}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="lg:w-64 flex-shrink-0">
            {episode.image_url ? (
              <img 
                src={episode.image_url} 
                alt={episode.title}
                className="w-full aspect-square object-cover rounded-lg"
              />
            ) : (
              <div className="w-full aspect-square bg-primary/10 rounded-lg flex items-center justify-center">
                <Headphones className="h-16 w-16 text-primary/50" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Ep. {episode.episode_number}</Badge>
              {episode.is_featured && (
                <Badge className="bg-primary/20 text-primary">Aktuálna</Badge>
              )}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
            
            <h3 className="text-xl font-display font-bold mb-2">{episode.title}</h3>
            
            {episode.description_md && (
              <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">
                {episode.description_md.replace(/[#*_`]/g, '').slice(0, 200)}...
              </p>
            )}
            
            <div onClick={(e) => e.stopPropagation()}>
              <SpotifyPlayer spotifyUrl={episode.spotify_episode_url} height={80} />
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        {episode.image_url ? (
          <img 
            src={episode.image_url} 
            alt={episode.title}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Headphones className="h-6 w-6 text-primary/50" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">Ep. {episode.episode_number}</Badge>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
          <h4 className="font-medium truncate">{episode.title}</h4>
        </div>
      </div>
    );
  }

  // Default card
  return (
    <GlassCard 
      className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image */}
      {episode.image_url ? (
        <img 
          src={episode.image_url} 
          alt={episode.title}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-primary/10 flex items-center justify-center">
          <Headphones className="h-12 w-12 text-primary/50" />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">Ep. {episode.episode_number}</Badge>
          {episode.is_special && (
            <Badge className="bg-accent/20 text-accent-foreground text-xs">Špeciál</Badge>
          )}
        </div>
        
        <h3 className="font-display font-semibold mb-1 line-clamp-2">{episode.title}</h3>
        
        <span className="text-xs text-muted-foreground mb-3">{formattedDate}</span>
        
        <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
          <SpotifyPlayer spotifyUrl={episode.spotify_episode_url} height={80} />
        </div>
      </div>
    </GlassCard>
  );
}
