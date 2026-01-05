import { LessonTile, LessonTileData, TILE_ICONS } from './LessonTile';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';

interface MiniTestTileProps {
  tile: LessonTileData;
  lessonId: string;
  onComplete: () => void;
}

export function MiniTestTile({ tile, lessonId, onComplete }: MiniTestTileProps) {
  // Placeholder implementation - will be expanded when DB data is available
  return (
    <LessonTile 
      icon={tile.icon || TILE_ICONS.mini_test} 
      title={tile.title}
      variant="required"
      className="bg-gradient-to-br from-primary/10 to-accent/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Povinné
        </Badge>
      </div>
      
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/30">
        <HelpCircle className="h-5 w-5 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">
          Mini test sa pripravuje. Čoskoro bude k dispozícii.
        </span>
      </div>
    </LessonTile>
  );
}
