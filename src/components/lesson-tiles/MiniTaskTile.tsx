import { useState, useEffect } from 'react';
import { Check, Send } from 'lucide-react';
import { LessonTile, LessonTileData, TILE_ICONS } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MiniTask {
  id: string;
  lesson_id: string;
  title: string;
  prompt: string;
}

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
  const [miniTask, setMiniTask] = useState<MiniTask | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);

  // Fetch task data from tasks table (not mini_tasks - that table doesn't exist)
  useEffect(() => {
    if (!tile.mini_task_id) {
      setIsLoadingTask(false);
      return;
    }
    
    supabase
      .from('tasks')
      .select('id, lesson_id, prompt')
      .eq('id', tile.mini_task_id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching task:', error);
        }
        if (data) {
          setMiniTask({
            id: data.id,
            lesson_id: data.lesson_id,
            title: tile.title, // Use tile title since tasks table doesn't have title
            prompt: data.prompt,
          });
        }
        setIsLoadingTask(false);
      });
  }, [tile.mini_task_id, tile.title]);

  // Check if already submitted
  useEffect(() => {
    if (!user || !tile.mini_task_id) return;
    
    supabase
      .from('task_answers')
      .select('answer_text')
      .eq('user_id', user.id)
      .eq('task_id', tile.mini_task_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.answer_text) {
          setAnswer(data.answer_text);
          setIsSubmitted(true);
        }
      });
  }, [user, tile.mini_task_id]);

  const handleSubmit = async () => {
    if (!user || !answer.trim() || !tile.mini_task_id) return;
    
    setIsSaving(true);
    try {
      await supabase.from('task_answers').upsert([{
        user_id: user.id,
        task_id: tile.mini_task_id,
        answer_text: answer.trim(),
      }], { onConflict: 'user_id,task_id' });
      
      setIsSubmitted(true);
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoadingTask) {
    return (
      <LessonTile icon={tile.icon || TILE_ICONS.mini_task} title={tile.title} variant="required">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </LessonTile>
    );
  }

  // No mini_task_id or mini_task not found - show fallback with content_md if available
  if (!miniTask) {
    return (
      <LessonTile 
        icon={tile.icon || TILE_ICONS.mini_task} 
        title={tile.title}
        variant="required"
        className="bg-gradient-to-br from-primary/10 to-accent/5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="border-primary/40 text-primary">
            Povinné
          </Badge>
        </div>
        {tile.content_md ? (
          <MarkdownContent content={tile.content_md} />
        ) : (
          <p className="text-muted-foreground">Úloha nie je k dispozícii.</p>
        )}
      </LessonTile>
    );
  }

  return (
    <LessonTile 
      icon={tile.icon || TILE_ICONS.mini_task} 
      title={miniTask.title || tile.title}
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
      
      {/* Task prompt from mini_tasks table */}
      <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border/30">
        <MarkdownContent content={miniTask.prompt} />
      </div>
      
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
