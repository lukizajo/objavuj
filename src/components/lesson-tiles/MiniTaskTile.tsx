import { useState, useEffect } from 'react';
import { Check, Send } from 'lucide-react';
import { LessonTile, LessonTileData } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MiniTaskTileProps {
  tile: LessonTileData;
  lessonId: string;
  onComplete: () => void;
}

export function MiniTaskTile({ tile, lessonId, onComplete }: MiniTaskTileProps) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if already submitted
  useEffect(() => {
    if (!user || !tile.id) return;
    
    supabase
      .from('task_answers')
      .select('answer_text')
      .eq('user_id', user.id)
      .eq('task_id', tile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.answer_text) {
          setAnswer(data.answer_text);
          setIsSubmitted(true);
        }
      });
  }, [user, tile.id]);

  const handleSubmit = async () => {
    if (!user || !answer.trim()) return;
    
    setIsSaving(true);
    try {
      await supabase.from('task_answers').upsert([{
        user_id: user.id,
        task_id: tile.id,
        answer_text: answer.trim(),
      }], { onConflict: 'user_id,task_id' });
      
      setIsSubmitted(true);
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LessonTile 
      icon={tile.icon} 
      title={tile.title}
      variant="required"
      className="bg-gradient-to-br from-primary/10 to-accent/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Povinné
        </Badge>
        {isSubmitted && (
          <Badge className="bg-success/20 text-success border-success/30">
            <Check className="h-3 w-3 mr-1" />
            Odoslané
          </Badge>
        )}
      </div>
      
      {tile.body_md && (
        <div className="mb-4">
          <MarkdownContent content={tile.body_md} />
        </div>
      )}
      
      {user ? (
        <>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Napíšte svoju odpoveď..."
            className="min-h-24 mb-4"
            disabled={isSubmitted}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || !answer.trim() || isSubmitted}
          >
            {isSubmitted ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Odpoveď uložená
              </>
            ) : isSaving ? (
              'Ukladá sa...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Odoslať odpoveď
              </>
            )}
          </Button>
        </>
      ) : (
        <p className="text-muted-foreground italic">
          Pre odoslanie odpovede sa prihláste.
        </p>
      )}
    </LessonTile>
  );
}
