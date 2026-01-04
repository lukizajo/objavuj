import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { LessonTile, LessonTileData, TILE_ICONS } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TranscriptTileProps {
  tile: LessonTileData;
}

export function TranscriptTile({ tile }: TranscriptTileProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!tile.content_md) return null;
  
  return (
    <LessonTile icon={tile.icon || TILE_ICONS.transcript} title={tile.title} variant="optional">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between hover:bg-muted/50">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {isOpen ? 'Skryť prepis' : 'Zobraziť prepis'}
            </span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 pt-4 border-t border-border/30">
          <MarkdownContent content={tile.content_md} />
        </CollapsibleContent>
      </Collapsible>
    </LessonTile>
  );
}
