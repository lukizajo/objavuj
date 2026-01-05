import { EpisodeCard } from './EpisodeCard';
import type { PodcastEpisode } from '@/hooks/usePodcastData';

interface EpisodeListProps {
  episodes: PodcastEpisode[];
  title: string;
  onEpisodeClick: (episode: PodcastEpisode) => void;
  variant?: 'grid' | 'list';
}

export function EpisodeList({ episodes, title, onEpisodeClick, variant = 'grid' }: EpisodeListProps) {
  if (episodes.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-display font-bold mb-6">{title}</h2>
      
      {variant === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes.map((episode) => (
            <EpisodeCard 
              key={episode.id} 
              episode={episode} 
              onClick={() => onEpisodeClick(episode)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 bg-secondary/20 rounded-xl overflow-hidden">
          {episodes.map((episode) => (
            <EpisodeCard 
              key={episode.id} 
              episode={episode} 
              variant="compact"
              onClick={() => onEpisodeClick(episode)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
