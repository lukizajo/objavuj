import { Link, useParams } from 'react-router-dom';
import { ChevronDown, Check, Play, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useProgress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface Module {
  id: string;
  title: string;
  module_order: number;
  is_free: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  lesson_order: number;
  is_free: boolean;
  duration_sec: number | null;
}

interface LessonSidebarProps {
  courseSlug: string;
  courseTitle: string;
  modules: Module[];
  currentModuleOrder: number;
  currentLessonOrder: number;
  totalLessons: number;
  completedCount: number;
}

export function LessonSidebar({
  courseSlug,
  courseTitle,
  modules,
  currentModuleOrder,
  currentLessonOrder,
  totalLessons,
  completedCount,
}: LessonSidebarProps) {
  const { user } = useAuth();
  const { data: userProgress } = useUserProgress();
  
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  const isLessonCompleted = (lessonId: string) => {
    return userProgress?.some(p => p.lesson_id === lessonId && p.status === 'done') ?? false;
  };

  const currentModuleId = modules.find(m => m.module_order === currentModuleOrder)?.id;

  return (
    <aside className="w-80 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24 glass-card rounded-xl border border-border/40 overflow-hidden">
        {/* Course header */}
        <div className="p-4 border-b border-border/40">
          <Link 
            to={`/kurzy/${courseSlug}`}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
          >
            {courseTitle}
          </Link>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Postup</span>
              <span>{completedCount}/{totalLessons} lekcií</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
        
        {/* Modules accordion */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <Accordion 
            type="single" 
            collapsible 
            defaultValue={currentModuleId}
            className="px-2 py-2"
          >
            {modules.map((module) => (
              <AccordionItem 
                key={module.id} 
                value={module.id}
                className="border-none"
              >
                <AccordionTrigger className="hover:no-underline px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm font-medium">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-xs text-muted-foreground min-w-[20px]">
                      {module.module_order}.
                    </span>
                    <span className="line-clamp-2">{module.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <ul className="space-y-1 pl-2">
                    {module.lessons.map((lesson) => {
                      const isActive = module.module_order === currentModuleOrder && 
                                      lesson.lesson_order === currentLessonOrder;
                      const isCompleted = isLessonCompleted(lesson.id);
                      const canAccess = user || lesson.is_free;
                      
                      return (
                        <li key={lesson.id}>
                          {canAccess ? (
                            <Link
                              to={`/learn/${courseSlug}/${module.module_order}/${lesson.lesson_order}`}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                isActive 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                              )}
                            >
                              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                {isCompleted ? (
                                  <Check className="h-4 w-4 text-success" />
                                ) : isActive ? (
                                  <Play className="h-3 w-3 text-primary" />
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    {lesson.lesson_order}
                                  </span>
                                )}
                              </span>
                              <span className="line-clamp-2 text-left">{lesson.title}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground/60 cursor-not-allowed">
                              <Lock className="h-4 w-4 flex-shrink-0" />
                              <span className="line-clamp-2">{lesson.title}</span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>
    </aside>
  );
}
