import { useState, useEffect } from 'react';
import { Bot, Cookie } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay showing to avoid interrupting initial page load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = async (type: 'all' | 'essential') => {
    localStorage.setItem('cookie_consent', type);
    
    // Track event
    await trackEvent('cookie_consent', '/', { consent_type: type });
    
    // If logged in, save to preferences
    if (user) {
      await supabase
        .from('user_preferences')
        .update({ cookie_consent: type })
        .eq('user_id', user.id);
    }
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader className="flex flex-row items-start gap-4">
          <div className="h-12 w-12 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-lg font-display">
              Cookies 🍪
            </DialogTitle>
            <DialogDescription className="text-base">
              {t.cookie.message}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => handleConsent('all')}
            className="w-full gradient-bg text-primary-foreground hover:opacity-90"
          >
            <Cookie className="h-4 w-4 mr-2" />
            {t.cookie.acceptAll}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleConsent('essential')}
            className="w-full"
          >
            {t.cookie.essentialOnly}
          </Button>
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t.cookie.policy}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
