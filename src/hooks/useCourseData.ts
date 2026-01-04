import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
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
  transcript_md: string | null;
  audio_path: string | null;
  duration_sec: number | null;
  is_free: boolean;
  created_at: string;
}

export interface LessonTile {
  id: string;
  lesson_id: string;
  type: 'content' | 'example' | 'audio' | 'transcript' | 'mini_task' | 'mini_quiz' | 'ethics' | 'anti_pattern';
  title: string;
  icon: string;
  body_md: string | null;
  body_json: unknown;
  position: number;
  is_required: boolean;
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
      
      if (error) {
        console.error('Courses fetch error:', error.message, error.code, error.details);
        throw error;
      }
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
      
      if (error) {
        console.error('Course fetch error:', error);
        throw error;
      }
      return data as Course | null;
    },
    enabled: !!slug,
  });
}

export function useModules(courseId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['modules', courseId, !!user],
    queryFn: async () => {
      if (!courseId) return [];
      
      let query = supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('module_order', { ascending: true });
      
      // Anonymous users only see free modules
      if (!user) {
        query = query.eq('is_free', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId,
  });
}

export function useLessons(moduleId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['lessons', moduleId, !!user],
    queryFn: async () => {
      if (!moduleId) return [];
      
      let query = supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('lesson_order', { ascending: true });
      
      // Anonymous users only see free lessons
      if (!user) {
        query = query.eq('is_free', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!moduleId,
  });
}

export function useCourseWithModulesAndLessons(slug: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['courseComplete', slug, !!user],
    queryFn: async () => {
      // Get course (no is_free filter on courses)
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (courseError) {
        console.error('Course fetch error:', courseError);
        throw courseError;
      }
      if (!course) return null;
      
      // Get modules
      let modulesQuery = supabase
        .from('modules')
        .select('*')
        .eq('course_id', course.id)
        .order('module_order', { ascending: true });
      
      if (!user) {
        modulesQuery = modulesQuery.eq('is_free', true);
      }
      
      const { data: modules, error: modulesError } = await modulesQuery;
      
      if (modulesError) throw modulesError;
      
      // Get all lessons for this course's modules
      const moduleIds = modules?.map(m => m.id) || [];
      
      let lessonsQuery = supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('lesson_order', { ascending: true });
      
      if (!user) {
        lessonsQuery = lessonsQuery.eq('is_free', true);
      }
      
      const { data: lessons, error: lessonsError } = await lessonsQuery;
      
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
      
      // Get lesson tiles ordered by position
      let tiles: LessonTile[] = [];
      if (lesson?.id) {
        const { data: tilesData } = await supabase
          .from('lesson_tiles')
          .select('*')
          .eq('lesson_id', lesson.id)
          .order('position', { ascending: true });
        
        tiles = (tilesData || []) as LessonTile[];
      }
      
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
      
      // Get task if exists (legacy support)
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('lesson_id', lesson?.id)
        .maybeSingle();
      
      // Get quiz if exists (legacy support)
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
      
      // Determine required tiles for gating
      const requiredTiles = tiles.filter(t => 
        t.is_required || t.type === 'mini_task' || t.type === 'mini_quiz'
      );
      
      return {
        course: course as Course,
        module: module as Module,
        lesson: lesson as Lesson,
        tiles,
        allModules: allModules as Module[],
        allLessons: allLessons as Lesson[],
        prevLesson,
        nextLesson,
        task,
        quiz: quiz ? { ...quiz, questions: quizQuestions } : null,
        totalLessons: flatLessons.length,
        currentLessonIndex: currentIndex + 1,
        requiredTiles,
      };
    },
    enabled: !!courseSlug && moduleOrder > 0 && lessonOrder > 0,
  });
}

// Hook to check if lesson can be unlocked (all required items completed)
export function useLessonGating(lessonId: string | undefined, requiredTiles: LessonTile[] = []) {
  return useQuery({
    queryKey: ['lessonGating', lessonId, requiredTiles.map(t => t.id)],
    queryFn: async () => {
      if (!lessonId || requiredTiles.length === 0) {
        return { canProceed: true, completedRequired: [], missingRequired: [] };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { canProceed: false, completedRequired: [], missingRequired: requiredTiles };
      }

      const completedRequired: string[] = [];
      const missingRequired: LessonTile[] = [];

      for (const tile of requiredTiles) {
        if (tile.type === 'mini_task') {
          const { data } = await supabase
            .from('task_answers')
            .select('id')
            .eq('user_id', user.id)
            .eq('task_id', tile.id)
            .maybeSingle();
          
          if (data) {
            completedRequired.push(tile.id);
          } else {
            missingRequired.push(tile);
          }
        } else if (tile.type === 'mini_quiz') {
          const { data } = await supabase
            .from('quiz_attempts')
            .select('score')
            .eq('user_id', user.id)
            .eq('quiz_id', tile.id)
            .maybeSingle();
          
          // Quiz is complete if score > 0 (correct answer)
          if (data && data.score > 0) {
            completedRequired.push(tile.id);
          } else {
            missingRequired.push(tile);
          }
        }
      }

      return {
        canProceed: missingRequired.length === 0,
        completedRequired,
        missingRequired,
      };
    },
    enabled: !!lessonId,
  });
}
