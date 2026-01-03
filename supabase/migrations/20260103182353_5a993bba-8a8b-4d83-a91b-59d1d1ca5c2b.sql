-- Fix: Add authorization check to delete_user_data function
-- Users should only be able to delete their own data

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- CRITICAL: Verify caller owns the data being deleted
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Users can only delete their own data';
  END IF;

  -- Mark profile as deleted
  UPDATE public.profiles SET is_deleted = true, display_name = 'Deleted User', avatar_url = NULL WHERE id = target_user_id;
  
  -- Delete progress
  DELETE FROM public.user_progress WHERE user_id = target_user_id;
  
  -- Delete task answers
  DELETE FROM public.task_answers WHERE user_id = target_user_id;
  
  -- Delete quiz attempts
  DELETE FROM public.quiz_attempts WHERE user_id = target_user_id;
  
  -- Anonymize events
  UPDATE public.avatar_events SET user_id = NULL WHERE user_id = target_user_id;
END;
$function$;