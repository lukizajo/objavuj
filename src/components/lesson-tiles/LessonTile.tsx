import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

// Tile types matching DB constraint (includes 'audio' for media player)
export type TileType = 'content' | 'example' | 'transcript' | 'mini_task' | 'mini_test' | 'media' | 'warning' | 'ethics' | 'audio';

export interface LessonTileData {
  id: string;
  lesson_id: string;
  tile_type: TileType;
  tile_order: number;
  title: string;
  content_md: string | null;
  is_required: boolean;
  media_url: string | null;
  mini_task_id: string | null;
  // Legacy fields for backward compatibility during transition
  icon?: string;
}

interface LessonTileProps {
  children: React.ReactNode;
  icon?: string;
  title: string;
  variant?: 'default' | 'required' | 'optional';
  className?: string;
}

// Default icons for each tile type
export const TILE_ICONS: Record<TileType, string> = {
  content: '📝',
  example: '💡',
  transcript: '📄',
  mini_task: '🎓',
  mini_test: '✅',
  media: '🎧',
  audio: '🎧',
  warning: '⚠️',
  ethics: '🤔',
};

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
        <span className="text-2xl" role="img" aria-label={title}>{icon || '📝'}</span>
        <h3 className="text-lg font-display font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </GlassCard>
  );
}
