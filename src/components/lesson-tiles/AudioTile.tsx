import { LessonTile, LessonTileData } from './LessonTile';
import { AudioPlayer } from '@/components/AudioPlayer';

interface AudioTileProps {
  tile: LessonTileData;
  initialTime?: number;
}

export function AudioTile({ tile, initialTime = 0 }: AudioTileProps) {
  // Audio URL can be in body_md or body_json.url
  const audioUrl = tile.body_md || (tile.body_json as { url?: string })?.url;
  
  if (!audioUrl) return null;
  
  return (
    <LessonTile icon={tile.icon} title={tile.title} variant="optional">
      <AudioPlayer 
        audioUrl={audioUrl}
        transcript={null}
        initialTime={initialTime}
      />
    </LessonTile>
  );
}
