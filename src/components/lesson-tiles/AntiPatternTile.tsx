import { LessonTile, LessonTileData } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';

interface AntiPatternTileProps {
  tile: LessonTileData;
}

export function AntiPatternTile({ tile }: AntiPatternTileProps) {
  if (!tile.body_md) return null;
  
  return (
    <LessonTile 
      icon={tile.icon} 
      title={tile.title}
      variant="optional"
      className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30"
    >
      <MarkdownContent content={tile.body_md} />
    </LessonTile>
  );
}
