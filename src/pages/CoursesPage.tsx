import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, X, Play, Lock, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses, useCourseWithModulesAndLessons } from '@/hooks/useCourseData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Course } from '@/hooks/useCourseData';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: courses, isLoading } = useCourses();
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null);
  const { data: courseData, isLoading: courseLoading } = useCourseWithModulesAndLessons(selectedCourseSlug || '');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCourseSlug(null);
    };
    
    if (selectedCourseSlug) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [selectedCourseSlug]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourseSlug(course.slug);
  };

  const handleStartCourse = () => {
    if (selectedCourseSlug) {
      navigate(`/learn/${selectedCourseSlug}/1/0`);
    }
  };

  const handleLessonClick = (moduleOrder: number, lessonOrder: number, isFree: boolean) => {
    if (!selectedCourseSlug) return;
    
    if (isFree) {
      navigate(`/learn/${selectedCourseSlug}/${moduleOrder}/${lessonOrder}`);
    }
    // Locked lessons don't navigate - user sees they're locked
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              {t.nav.courses}
            </h1>
            <p className="text-xl text-muted-foreground">
              Praktické kurzy o umelej inteligencii pre každého
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <GlassCard key={i}>
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </GlassCard>
              ))
            ) : courses && courses.length > 0 ? (
              courses.map((course) => (
                <GlassCard 
                  key={course.id} 
                  variant="hover" 
                  className="flex flex-col cursor-pointer"
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="h-40 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/50" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">Pilot</Badge>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">
                    {course.description}
                  </p>
                  
                  <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleCourseClick(course); }}>
                    Zobraziť kurz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </GlassCard>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground">Zatiaľ žiadne kurzy</p>
              </div>
            )}

            {/* Coming soon placeholder */}
            <GlassCard className="flex flex-col opacity-60">
              <div className="h-40 rounded-lg bg-muted/50 mb-4 flex items-center justify-center">
                <Clock className="h-16 w-16 text-muted-foreground/50" />
              </div>
              
              <Badge variant="secondary" className="w-fit mb-3">Pripravujeme</Badge>
              
              <h2 className="text-xl font-semibold mb-2">Ďalšie kurzy</h2>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Pripravujeme pre vás ďalšie kurzy o AI, promptovaní a automatizácii.
              </p>
              
              <Button variant="outline" className="w-full" disabled>
                Už čoskoro
              </Button>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />

      {/* Course Detail Modal */}
      {selectedCourseSlug && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCourseSlug(null)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          
          {/* Modal content - full course detail */}
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 bg-background/95 backdrop-blur-xl rounded-2xl border border-border/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedCourseSlug(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/80 transition-colors z-20 bg-background/50"
            >
              <X className="h-5 w-5" />
            </button>

            {courseLoading ? (
              <div className="p-8">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-full mb-8" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : courseData ? (
              <div className="p-8">
                {/* Course Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">Pilot</Badge>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    {courseData.course.title}
                  </h1>
                  
                  <p className="text-lg text-muted-foreground mb-6">
                    {courseData.course.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {courseData.modules.length} {t.coursePreview.modules}
                    </span>
                    <span className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      {courseData.totalLessons} {t.coursePreview.lessons}
                    </span>
                  </div>

                  <Button size="lg" variant="gradient" onClick={handleStartCourse}>
                    {t.coursePreview.startFree}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Module List */}
                <GlassCard>
                  <h2 className="text-xl font-display font-semibold mb-4">Obsah kurzu</h2>
                  
                  <Accordion type="multiple" className="space-y-2">
                    {courseData.modules.map((module) => (
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
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                                      isFree 
                                        ? 'hover:bg-secondary/50 cursor-pointer' 
                                        : 'cursor-default bg-secondary/20'
                                    }`}
                                  >
                                    {isFree ? (
                                      <Play className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    ) : (
                                      <Lock className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                                    )}
                                    <span className={`flex-1 ${!isFree ? 'blur-[2px] select-none' : ''}`}>
                                      {lesson.title}
                                    </span>
                                    {isFree && (
                                      <Badge variant="secondary" className="text-xs flex-shrink-0">Free</Badge>
                                    )}
                                    {!isFree && (
                                      <Badge variant="outline" className="text-xs opacity-60 flex-shrink-0">
                                        <Lock className="h-3 w-3 mr-1" />
                                        Zamknuté
                                      </Badge>
                                    )}
                                    {lesson.duration_sec && (
                                      <span className={`text-sm text-muted-foreground flex-shrink-0 ${!isFree ? 'blur-[2px]' : ''}`}>
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

                {/* Purchase CTA for locked content */}
                <GlassCard className="mt-6 border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Odomknúť všetky lekcie</h3>
                      <p className="text-sm text-muted-foreground">
                        Získajte prístup ku všetkým zamknutým lekciám a prémiovému obsahu.
                      </p>
                    </div>
                    <Button variant="gradient" onClick={() => navigate(`/kurzy/${selectedCourseSlug}`)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Kúpiť
                    </Button>
                  </div>
                </GlassCard>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Kurz nebol nájdený</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
