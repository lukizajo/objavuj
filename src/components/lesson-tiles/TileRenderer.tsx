import { LessonTileData } from './LessonTile';
import { ContentTile } from './ContentTile';
import { ExampleTile } from './ExampleTile';
import { TranscriptTile } from './TranscriptTile';
import { EthicsTile } from './EthicsTile';
import { AntiPatternTile } from './AntiPatternTile';
import { MiniTaskTile } from './MiniTaskTile';
import { MiniQuizTile } from './MiniQuizTile';
import { AudioTile } from './AudioTile';

interface TileRendererProps {
  tiles: LessonTileData[];
  lessonId: string;
  initialAudioTime?: number;
  onTileComplete: (tileId: string) => void;
}

export function TileRenderer({ 
  tiles, 
  lessonId, 
  initialAudioTime = 0,
  onTileComplete 
}: TileRendererProps) {
  // Sort tiles by position
  const sortedTiles = [...tiles].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      {sortedTiles.map((tile) => {
        switch (tile.type) {
          case 'content':
            return <ContentTile key={tile.id} tile={tile} />;
          
          case 'example':
            return <ExampleTile key={tile.id} tile={tile} />;
          
          case 'audio':
            return <AudioTile key={tile.id} tile={tile} initialTime={initialAudioTime} />;
          
          case 'transcript':
            return <TranscriptTile key={tile.id} tile={tile} />;
          
          case 'ethics':
            return <EthicsTile key={tile.id} tile={tile} />;
          
          case 'anti_pattern':
            return <AntiPatternTile key={tile.id} tile={tile} />;
          
          case 'mini_task':
            return (
              <MiniTaskTile 
                key={tile.id} 
                tile={tile} 
                lessonId={lessonId}
                onComplete={() => onTileComplete(tile.id)}
              />
            );
          
          case 'mini_quiz':
            return (
              <MiniQuizTile 
                key={tile.id} 
                tile={tile} 
                lessonId={lessonId}
                onComplete={() => onTileComplete(tile.id)}
              />
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
}
