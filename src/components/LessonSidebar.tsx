import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Check, Play, Lock, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useProgress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Module {
  id: string;
  title: string;
  module_order: number;
  is_free?: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  lesson_order: number;
  is_free: boolean;
  duration_sec: number | null;
}

interface LessonTileBasic {
  id: string;
  title: string | null;
  tile_order: number;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProgress } = useUserProgress();
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  
  // Get all lesson IDs
  const allLessonIds = modules.flatMap(m => m.lessons.map(l => l.id));
  
  // Fetch tiles for all lessons
  const { data: allTiles } = useQuery({
    queryKey: ['lesson-tiles-sidebar', allLessonIds],
    queryFn: async () => {
      if (allLessonIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('lesson_tiles')
        .select('id, title, lesson_id, position')
        .in('lesson_id', allLessonIds)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      // Group by lesson_id
      const grouped: Record<string, LessonTileBasic[]> = {};
      data?.forEach((tile: any) => {
        if (!grouped[tile.lesson_id]) {
          grouped[tile.lesson_id] = [];
        }
        grouped[tile.lesson_id].push({
          id: tile.id,
          title: tile.title,
          tile_order: tile.position,
        });
      });
      
      return grouped;
    },
    enabled: allLessonIds.length > 0,
  });
  
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  const isLessonCompleted = (lessonId: string) => {
    return userProgress?.some(p => p.lesson_id === lessonId && p.status === 'done') ?? false;
  };

  const currentModuleId = modules.find(m => m.module_order === currentModuleOrder)?.id;

  const handleLessonClick = (e: React.MouseEvent, lesson: Lesson, moduleOrder: number) => {
    if (!lesson.is_free) {
      e.preventDefault();
      setShowLockedModal(true);
    }
  };

  const toggleLessonExpand = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const getLessonTiles = (lessonId: string): LessonTileBasic[] => {
    return allTiles?.[lessonId]?.filter(t => t.title && t.title.trim().length > 0) || [];
  };

  return (
    <>
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
                      <span className="line-clamp-2">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <ul className="space-y-1 pl-2">
                      {module.lessons.map((lesson) => {
                        const isActive = module.module_order === currentModuleOrder && 
                                        lesson.lesson_order === currentLessonOrder;
                        const isCompleted = isLessonCompleted(lesson.id);
                        const isFree = lesson.is_free;
                        const tiles = getLessonTiles(lesson.id);
                        const hasTiles = tiles.length > 0;
                        const isExpanded = expandedLessons.has(lesson.id);
                        
                        return (
                          <li key={lesson.id}>
                            <div className="flex items-center">
                              {/* Triangle toggle */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (hasTiles) {
                                    toggleLessonExpand(lesson.id);
                                  }
                                }}
                                className={cn(
                                  "flex-shrink-0 w-5 h-5 flex items-center justify-center",
                                  hasTiles ? "cursor-pointer hover:text-primary" : "cursor-default opacity-30"
                                )}
                                disabled={!hasTiles}
                              >
                                <ChevronRight className={cn(
                                  "h-3 w-3 transition-transform duration-200",
                                  isExpanded && "rotate-90"
                                )} />
                              </button>
                              
                              {/* Lesson link */}
                              <Link
                                to={isFree ? `/learn/${courseSlug}/${module.module_order}/${lesson.lesson_order}` : '#'}
                                onClick={(e) => handleLessonClick(e, lesson, module.module_order)}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors flex-1",
                                  isActive 
                                    ? "bg-primary/10 text-primary font-medium" 
                                    : isFree
                                      ? "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                      : "text-muted-foreground/60 hover:bg-secondary/30 cursor-pointer"
                                )}
                              >
                                <span className={cn(
                                  "line-clamp-2 text-left flex-1",
                                  !isFree && "blur-[2px] select-none"
                                )}>
                                  {lesson.title}
                                </span>
                                {!isFree && (
                                  <Badge variant="outline" className="text-[10px] opacity-60 flex-shrink-0 px-1">
                                    <Lock className="h-2 w-2" />
                                  </Badge>
                                )}
                              </Link>
                            </div>
                            
                            {/* Tiles list - expandable */}
                            {hasTiles && isExpanded && (
                              <ul className="ml-7 mt-1 space-y-0.5 border-l border-border/30 pl-3">
                                {tiles.map((tile) => (
                                  <li 
                                    key={tile.id}
                                    className="text-xs text-muted-foreground py-1"
                                  >
                                    {tile.title}
                                  </li>
                                ))}
                              </ul>
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

      {/* Locked Lesson Modal */}
      <Dialog open={showLockedModal} onOpenChange={setShowLockedModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Táto lekcia je zamknutá
            </DialogTitle>
            <DialogDescription>
              Táto lekcia je súčasťou plateného obsahu. Pre prístup k všetkým lekciám si zakúpte plný prístup ku kurzu.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="gradient" 
              className="flex-1"
              onClick={() => {
                setShowLockedModal(false);
                navigate(`/kurzy/${courseSlug}`);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Kúpiť kurz
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowLockedModal(false)}
            >
              Zavrieť
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
