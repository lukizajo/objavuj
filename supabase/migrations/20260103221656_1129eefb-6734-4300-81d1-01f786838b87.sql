-- Fix avatar_events INSERT policy to require authentication
-- This prevents anonymous users from polluting analytics data

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can insert events" ON public.avatar_events;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can insert events" 
ON public.avatar_events 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update SELECT policy to only allow users to see their own events
DROP POLICY IF EXISTS "Authenticated users can view their own events" ON public.avatar_events;

CREATE POLICY "Users can view own events" 
ON public.avatar_events 
FOR SELECT 
USING (auth.uid() = user_id);