import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TileType } from '@/components/lesson-tiles/LessonTile';

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
  code?: string;
  module_order: number;
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
  is_published?: boolean;
  created_at: string;
}

// LessonTile interface matching DB schema
export interface LessonTile {
  id: string;
  lesson_id: string;
  tile_type: TileType;  // content | example | transcript | mini_task | mini_test | media | warning | ethics
  tile_order: number;
  title: string;
  content_md: string | null;
  is_required: boolean;
  media_url: string | null;
  mini_task_id: string | null;
  created_at?: string;
  // Legacy/optional fields for backward compatibility
  icon?: string;
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
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('module_order', { ascending: true });
      
      if (error) {
        console.error('Modules fetch error:', error.message, error.code);
        throw error;
      }
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
      
      if (courseError) {
        console.error('Course fetch error:', courseError);
        throw courseError;
      }
      if (!course) return null;
      
      // Get all modules
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
      // Step 1: Get course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', courseSlug)
        .maybeSingle();
      
      if (courseError) throw courseError;
      if (!course) return { notFound: true, reason: 'course' };
      
      // Step 2: Get module
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', course.id)
        .eq('module_order', moduleOrder)
        .maybeSingle();
      
      if (moduleError) throw moduleError;
      if (!module) return { notFound: true, reason: 'module', course };
      
      // Step 3: Get lesson - SEPARATE FETCH (no JOIN with tiles)
      // RLS may block this if lesson is not free
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .eq('lesson_order', lessonOrder)
        .maybeSingle();
      
      // If lesson is null but no error, it may be locked by RLS
      // We still want to show a "locked" UI, not "not found"
      if (lessonError) throw lessonError;
      
      // Get all modules and lessons for navigation (these should be visible)
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
      
      // Find prev/next lessons for navigation
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
      
      // If lesson is locked (null due to RLS), return locked state
      if (!lesson) {
        return {
          locked: true,
          course: course as Course,
          module: module as Module,
          lesson: null,
          tiles: [],
          allModules: allModules as Module[],
          allLessons: allLessons as Lesson[],
          prevLesson,
          nextLesson,
          task: null,
          quiz: null,
          totalLessons: flatLessons.length,
          currentLessonIndex: currentIndex + 1,
          requiredTiles: [],
        };
      }
      
      // Step 4: Get lesson tiles - SEPARATE FETCH using tile_order
      let tiles: LessonTile[] = [];
      const { data: tilesData, error: tilesError } = await supabase
        .from('lesson_tiles')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('tile_order', { ascending: true });
      
      if (!tilesError && tilesData) {
        tiles = tilesData as LessonTile[];
      }
      
      // Legacy support: Get task if exists
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('lesson_id', lesson.id)
        .maybeSingle();
      
      // Legacy support: Get quiz if exists
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lesson.id)
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
      
      // Determine required tiles for gating (mini_task and mini_test are required)
      const requiredTiles = tiles.filter(t => 
        t.is_required || t.tile_type === 'mini_task' || t.tile_type === 'mini_test'
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
    enabled: !!courseSlug && moduleOrder >= 0 && lessonOrder >= 0,
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
        if (tile.tile_type === 'mini_task') {
          // Check task_answers using mini_task_id
          const taskId = tile.mini_task_id || tile.id;
          const { data } = await supabase
            .from('task_answers')
            .select('id')
            .eq('user_id', user.id)
            .eq('task_id', taskId)
            .maybeSingle();
          
          if (data) {
            completedRequired.push(tile.id);
          } else {
            missingRequired.push(tile);
          }
        } else if (tile.tile_type === 'mini_test') {
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
