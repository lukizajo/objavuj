import { LessonTileData, TILE_ICONS } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { GlassCard } from '@/components/ui/glass-card';

interface ContentTileProps {
  tile: LessonTileData;
}

export function ContentTile({ tile }: ContentTileProps) {
  if (!tile.content_md) return null;
  
  const hasTitle = tile.title && tile.title.trim().length > 0;
  
  return (
    <GlassCard variant="hover">
      {hasTitle && (
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">{tile.title}</h3>
      )}
      <MarkdownContent content={tile.content_md} />
    </GlassCard>
  );
}
