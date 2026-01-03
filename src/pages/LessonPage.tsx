import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, Check, Home, BookOpen } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLesson } from '@/hooks/useCourseData';
import { useLessonProgress, useUpdateProgress } from '@/hooks/useProgress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function LessonPage() {
  const { courseSlug, moduleOrder, lessonOrder } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const updateProgress = useUpdateProgress();

  const { data, isLoading } = useLesson(
    courseSlug || '',
    parseInt(moduleOrder || '1'),
    parseInt(lessonOrder || '1')
  );
  const { data: progress } = useLessonProgress(data?.lesson?.id);

  const [taskAnswer, setTaskAnswer] = useState('');
  const [taskSaved, setTaskSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (data?.lesson?.id && user) {
      trackEvent('lesson_open', window.location.pathname, { lessonId: data.lesson.id });
      if (!progress || progress.status === 'not_started') {
        updateProgress.mutate({ lessonId: data.lesson.id, status: 'in_progress' });
      }
    }
  }, [data?.lesson?.id, user]);

  useEffect(() => {
    if (data?.task && user) {
      supabase
        .from('task_answers')
        .select('answer_text')
        .eq('user_id', user.id)
        .eq('task_id', data.task.id)
        .maybeSingle()
        .then(({ data: answer }) => {
          if (answer?.answer_text) setTaskAnswer(answer.answer_text);
        });
    }
  }, [data?.task, user]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        trackEvent('audio_play', window.location.pathname);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const newSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  const handleSaveTask = async () => {
    if (!user || !data?.task) return;
    await supabase.from('task_answers').upsert([{
      user_id: user.id,
      task_id: data.task.id,
      answer_text: taskAnswer,
    }], { onConflict: 'user_id,task_id' });
    setTaskSaved(true);
    trackEvent('task_save', window.location.pathname);
    setTimeout(() => setTaskSaved(false), 2000);
  };

  const handleComplete = () => {
    if (!user || !data?.lesson) return;
    updateProgress.mutate({ lessonId: data.lesson.id, status: 'done' });
    trackEvent('lesson_complete', window.location.pathname);
  };

  const navigateToLesson = (moduleOrder: number, lessonOrder: number) => {
    navigate(`/learn/${courseSlug}/${moduleOrder}/${lessonOrder}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Title skeleton */}
          <Skeleton className="h-10 w-3/4 mb-8" />
          {/* Content skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </div>
    );
  }

  if (!data?.lesson || !data?.course || !data?.module) {
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

  const { course, module, lesson, prevLesson, nextLesson, task, totalLessons, currentLessonIndex } = data;
  const isCompleted = progress?.status === 'done';

  // Sanitize lesson content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(
      lesson.content_md?.replace(/\n/g, '<br/>') || '',
      { 
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'code', 'pre', 'blockquote', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      }
    );
  }, [lesson.content_md]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Audio Player Bar */}
      {lesson.audio_path && (
        <div className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border/40 p-4">
          <audio ref={audioRef} src={lesson.audio_path} onEnded={() => setIsPlaying(false)} />
          <div className="container mx-auto flex items-center gap-4">
            <Button size="icon" variant="ghost" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <div className="flex-1">
              <ProgressBar value={30} max={100} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleSpeedChange}>
              {playbackSpeed}x
            </Button>
          </div>
        </div>
      )}

      <main className="pt-24 pb-32">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link to="/kurzy" className="hover:text-foreground transition-colors">Kurzy</Link>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            <Link to={`/kurzy/${courseSlug}`} className="hover:text-foreground transition-colors">{course.title}</Link>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            <span className="truncate max-w-[150px]" title={module.title}>{module.title}</span>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            <span className="text-foreground truncate max-w-[150px]" title={lesson.title}>{lesson.title}</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{currentLessonIndex}/{totalLessons}</Badge>
                {isCompleted && <Badge className="bg-success/20 text-success">{t.lesson.completed}</Badge>}
              </div>
              <h1 className="text-3xl font-display font-bold">{lesson.title}</h1>
            </div>
          </div>

          {/* Content */}
          <GlassCard className="mb-8 prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </GlassCard>

          {/* Examples */}
          {lesson.examples_md && (
            <GlassCard className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t.lesson.examples}</h2>
              <div className="prose prose-invert max-w-none text-sm">
                <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {lesson.examples_md}
                </pre>
              </div>
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
                    {taskSaved ? <><Check className="h-4 w-4 mr-2" />{t.lesson.taskSaved}</> : t.common.save}
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground italic">{t.lesson.loginToSave}</p>
              )}
            </GlassCard>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {prevLesson && (
                <Button variant="outline" onClick={() => navigateToLesson(prevLesson.moduleOrder, prevLesson.lesson_order)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t.lesson.previous}
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isCompleted && user && (
                <Button variant="gradient" onClick={handleComplete}>
                  <Check className="h-4 w-4 mr-2" />
                  {t.lesson.markComplete}
                </Button>
              )}
              {nextLesson ? (
                <Button onClick={() => navigateToLesson(nextLesson.moduleOrder, nextLesson.lesson_order)}>
                  {t.lesson.next}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => navigate('/dashboard')}>
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
