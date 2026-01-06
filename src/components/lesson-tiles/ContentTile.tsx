import { LessonTileData } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { GlassCard } from '@/components/ui/glass-card';

interface ContentTileProps {
  tile: LessonTileData;
}

export function ContentTile({ tile }: ContentTileProps) {
  if (!tile.content_md) return null;
  
  // Content tile renders only text without title/icon header
  return (
    <GlassCard variant="hover">
      <MarkdownContent content={tile.content_md} />
    </GlassCard>
  );
}
