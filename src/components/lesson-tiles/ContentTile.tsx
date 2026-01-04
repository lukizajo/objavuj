import { LessonTile, LessonTileData, TILE_ICONS } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';

interface ContentTileProps {
  tile: LessonTileData;
}

export function ContentTile({ tile }: ContentTileProps) {
  if (!tile.content_md) return null;
  
  return (
    <LessonTile icon={tile.icon || TILE_ICONS.content} title={tile.title}>
      <MarkdownContent content={tile.content_md} />
    </LessonTile>
  );
}
