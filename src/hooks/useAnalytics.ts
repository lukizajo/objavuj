import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAnalytics() {
  const { user } = useAuth();

  const trackEvent = async (
    eventType: string,
    page?: string,
    metadata?: Record<string, string | number | boolean>
  ) => {
    try {
      await supabase.from('avatar_events').insert([{
        user_id: user?.id || null,
        event_type: eventType,
        page: page || window.location.pathname,
        metadata_json: metadata || null,
      }]);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  return { trackEvent };
}
