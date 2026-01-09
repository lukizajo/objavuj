-- Create podcast_episodes table
CREATE TABLE public.podcast_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description_md TEXT,
  spotify_episode_url TEXT NOT NULL,
  image_url TEXT,
  transcript TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_special BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

-- Anyone can read podcast episodes (public content)
CREATE POLICY "Anyone can read podcast episodes"
ON public.podcast_episodes
FOR SELECT
USING (true);

-- Create index for ordering
CREATE INDEX idx_podcast_episodes_published ON public.podcast_episodes(published_at DESC);
CREATE INDEX idx_podcast_episodes_number ON public.podcast_episodes(episode_number);