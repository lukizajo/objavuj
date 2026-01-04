import { LessonTile, LessonTileData } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';

interface EthicsTileProps {
  tile: LessonTileData;
}

export function EthicsTile({ tile }: EthicsTileProps) {
  if (!tile.body_md) return null;
  
  return (
    <LessonTile 
      icon={tile.icon} 
      title={tile.title}
      variant="optional"
      className="bg-gradient-to-br from-success/10 to-accent/5 border-success/30"
    >
      <MarkdownContent content={tile.body_md} />
    </LessonTile>
  );
}
