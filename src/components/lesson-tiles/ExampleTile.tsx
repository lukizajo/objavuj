import { LessonTile, LessonTileData, TILE_ICONS } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Badge } from '@/components/ui/badge';

interface ExampleTileProps {
  tile: LessonTileData;
}

export function ExampleTile({ tile }: ExampleTileProps) {
  if (!tile.content_md) return null;
  
  return (
    <LessonTile 
      icon={tile.icon || TILE_ICONS.example} 
      title={tile.title}
      variant="optional"
      className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="border-accent/40 text-accent-foreground bg-accent/10">
          Príklad
        </Badge>
      </div>
      <MarkdownContent content={tile.content_md} />
    </LessonTile>
  );
}
