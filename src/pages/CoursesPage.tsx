import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, X, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCourses } from '@/hooks/useCourseData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/integrations/supabase/types';

type Course = Database['public']['Tables']['courses']['Row'];

export default function CoursesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: courses, isLoading } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCourse(null);
    };
    
    if (selectedCourse) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [selectedCourse]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleViewCourse = () => {
    if (selectedCourse) {
      navigate(`/kurzy/${selectedCourse.slug}`);
    }
  };

  const handleStartCourse = () => {
    if (selectedCourse) {
      navigate(`/learn/${selectedCourse.slug}/1/0`);
    }
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

      {/* Course Modal */}
      {selectedCourse && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCourse(null)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          
          {/* Modal content */}
          <GlassCard 
            className="relative w-full max-w-lg z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/80 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Course image */}
            <div className="h-48 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-6 flex items-center justify-center">
              <BookOpen className="h-20 w-20 text-primary/50" />
            </div>

            {/* Course info */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">Pilot</Badge>
            </div>

            <h2 className="text-2xl font-display font-bold mb-3">{selectedCourse.title}</h2>
            <p className="text-muted-foreground mb-6">{selectedCourse.description}</p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="gradient" 
                className="flex-1"
                onClick={handleStartCourse}
              >
                <Play className="h-4 w-4 mr-2" />
                Začať kurz
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleViewCourse}
              >
                Zobraziť obsah
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
