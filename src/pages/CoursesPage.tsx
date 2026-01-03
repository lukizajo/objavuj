import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCourses } from '@/hooks/useCourseData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: courses, isLoading } = useCourses();

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
                <GlassCard key={course.id} variant="hover" className="flex flex-col">
                  <div className="h-40 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/50" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {course.is_free && (
                      <Badge className="bg-success/20 text-success border-success/30">
                        {t.coursePreview.freeBadge}
                      </Badge>
                    )}
                    <Badge variant="secondary">Pilot</Badge>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">
                    {course.description}
                  </p>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/courses/${course.slug}`)}
                  >
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
    </div>
  );
}
