import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Supabase automatically picks up the session from the URL hash
      const { data: { session }, error } = await supabase.auth.getSession();

      // Clear the URL hash (access_token, etc.) so tokens aren't left in the address bar
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
        return;
      }

      if (session) {
        // Successfully authenticated - redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // No session - redirect to login
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Prihlasovanie...</p>
      </div>
    </div>
  );
}
