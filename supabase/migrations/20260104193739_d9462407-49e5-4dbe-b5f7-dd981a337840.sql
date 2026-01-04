-- Add UNIQUE constraint on quiz_attempts for (user_id, quiz_id) to support upsert operations
ALTER TABLE public.quiz_attempts
ADD CONSTRAINT quiz_attempts_user_quiz_unique 
UNIQUE (user_id, quiz_id);

-- Add index for performance (the unique constraint implicitly creates one, but this ensures it exists)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz 
ON public.quiz_attempts(user_id, quiz_id);