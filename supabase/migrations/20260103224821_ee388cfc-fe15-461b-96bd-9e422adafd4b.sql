-- Add transcript_md column to lessons table for audio transcripts
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS transcript_md text;