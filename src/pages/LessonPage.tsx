import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Home, BookOpen, Trophy, Lock, ShoppingCart, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLesson, useLessonGating, type MappedLessonTile } from '@/hooks/useCourseData';
import { useLessonProgress, useUpdateProgress, useUserProgress } from '@/hooks/useProgress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LessonSidebar } from '@/components/LessonSidebar';
import { MarkdownContent } from '@/components/MarkdownContent';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TileRenderer } from '@/components/lesson-tiles';
// Use MappedLessonTile from useCourseData which is compatible with LessonTileData
import { useQueryClient } from '@tanstack/react-query';

export default function LessonPage() {
  // === ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ===
  
  // Router hooks
  const { courseSlug, moduleOrder, lessonOrder } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Context hooks
  const { t } = useLanguage();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  
  // Parse order values safely
  const moduleOrderNum = parseInt(moduleOrder || '1', 10);
  const lessonOrderNum = parseInt(lessonOrder || '0', 10);
  
  // Data fetching hooks
  const updateProgress = useUpdateProgress();
  const { data, isLoading, error } = useLesson(
    courseSlug || '',
    moduleOrderNum,
    lessonOrderNum
  );
  
  // Get all user progress for sidebar
  const { data: allProgress } = useUserProgress();
  
  // Get lesson ID safely for progress hook
  const lessonId = data?.lesson?.id;
  const { data: progress } = useLessonProgress(lessonId);
  
  // Get gating status
  const requiredTiles = (data?.requiredTiles ?? []) as MappedLessonTile[];
  const { data: gatingData, refetch: refetchGating } = useLessonGating(lessonId, requiredTiles);
  
  // State hooks
  const [taskAnswer, setTaskAnswer] = useState('');
  const [taskSaved, setTaskSaved] = useState(false);
  const [completedTileIds, setCompletedTileIds] = useState<Set<string>>(new Set());

  // Derived values - safe access with fallbacks
  const course = data?.course ?? null;
  const module = data?.module ?? null;
  const lesson = data?.lesson ?? null;
  const tiles = (data?.tiles ?? []) as MappedLessonTile[];
  const allModules = data?.allModules ?? [];
  const allLessons = data?.allLessons ?? [];
  const prevLesson = data?.prevLesson ?? null;
  const nextLesson = data?.nextLesson ?? null;
  const task = data?.task ?? null;
  const totalLessons = data?.totalLessons ?? 0;
  const currentLessonIndex = data?.currentLessonIndex ?? 0;
  const isCompleted = progress?.status === 'done';
  const isLocked = (data as any)?.locked === true;
  
  // Check if we have tiles (new system) or legacy content
  const hasTiles = tiles.length > 0;
  
  // Log warning if using legacy content (no debug banner in UI)
  if (!hasTiles && lesson?.id) {
    console.warn(`Lesson ${lesson.id} has no tiles - using legacy content fallback`);
  }
  
  // Gating: can we proceed to next lesson?
  const canProceedToNext = gatingData?.canProceed ?? true;

  // Build modules with lessons for sidebar
  const modulesWithLessons = useMemo(() => {
    return allModules.map(m => ({
      ...m,
      lessons: allLessons.filter(l => l.module_id === m.id),
    }));
  }, [allModules, allLessons]);

  // Count completed lessons
  const completedCount = useMemo(() => {
    if (!allProgress || !allLessons.length) return 0;
    const lessonIds = new Set(allLessons.map(l => l.id));
    return allProgress.filter(p => p.status === 'done' && lessonIds.has(p.lesson_id)).length;
  }, [allProgress, allLessons]);

  // Check if this is the last lesson in the course
  const isLastLesson = !nextLesson;

  // Callbacks
  const handleTileComplete = useCallback((tileId: string) => {
    setCompletedTileIds(prev => new Set([...prev, tileId]));
    // Refetch gating status
    refetchGating();
  }, [refetchGating]);

  const handleSaveTask = useCallback(async () => {
    if (!user || !task) return;
    await supabase.from('task_answers').upsert([{
      user_id: user.id,
      task_id: task.id,
      answer_text: taskAnswer,
    }], { onConflict: 'user_id,task_id' });
    setTaskSaved(true);
    trackEvent('task_save', window.location.pathname);
    setTimeout(() => setTaskSaved(false), 2000);
  }, [user, task, taskAnswer, trackEvent]);

  const handleComplete = useCallback(() => {
    if (!user || !lessonId) return;
    updateProgress.mutate({ lessonId, status: 'done' });
    trackEvent('lesson_complete', window.location.pathname);
  }, [user, lessonId, updateProgress, trackEvent]);

  const navigateToLesson = useCallback((modOrder: number, lessOrder: number) => {
    navigate(`/learn/${courseSlug}/${modOrder}/${lessOrder}`);
  }, [navigate, courseSlug]);

  // Effects
  useEffect(() => {
    if (lessonId && user) {
      trackEvent('lesson_open', window.location.pathname, { lessonId });
      if (!progress || progress.status === 'not_started') {
        updateProgress.mutate({ lessonId, status: 'in_progress' });
      }
    }
  }, [lessonId, user, progress, trackEvent, updateProgress]);

  useEffect(() => {
    if (task && user) {
      supabase
        .from('task_answers')
        .select('answer_text')
        .eq('user_id', user.id)
        .eq('task_id', task.id)
        .maybeSingle()
        .then(({ data: answer }) => {
          if (answer?.answer_text) setTaskAnswer(answer.answer_text);
        });
    }
  }, [task, user]);

  // === CONDITIONAL RENDERING HAPPENS AFTER ALL HOOKS ===

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              {/* Sidebar skeleton */}
              <div className="w-80 flex-shrink-0 hidden lg:block">
                <div className="glass-card rounded-xl border border-border/40 p-4 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </div>
              </div>
              {/* Content skeleton */}
              <div className="flex-1 max-w-3xl">
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-3/4 mb-8" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center px-4">
          <GlassCard className="max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">
              Chyba pri načítaní
            </h2>
            <p className="text-muted-foreground mb-4">
              Nepodarilo sa načítať lekciu.
            </p>
            <pre className="text-xs bg-secondary/50 p-3 rounded-lg mb-6 overflow-auto max-h-24 text-left text-muted-foreground">
              {error.message}
            </pre>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Späť
              </Button>
              <Button onClick={() => navigate('/kurzy')}>
                <Home className="h-4 w-4 mr-2" />
                Späť na kurzy
              </Button>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  // LOCKED state - lesson exists but blocked by RLS (not free)
  if (isLocked && course && module) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              {/* Sidebar - still show navigation */}
              {modulesWithLessons.length > 0 && (
                <LessonSidebar
                  courseSlug={courseSlug || ''}
                  courseTitle={course.title}
                  modules={modulesWithLessons}
                  currentModuleOrder={moduleOrderNum}
                  currentLessonOrder={lessonOrderNum}
                  totalLessons={totalLessons}
                  completedCount={completedCount}
                />
              )}
              
              {/* Locked content message */}
              <div className="flex-1 max-w-3xl">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
                  <Link to="/kurzy" className="hover:text-foreground transition-colors">
                    Kurzy
                  </Link>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  <Link 
                    to={`/kurzy/${courseSlug}`} 
                    className="hover:text-foreground transition-colors truncate max-w-[150px]"
                    title={course.title}
                  >
                    {course.title}
                  </Link>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate max-w-[120px]" title={module.title}>
                    {module.title}
                  </span>
                </nav>
                
                <GlassCard className="text-center bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-3">
                    Táto lekcia je zamknutá
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Táto lekcia je súčasťou plateného obsahu kurzu. 
                    Pre prístup k všetkým lekciám si zakúpte plný prístup ku kurzu.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      size="lg"
                      onClick={() => navigate(`/kurzy/${courseSlug}`)}
                      className="gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Kúpiť kurz
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => navigate(`/kurzy/${courseSlug}`)}
                    >
                      Zobraziť info o kurze
                    </Button>
                  </div>
                  
                  {/* Navigation to other lessons */}
                  <div className="mt-8 pt-6 border-t border-border/30">
                    <p className="text-sm text-muted-foreground mb-4">
                      Môžete si pozrieť bezplatné lekcie v tomto kurze:
                    </p>
                    <div className="flex gap-3 justify-center">
                      {prevLesson && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToLesson(prevLesson.moduleOrder, prevLesson.lesson_order)}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Predošlá lekcia
                        </Button>
                      )}
                      {nextLesson && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToLesson(nextLesson.moduleOrder, nextLesson.lesson_order)}
                        >
                          Ďalšia lekcia
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not found state - only if lesson truly doesn't exist
  if (!lesson || !course || !module) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center px-4">
          <GlassCard className="max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">
              Lekcia nebola nájdená
            </h2>
            <p className="text-muted-foreground mb-6">
              Táto lekcia neexistuje alebo bola odstránená.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Späť
              </Button>
              <Button onClick={() => navigate('/kurzy')}>
                <Home className="h-4 w-4 mr-2" />
                Späť na kurzy
              </Button>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Sidebar */}
            <LessonSidebar
              courseSlug={courseSlug || ''}
              courseTitle={course.title}
              modules={modulesWithLessons}
              currentModuleOrder={moduleOrderNum}
              currentLessonOrder={lessonOrderNum}
              totalLessons={totalLessons}
              completedCount={completedCount}
            />
            
            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              {/* Audio Player - aligned with sidebar top */}
              {(() => {
                const audioTile = tiles.find(t => t.tile_type === 'audio');
                const audioUrl = audioTile?.media_url;
                
                if (audioUrl) {
                  return (
                    <div className="mb-4">
                      <AudioPlayer 
                        audioUrl={audioUrl}
                        transcript={null}
                        initialTime={progress?.last_position_sec ?? 0}
                      />
                    </div>
                  );
                }
                
                return (
                  <div className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <VolumeX className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Je mi to ľúto, ale v tejto lekcii sa počuť nebudeme. 🥺
                    </p>
                  </div>
                );
              })()}
              
              {/* Lesson Title Tile */}
              <GlassCard variant="hover" className="mb-4">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {lesson.title}
                </h1>
              </GlassCard>

              {/* Tile-based content (new system) */}
              {hasTiles ? (
                <TileRenderer 
                  tiles={tiles}
                  lessonId={lesson.id}
                  initialAudioTime={progress?.last_position_sec ?? 0}
                  onTileComplete={handleTileComplete}
                />
              ) : (
                /* Legacy content rendering - no debug banner */
                <>
                  {/* Audio Player */}
                  {lesson.audio_path && (
                    <div className="mb-6">
                      <AudioPlayer 
                        audioUrl={lesson.audio_path}
                        transcript={lesson.transcript_md ?? null}
                        initialTime={progress?.last_position_sec ?? 0}
                      />
                    </div>
                  )}

                  {/* Lesson Content */}
                  <GlassCard className="mb-8">
                    {lesson.content_md ? (
                      <MarkdownContent content={lesson.content_md} />
                    ) : (
                      <p className="text-muted-foreground italic">
                        Obsah lekcie nie je k dispozícii.
                      </p>
                    )}
                  </GlassCard>

                  {/* Examples */}
                  {lesson.examples_md && (
                    <GlassCard className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">{t.lesson.examples}</h2>
                      <MarkdownContent content={lesson.examples_md} />
                    </GlassCard>
                  )}

                  {/* Task */}
                  {task && (
                    <GlassCard className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">{t.lesson.task}</h2>
                      <p className="mb-4 text-muted-foreground">{task.prompt}</p>
                      {user ? (
                        <>
                          <Textarea
                            value={taskAnswer}
                            onChange={(e) => setTaskAnswer(e.target.value)}
                            placeholder={t.lesson.taskPlaceholder}
                            className="min-h-32 mb-4"
                          />
                          <Button onClick={handleSaveTask} disabled={taskSaved}>
                            {taskSaved ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                {t.lesson.taskSaved}
                              </>
                            ) : (
                              t.common.save
                            )}
                          </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground italic">{t.lesson.loginToSave}</p>
                      )}
                    </GlassCard>
                  )}
                </>
              )}

              {/* Module completion message */}
              {isLastLesson && isCompleted && (
                <GlassCard className="mb-8 mt-6 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-success" />
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">
                    Gratulujeme!
                  </h3>
                  <p className="text-muted-foreground">
                    Dokončili ste všetky lekcie v tomto kurze.
                  </p>
                </GlassCard>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
                <div className="flex gap-2">
                  {prevLesson && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigateToLesson(prevLesson.moduleOrder, prevLesson.lesson_order)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      {t.lesson.previous}
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!isCompleted && user && (
                    <Button 
                      variant="default" 
                      onClick={handleComplete}
                      disabled={!canProceedToNext && hasTiles}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {t.lesson.markComplete}
                    </Button>
                  )}
                  {nextLesson ? (
                    <Button 
                      onClick={() => navigateToLesson(nextLesson.moduleOrder, nextLesson.lesson_order)}
                      disabled={!canProceedToNext && hasTiles && !isCompleted}
                    >
                      {!canProceedToNext && hasTiles && !isCompleted ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Dokončite povinné úlohy
                        </>
                      ) : (
                        <>
                          {t.lesson.next}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={() => navigate(`/kurzy/${courseSlug}`)}>
                      <Home className="h-4 w-4 mr-2" />
                      Späť na kurz
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
