-- Create podcast_episodes table
CREATE TABLE IF NOT EXISTS public.podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_number int NOT NULL,
  title text NOT NULL,
  description_md text NULL,
  spotify_episode_url text NOT NULL,
  image_url text NULL,
  transcript text NULL,
  published_at timestamptz NOT NULL,
  is_special boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published_at ON public.podcast_episodes(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_episode_number ON public.podcast_episodes(episode_number ASC);

-- Enable RLS
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access to podcast episodes"
  ON public.podcast_episodes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant permissions
GRANT SELECT ON public.podcast_episodes TO anon, authenticated;
