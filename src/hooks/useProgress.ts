import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'done';
  last_position_sec: number | null;
  updated_at: string;
  completed_at: string | null;
}

export function useUserProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserProgress[];
    },
    enabled: !!user,
  });
}

export function useLessonProgress(lessonId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lessonProgress', user?.id, lessonId],
    queryFn: async () => {
      if (!user || !lessonId) return null;
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserProgress | null;
    },
    enabled: !!user && !!lessonId,
  });
}

export function useUpdateProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      status,
      lastPositionSec,
    }: {
      lessonId: string;
      status: 'not_started' | 'in_progress' | 'done';
      lastPositionSec?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_progress')
        .upsert([{
          user_id: user.id,
          lesson_id: lessonId,
          status,
          last_position_sec: lastPositionSec ?? 0,
          updated_at: new Date().toISOString(),
          completed_at: status === 'done' ? new Date().toISOString() : null,
        }], { onConflict: 'user_id,lesson_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['lessonProgress'] });
    },
  });
}

export function useCourseProgress(courseSlug: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courseProgress', user?.id, courseSlug],
    queryFn: async () => {
      if (!user) return { completed: 0, total: 0, nextLesson: null };
      
      // Get course
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', courseSlug)
        .maybeSingle();
      
      if (!course) return { completed: 0, total: 0, nextLesson: null };
      
      // Get all lessons in this course
      const { data: modules } = await supabase
        .from('modules')
        .select('id, module_order')
        .eq('course_id', course.id)
        .order('module_order', { ascending: true });
      
      const moduleIds = modules?.map(m => m.id) || [];
      
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, module_id, lesson_order')
        .in('module_id', moduleIds)
        .order('lesson_order', { ascending: true });
      
      // Get user progress
      const lessonIds = lessons?.map(l => l.id) || [];
      
      const { data: progress } = await supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);
      
      const completedLessons = progress?.filter(p => p.status === 'done') || [];
      const completedIds = new Set(completedLessons.map(p => p.lesson_id));
      
      // Find next lesson (first not completed)
      const flatLessons = modules?.flatMap(m => 
        lessons?.filter(l => l.module_id === m.id).map(l => ({
          ...l,
          moduleOrder: m.module_order,
        })) || []
      ) || [];
      
      const nextLesson = flatLessons.find(l => !completedIds.has(l.id));
      
      return {
        completed: completedLessons.length,
        total: lessons?.length || 0,
        nextLesson: nextLesson ? {
          lessonId: nextLesson.id,
          moduleOrder: nextLesson.moduleOrder,
          lessonOrder: nextLesson.lesson_order,
        } : null,
      };
    },
    enabled: !!user && !!courseSlug,
  });
}
