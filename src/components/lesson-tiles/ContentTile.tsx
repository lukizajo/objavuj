import { LessonTileData, TILE_ICONS } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { GlassCard } from '@/components/ui/glass-card';

interface ContentTileProps {
  tile: LessonTileData;
}

export function ContentTile({ tile }: ContentTileProps) {
  // If no content_md and no media_url, don't render
  if (!tile.content_md && !tile.media_url) return null;
  
  const hasTitle = tile.title && tile.title.trim().length > 0;
  
  return (
    <GlassCard variant="hover">
      {hasTitle && (
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">{tile.title}</h3>
      )}
      {tile.content_md ? (
        <MarkdownContent content={tile.content_md} />
      ) : tile.media_url ? (
        <div className="aspect-video rounded-lg overflow-hidden">
          <img 
            src={tile.media_url} 
            alt={tile.title || 'Media content'} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}
    </GlassCard>
  );
}
