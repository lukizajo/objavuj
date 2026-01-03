import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/Navbar';

/**
 * Redirect component for legacy lesson routes
 * Converts /courses/:courseId/modules/:moduleId/lessons/:lessonId to /learn/:courseSlug/:moduleOrder/:lessonOrder
 */
export default function LessonRedirect() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function findAndRedirect() {
      try {
        // Try to find course by ID or slug
        const { data: course } = await supabase
          .from('courses')
          .select('id, slug')
          .or(`id.eq.${courseId},slug.eq.${courseId}`)
          .maybeSingle();

        if (!course) {
          navigate('/kurzy', { replace: true });
          return;
        }

        // Try to find module by ID or order
        const moduleQuery = supabase
          .from('modules')
          .select('id, module_order')
          .eq('course_id', course.id);

        // Check if moduleId is a number (order) or UUID (id)
        const isModuleOrder = !isNaN(Number(moduleId));
        if (isModuleOrder) {
          moduleQuery.eq('module_order', Number(moduleId));
        } else {
          moduleQuery.eq('id', moduleId);
        }

        const { data: module } = await moduleQuery.maybeSingle();

        if (!module) {
          navigate(`/kurzy/${course.slug}`, { replace: true });
          return;
        }

        // Try to find lesson by ID or order
        const lessonQuery = supabase
          .from('lessons')
          .select('id, lesson_order')
          .eq('module_id', module.id);

        const isLessonOrder = !isNaN(Number(lessonId));
        if (isLessonOrder) {
          lessonQuery.eq('lesson_order', Number(lessonId));
        } else {
          lessonQuery.eq('id', lessonId);
        }

        const { data: lesson } = await lessonQuery.maybeSingle();

        if (!lesson) {
          navigate(`/kurzy/${course.slug}`, { replace: true });
          return;
        }

        // Redirect to the new route format
        navigate(`/learn/${course.slug}/${module.module_order}/${lesson.lesson_order}`, { replace: true });
      } catch (error) {
        console.error('Error redirecting lesson:', error);
        navigate('/kurzy', { replace: true });
      }
    }

    findAndRedirect();
  }, [courseId, moduleId, lessonId, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20 container mx-auto px-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </main>
    </div>
  );
}
