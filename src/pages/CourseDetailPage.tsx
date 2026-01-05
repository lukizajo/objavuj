import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Lock, Play, LogIn, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseWithModulesAndLessons } from '@/hooks/useCourseData';
import { useCourseProgress } from '@/hooks/useProgress';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function CourseDetailPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data, isLoading } = useCourseWithModulesAndLessons(courseSlug || '');
  const { data: progressData } = useCourseProgress(courseSlug || '');
  
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const [targetLessonPath, setTargetLessonPath] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center">
          <p className="text-muted-foreground">Kurz nebol nájdený</p>
        </main>
      </div>
    );
  }

  const { course, modules, totalLessons } = data;

  const handleStartCourse = () => {
    // Direct link to first lesson (M01 Úvod)
    navigate(`/learn/${courseSlug}/1/0`);
  };

  const handleLessonClick = (moduleOrder: number, lessonOrder: number, isFree: boolean) => {
    const targetPath = `/learn/${courseSlug}/${moduleOrder}/${lessonOrder}`;
    
    // Free lessons: navigate directly (works for both anon and authenticated)
    if (isFree) {
      navigate(targetPath);
      return;
    }
    
    // Locked lessons: show locked modal with purchase CTA (not login)
    setTargetLessonPath(targetPath);
    setShowLockedDialog(true);
  };

  // Generate JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'OBJAVUJ-AI',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
    },
    isAccessibleForFree: true,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* SEO JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">Pilot</Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                {course.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {modules.length} {t.coursePreview.modules}
                </span>
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  {totalLessons} {t.coursePreview.lessons}
                </span>
              </div>

              {/* Progress if logged in */}
              {user && progressData && progressData.total > 0 && (
                <GlassCard padding="sm" className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t.dashboard.yourProgress}</span>
                    <span className="text-sm text-muted-foreground">
                      {progressData.completed}/{progressData.total} {t.dashboard.lessonsCompleted}
                    </span>
                  </div>
                  <ProgressBar value={progressData.completed} max={progressData.total} />
                </GlassCard>
              )}

              <Button size="lg" variant="gradient" onClick={handleStartCourse}>
                {user && progressData && progressData.completed > 0 
                  ? t.hero.ctaContinue 
                  : t.coursePreview.startFree}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Module List */}
            <GlassCard>
              <h2 className="text-2xl font-display font-semibold mb-6">Obsah kurzu</h2>
              
              <Accordion type="multiple" className="space-y-2">
                {modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground">
                          {module.module_order}
                        </div>
                        <div>
                          <div className="font-medium">{module.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {module.lessons.length} {t.coursePreview.lessons}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {module.lessons.map((lesson) => {
                          const isFree = lesson.is_free;
                          return (
                          <li key={lesson.id}>
                            <button
                              onClick={() => handleLessonClick(module.module_order, lesson.lesson_order, isFree)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                            >
                              {isFree ? (
                                <Play className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground/60" />
                              )}
                              <span className={`flex-1 ${!isFree ? 'text-muted-foreground/70' : ''}`}>{lesson.title}</span>
                              {isFree && (
                                <Badge variant="secondary" className="text-xs">Free</Badge>
                              )}
                              {lesson.duration_sec && (
                                <span className="text-sm text-muted-foreground">
                                  {Math.ceil(lesson.duration_sec / 60)} min
                                </span>
                              )}
                            </button>
                          </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </GlassCard>

            {/* Premium placeholder */}
            <GlassCard className="mt-8 opacity-60">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Platené moduly a balíky</h3>
                  <p className="text-sm text-muted-foreground">
                    Prémiové moduly s pokročilými témami pripravujeme. Už čoskoro!
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />

      {/* Login Prompt Dialog - only for write actions */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Pre pokračovanie sa prihláste
            </DialogTitle>
            <DialogDescription>
              Pre prístup k lekciám sa musíte prihlásiť alebo vytvoriť účet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="gradient" 
              className="flex-1"
              onClick={() => {
                setShowLoginDialog(false);
                navigate(`/login?redirectTo=${encodeURIComponent(targetLessonPath)}`);
              }}
            >
              Prihlásiť sa
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setShowLoginDialog(false);
                navigate(`/register?redirectTo=${encodeURIComponent(targetLessonPath)}`);
              }}
            >
              Registrovať sa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Locked Lesson Dialog - for non-free lessons */}
      <Dialog open={showLockedDialog} onOpenChange={setShowLockedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Táto lekcia je zamknutá
            </DialogTitle>
            <DialogDescription>
              Táto lekcia je súčasťou plateného obsahu. Pre prístup k všetkým lekciám si zakúpte plný prístup ku kurzu.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="gradient" 
              className="flex-1"
              onClick={() => {
                setShowLockedDialog(false);
                // TODO: navigate to purchase page when available
                navigate(`/kurzy/${courseSlug}`);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Kúpiť kurz
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowLockedDialog(false)}
            >
              Zavrieť
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
