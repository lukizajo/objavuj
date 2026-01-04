-- Create lesson_tiles table for tile-based lesson structure
CREATE TABLE IF NOT EXISTS public.lesson_tiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('content', 'example', 'audio', 'transcript', 'mini_task', 'mini_quiz', 'ethics', 'anti_pattern')),
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📝',
  body_md TEXT,
  body_json JSONB,
  position INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lesson_tiles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (same as other content tables)
CREATE POLICY "Anyone can read lesson_tiles" 
ON public.lesson_tiles 
FOR SELECT 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_lesson_tiles_lesson_id ON public.lesson_tiles(lesson_id);
CREATE INDEX idx_lesson_tiles_position ON public.lesson_tiles(lesson_id, position);