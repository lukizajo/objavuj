import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_free: boolean;
  image_url: string | null;
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  module_order: number;
  is_free: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_order: number;
  content_md: string | null;
  examples_md: string | null;
  audio_path: string | null;
  duration_sec: number | null;
  is_free: boolean;
  created_at: string;
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!slug,
  });
}

export function useModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('module_order', { ascending: true });
      
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId,
  });
}

export function useLessons(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('lesson_order', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!moduleId,
  });
}

export function useCourseWithModulesAndLessons(slug: string) {
  return useQuery({
    queryKey: ['courseComplete', slug],
    queryFn: async () => {
      // Get course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (courseError) throw courseError;
      if (!course) return null;
      
      // Get modules
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', course.id)
        .order('module_order', { ascending: true });
      
      if (modulesError) throw modulesError;
      
      // Get all lessons for this course's modules
      const moduleIds = modules?.map(m => m.id) || [];
      
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('lesson_order', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      
      // Group lessons by module
      const modulesWithLessons = modules?.map(module => ({
        ...module,
        lessons: lessons?.filter(l => l.module_id === module.id) || [],
      }));
      
      return {
        course: course as Course,
        modules: modulesWithLessons as (Module & { lessons: Lesson[] })[],
        totalLessons: lessons?.length || 0,
      };
    },
    enabled: !!slug,
  });
}

export function useLesson(courseSlug: string, moduleOrder: number, lessonOrder: number) {
  return useQuery({
    queryKey: ['lesson', courseSlug, moduleOrder, lessonOrder],
    queryFn: async () => {
      // Get course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', courseSlug)
        .maybeSingle();
      
      if (courseError) throw courseError;
      if (!course) return null;
      
      // Get module
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', course.id)
        .eq('module_order', moduleOrder)
        .maybeSingle();
      
      if (moduleError) throw moduleError;
      if (!module) return null;
      
      // Get lesson
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .eq('lesson_order', lessonOrder)
        .maybeSingle();
      
      if (lessonError) throw lessonError;
      
      // Get all lessons for navigation
      const { data: allModules } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', course.id)
        .order('module_order', { ascending: true });
      
      const moduleIds = allModules?.map(m => m.id) || [];
      
      const { data: allLessons } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('lesson_order', { ascending: true });
      
      // Find prev/next lessons
      const flatLessons = allModules?.flatMap(m => 
        allLessons?.filter(l => l.module_id === m.id).map(l => ({
          ...l,
          moduleOrder: m.module_order,
        })) || []
      ) || [];
      
      const currentIndex = flatLessons.findIndex(
        l => l.module_id === module.id && l.lesson_order === lessonOrder
      );
      
      const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
      
      // Get task if exists
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('lesson_id', lesson?.id)
        .maybeSingle();
      
      // Get quiz if exists
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lesson?.id)
        .maybeSingle();
      
      let quizQuestions: { id: string; question: string; options_json: string[]; correct_index: number }[] = [];
      if (quiz) {
        const { data } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quiz.id);
        quizQuestions = (data || []).map(q => ({
          ...q,
          options_json: q.options_json as unknown as string[],
        }));
      }
      
      return {
        course: course as Course,
        module: module as Module,
        lesson: lesson as Lesson,
        allModules: allModules as Module[],
        allLessons: allLessons as Lesson[],
        prevLesson,
        nextLesson,
        task,
        quiz: quiz ? { ...quiz, questions: quizQuestions } : null,
        totalLessons: flatLessons.length,
        currentLessonIndex: currentIndex + 1,
      };
    },
    enabled: !!courseSlug && moduleOrder > 0 && lessonOrder > 0,
  });
}
