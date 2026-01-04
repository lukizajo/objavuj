import { LessonTile, LessonTileData } from './LessonTile';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Volume2 } from 'lucide-react';

interface AudioTileProps {
  tile: LessonTileData;
  initialTime?: number;
}

export function AudioTile({ tile, initialTime = 0 }: AudioTileProps) {
  // Audio URL can be in body_md or body_json.url
  const audioUrl = tile.body_md || (tile.body_json as { url?: string })?.url;
  
  // Show placeholder when audio is not available
  if (!audioUrl) {
    return (
      <LessonTile icon={tile.icon} title={tile.title} variant="optional">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/30">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Audio sa pripravuje</span>
        </div>
      </LessonTile>
    );
  }
  
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
