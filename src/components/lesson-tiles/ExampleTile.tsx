import { LessonTile, LessonTileData } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';

interface ExampleTileProps {
  tile: LessonTileData;
}

export function ExampleTile({ tile }: ExampleTileProps) {
  if (!tile.body_md) return null;
  
  return (
    <LessonTile 
      icon={tile.icon} 
      title={tile.title}
      variant="optional"
      className="bg-gradient-to-br from-accent/5 to-primary/5"
    >
      <MarkdownContent content={tile.body_md} />
    </LessonTile>
  );
}
