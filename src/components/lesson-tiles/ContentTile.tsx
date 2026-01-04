import { LessonTile, LessonTileData } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';

interface ContentTileProps {
  tile: LessonTileData;
}

export function ContentTile({ tile }: ContentTileProps) {
  if (!tile.body_md) return null;
  
  return (
    <LessonTile icon={tile.icon} title={tile.title}>
      <MarkdownContent content={tile.body_md} />
    </LessonTile>
  );
}
