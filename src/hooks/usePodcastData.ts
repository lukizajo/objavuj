import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PodcastEpisode {
  id: string;
  episode_number: number;
  title: string;
  description_md: string | null;
  spotify_episode_url: string;
  image_url: string | null;
  transcript: string | null;
  published_at: string;
  is_special: boolean;
  is_featured: boolean;
  created_at: string;
}

export function usePodcastEpisodes() {
  return useQuery({
    queryKey: ['podcast-episodes'],
    queryFn: async (): Promise<PodcastEpisode[]> => {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching podcast episodes:', error);
        throw error;
      }
      
      return data || [];
    },
  });
}

export function useFeaturedEpisode(episodes: PodcastEpisode[] | undefined) {
  if (!episodes || episodes.length === 0) return null;
  
  // If there's a featured episode, use it
  const featured = episodes.find(ep => ep.is_featured);
  if (featured) return featured;
  
  // Otherwise, use the newest episode
  return episodes[0];
}

export function useLatestEpisodes(episodes: PodcastEpisode[] | undefined, excludeId?: string, limit = 3) {
  if (!episodes) return [];
  
  return episodes
    .filter(ep => ep.id !== excludeId && !ep.is_special)
    .slice(0, limit);
}

export function useRegularEpisodes(episodes: PodcastEpisode[] | undefined) {
  if (!episodes) return [];
  
  return episodes
    .filter(ep => !ep.is_special)
    .sort((a, b) => a.episode_number - b.episode_number);
}

export function useSpecialEpisodes(episodes: PodcastEpisode[] | undefined) {
  if (!episodes) return [];
  
  return episodes
    .filter(ep => ep.is_special)
    .sort((a, b) => a.episode_number - b.episode_number);
}

// Helper to convert Spotify URL to embed URL
export function getSpotifyEmbedUrl(spotifyUrl: string): string {
  // Convert: https://open.spotify.com/episode/xxx -> https://open.spotify.com/embed/episode/xxx
  if (spotifyUrl.includes('/embed/')) return spotifyUrl;
  return spotifyUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
}
