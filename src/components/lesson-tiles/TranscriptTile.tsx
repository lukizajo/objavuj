import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LessonTile, LessonTileData } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TranscriptTileProps {
  tile: LessonTileData;
}

export function TranscriptTile({ tile }: TranscriptTileProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!tile.body_md) return null;
  
  return (
    <LessonTile icon={tile.icon} title={tile.title} variant="optional">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            {isOpen ? 'Skryť prepis' : 'Zobraziť prepis'}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <MarkdownContent content={tile.body_md} />
        </CollapsibleContent>
      </Collapsible>
    </LessonTile>
  );
}
