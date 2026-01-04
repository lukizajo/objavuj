import { LessonTile, LessonTileData, TILE_ICONS } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { AlertTriangle } from 'lucide-react';

interface WarningTileProps {
  tile: LessonTileData;
}

export function WarningTile({ tile }: WarningTileProps) {
  if (!tile.content_md) return null;
  
  return (
    <LessonTile 
      icon={tile.icon || TILE_ICONS.warning} 
      title={tile.title}
      variant="optional"
      className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30"
    >
      <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 mb-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <span className="text-sm text-destructive font-medium">Na čo si dať pozor</span>
      </div>
      <MarkdownContent content={tile.content_md} />
    </LessonTile>
  );
}
