import { LessonTileData } from './LessonTile';
import { ContentTile } from './ContentTile';
import { ExampleTile } from './ExampleTile';
import { TranscriptTile } from './TranscriptTile';
import { EthicsTile } from './EthicsTile';
import { WarningTile } from './WarningTile';
import { MiniTaskTile } from './MiniTaskTile';
import { MiniTestTile } from './MiniTestTile';
import { MediaTile } from './MediaTile';

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
  // Sort tiles by tile_order (DB column name)
  const sortedTiles = [...tiles].sort((a, b) => a.tile_order - b.tile_order);

  return (
    <div className="space-y-6">
      {sortedTiles.map((tile) => {
        // Use tile_type from DB
        switch (tile.tile_type) {
          case 'content':
            return <ContentTile key={tile.id} tile={tile} />;
          
          case 'example':
            return <ExampleTile key={tile.id} tile={tile} />;
          
          case 'transcript':
            return <TranscriptTile key={tile.id} tile={tile} />;
          
          case 'media':
            return <MediaTile key={tile.id} tile={tile} initialTime={initialAudioTime} />;
          
          case 'ethics':
            return <EthicsTile key={tile.id} tile={tile} />;
          
          case 'warning':
            return <WarningTile key={tile.id} tile={tile} />;
          
          case 'mini_task':
            return (
              <MiniTaskTile 
                key={tile.id} 
                tile={tile} 
                lessonId={lessonId}
                onComplete={() => onTileComplete(tile.id)}
              />
            );
          
          case 'mini_test':
            return (
              <MiniTestTile 
                key={tile.id} 
                tile={tile} 
                lessonId={lessonId}
                onComplete={() => onTileComplete(tile.id)}
              />
            );
          
          default:
            console.warn(`Unknown tile type: ${(tile as any).tile_type}`);
            return null;
        }
      })}
    </div>
  );
}
