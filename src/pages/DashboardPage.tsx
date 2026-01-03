import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Gift, Bell, Users, Sparkles, ExternalLink, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseProgress } from '@/hooks/useProgress';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';

const quotes = [
  "Dnešok je skvelý deň naučiť sa niečo nové!",
  "Každá lekcia ťa posúva bližšie k cieľu.",
  "AI nie je budúcnosť, je to prítomnosť.",
  "Malé kroky vedú k veľkým výsledkom.",
  "Učenie je investícia do seba.",
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { data: progressData, isLoading: progressLoading } = useCourseProgress('zaklady-ai');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const hasProgress = progressData && progressData.completed > 0;
  const isNewUser = progressData && progressData.completed === 0;

  const handleContinue = () => {
    if (progressData?.nextLesson) {
      navigate(`/learn/zaklady-ai/${progressData.nextLesson.moduleOrder}/${progressData.nextLesson.lessonOrder}`);
    } else {
      navigate('/learn/zaklady-ai/1/1');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Continue Learning Card - Dominant */}
            <GlassCard variant="gradient" padding="lg" className="mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                    {t.dashboard.continueTitle}
                  </h1>
                  <p className="text-muted-foreground">
                    {hasProgress 
                      ? `${progressData.completed}/${progressData.total} ${t.dashboard.lessonsCompleted}`
                      : 'Začnite svoju cestu k ovládnutiu AI'
                    }
                  </p>
                  {hasProgress && (
                    <div className="mt-4 max-w-md">
                      <ProgressBar value={progressData.completed} max={progressData.total} />
                    </div>
                  )}
                </div>
                <Button size="lg" variant="gradient" onClick={handleContinue}>
                  {t.dashboard.continue}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </GlassCard>

            {/* New User Onboarding */}
            {isNewUser && (
              <GlassCard className="mb-8 border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                    <Rocket className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{t.dashboard.newUser}</h3>
                    <p className="text-muted-foreground mb-4">
                      Kliknite na tlačidlo vyššie a začnite svoju prvú lekciu o umelej inteligencii.
                    </p>
                    <Button onClick={handleContinue}>
                      {t.dashboard.startFirst}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Grid of cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Welcome Card */}
              <GlassCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    {t.dashboard.welcome}, {displayName}!
                  </h2>
                </div>
                <p className="text-muted-foreground italic">"{randomQuote}"</p>
              </GlassCard>

              {/* Course Progress Card */}
              <GlassCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{t.dashboard.yourProgress}</h2>
                </div>
                
                {progressLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">OBJAVUJ-AI: Základy</span>
                        <span className="text-xs text-muted-foreground">
                          {progressData?.completed || 0}/{progressData?.total || 0}
                        </span>
                      </div>
                      <ProgressBar 
                        value={progressData?.completed || 0} 
                        max={progressData?.total || 1} 
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleContinue}
                    >
                      {t.dashboard.continue}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                )}
              </GlassCard>

              {/* Rewards Card */}
              <GlassCard className="opacity-70">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="text-lg font-semibold">{t.dashboard.rewards}</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t.dashboard.rewardsComingSoon}
                </p>
              </GlassCard>

              {/* Notifications Card */}
              <GlassCard className="opacity-70">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">{t.dashboard.notifications}</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t.dashboard.notificationsComingSoon}
                </p>
              </GlassCard>

              {/* Community Card */}
              <GlassCard className="opacity-70">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">{t.dashboard.community}</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t.dashboard.communityLocked}
                </p>
              </GlassCard>

              {/* Quick Links Card */}
              <GlassCard>
                <h2 className="text-lg font-semibold mb-4">{t.dashboard.quickLinks}</h2>
                <div className="space-y-2">
                  <Link
                    to="/courses"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{t.nav.courses}</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span>{t.nav.profile}</span>
                  </Link>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span>{t.nav.podcast}</span>
                  </a>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
