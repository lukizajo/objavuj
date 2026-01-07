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
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl" role="img" aria-label={tile.title}>{tile.icon || TILE_ICONS.content}</span>
          <h3 className="text-lg font-display font-semibold text-foreground">{tile.title}</h3>
        </div>
      )}
      <MarkdownContent content={tile.content_md} />
    </GlassCard>
  );
}
