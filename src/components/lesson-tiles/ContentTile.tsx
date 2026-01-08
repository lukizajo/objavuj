import { LessonTileData, TILE_ICONS } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { GlassCard } from '@/components/ui/glass-card';

interface ContentTileProps {
  tile: LessonTileData;
}

function isGammaUrl(url: string): boolean {
  return url.includes('gamma.app');
}

function getGammaEmbedUrl(url: string): string {
  // Convert gamma.app/docs/... to embed format
  return url.replace('/docs/', '/embed/');
}

export function ContentTile({ tile }: ContentTileProps) {
  // If no content_md and no media_url, don't render
  if (!tile.content_md && !tile.media_url) return null;
  
  const hasTitle = tile.title && tile.title.trim().length > 0;
  
  const renderMedia = () => {
    if (!tile.media_url) return null;
    
    if (isGammaUrl(tile.media_url)) {
      return (
        <div className="aspect-[16/10] rounded-lg overflow-hidden">
          <iframe
            src={getGammaEmbedUrl(tile.media_url)}
            className="w-full h-full border-0"
            allow="fullscreen"
            title={tile.title || 'Gamma prezentácia'}
          />
        </div>
      );
    }
    
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <img 
          src={tile.media_url} 
          alt={tile.title || 'Media content'} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  };
  
  return (
    <GlassCard variant="hover">
      {hasTitle && (
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">{tile.title}</h3>
      )}
      {tile.content_md && <MarkdownContent content={tile.content_md} />}
      {renderMedia()}
    </GlassCard>
  );
}
