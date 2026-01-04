import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export interface LessonTileData {
  id: string;
  lesson_id: string;
  type: 'content' | 'example' | 'audio' | 'transcript' | 'mini_task' | 'mini_quiz' | 'ethics' | 'anti_pattern';
  title: string;
  icon: string;
  body_md: string | null;
  body_json: unknown;
  position: number;
  is_required: boolean;
}

interface LessonTileProps {
  children: React.ReactNode;
  icon: string;
  title: string;
  variant?: 'default' | 'required' | 'optional';
  className?: string;
}

export function LessonTile({ children, icon, title, variant = 'default', className }: LessonTileProps) {
  return (
    <GlassCard 
      variant="hover" 
      className={cn(
        "transition-all duration-300",
        variant === 'required' && "border-primary/40 ring-1 ring-primary/20",
        variant === 'optional' && "border-muted-foreground/20",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" role="img" aria-label={title}>{icon}</span>
        <h3 className="text-lg font-display font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </GlassCard>
  );
}
