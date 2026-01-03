import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, Cookie, Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const { trackEvent } = useAnalytics();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return null;
  }

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';

  const handleDeleteProfile = async () => {
    setDeleting(true);
    await trackEvent('gdpr_delete_confirmed');
    
    try {
      await supabase.rpc('delete_user_data', { target_user_id: user.id });
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-display font-bold mb-8">{t.profile.title}</h1>

          {/* User Info */}
          <GlassCard className="mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full gradient-bg flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{displayName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </GlassCard>

          {/* Settings */}
          <GlassCard className="mb-6">
            <h2 className="text-lg font-semibold mb-6">{t.profile.settings}</h2>
            
            <div className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <Label>{t.profile.theme}</Label>
                </div>
                <Select value={theme} onValueChange={(v) => setTheme(v as 'dark' | 'light')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">{t.common.dark}</SelectItem>
                    <SelectItem value="light">{t.common.light}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  <Label>{t.profile.language}</Label>
                </div>
                <Select value={language} onValueChange={(v) => setLanguage(v as 'sk' | 'cz' | 'en')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sk">Slovenčina</SelectItem>
                    <SelectItem value="cz">Čeština</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cookie Settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cookie className="h-5 w-5" />
                  <Label>{t.profile.cookieSettings}</Label>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  localStorage.removeItem('cookie_consent');
                  window.location.reload();
                }}>
                  Reset
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard className="border-destructive/30">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold">GDPR</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Zmazanie profilu odstráni všetky vaše dáta vrátane pokroku a odpovedí.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => {
                trackEvent('gdpr_delete_initiated');
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t.profile.deleteProfile}
            </Button>
          </GlassCard>
        </div>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.deleteProfile}</DialogTitle>
            <DialogDescription>{t.profile.deleteConfirm}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t.profile.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProfile} disabled={deleting}>
              {deleting ? t.common.loading : t.profile.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
