import { useState, useEffect } from 'react';
import { Check, X, HelpCircle } from 'lucide-react';
import { LessonTile, LessonTileData } from './LessonTile';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

interface MiniQuizTileProps {
  tile: LessonTileData;
  lessonId: string;
  onComplete: () => void;
}

export function MiniQuizTile({ tile, lessonId, onComplete }: MiniQuizTileProps) {
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parse quiz data from body_json
  const quizData: QuizQuestion | null = tile.body_json ? (tile.body_json as QuizQuestion) : null;

  // Check if already attempted
  useEffect(() => {
    if (!user || !tile.id) return;
    
    supabase
      .from('quiz_attempts')
      .select('score, details_json')
      .eq('user_id', user.id)
      .eq('quiz_id', tile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setIsSubmitted(true);
          setIsCorrect(data.score === 1);
          const details = data.details_json as { selected_index?: number } | null;
          if (details?.selected_index !== undefined) {
            setSelectedIndex(details.selected_index);
          }
        }
      });
  }, [user, tile.id]);

  const handleSubmit = async () => {
    if (!user || selectedIndex === null || !quizData) return;
    
    setIsSaving(true);
    const correct = selectedIndex === quizData.correct_index;
    
    try {
      await supabase.from('quiz_attempts').upsert([{
        user_id: user.id,
        quiz_id: tile.id,
        score: correct ? 1 : 0,
        details_json: { selected_index: selectedIndex },
      }], { onConflict: 'user_id,quiz_id' });
      
      setIsSubmitted(true);
      setIsCorrect(correct);
      if (correct) {
        onComplete();
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!quizData) {
    return (
      <LessonTile icon={tile.icon} title={tile.title} variant="required">
        <p className="text-muted-foreground">Kvíz nie je k dispozícii.</p>
      </LessonTile>
    );
  }

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
          <Badge className={cn(
            isCorrect 
              ? "bg-success/20 text-success border-success/30" 
              : "bg-destructive/20 text-destructive border-destructive/30"
          )}>
            {isCorrect ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Správne
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Nesprávne
              </>
            )}
          </Badge>
        )}
      </div>

      <div className="mb-4">
        <p className="font-medium text-foreground mb-4">{quizData.question}</p>
        
        <div className="space-y-2">
          {quizData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isSubmitted && setSelectedIndex(index)}
              disabled={isSubmitted}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all duration-200",
                "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20",
                selectedIndex === index && !isSubmitted && "border-primary bg-primary/10",
                isSubmitted && index === quizData.correct_index && "border-success bg-success/10",
                isSubmitted && selectedIndex === index && index !== quizData.correct_index && "border-destructive bg-destructive/10",
                !isSubmitted && selectedIndex !== index && "border-border bg-secondary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                  selectedIndex === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {isSubmitted && index === quizData.correct_index && (
                  <Check className="h-5 w-5 text-success" />
                )}
                {isSubmitted && selectedIndex === index && index !== quizData.correct_index && (
                  <X className="h-5 w-5 text-destructive" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {isSubmitted && quizData.explanation && (
        <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Vysvetlenie</span>
          </div>
          <MarkdownContent content={quizData.explanation} />
        </div>
      )}

      {user ? (
        !isSubmitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || selectedIndex === null}
          >
            {isSaving ? 'Overuje sa...' : 'Odoslať odpoveď'}
          </Button>
        )
      ) : (
        <p className="text-muted-foreground italic">
          Pre odpoveď na kvíz sa prihláste.
        </p>
      )}

      {isSubmitted && !isCorrect && (
        <Button 
          variant="outline" 
          onClick={() => {
            setIsSubmitted(false);
            setSelectedIndex(null);
          }}
        >
          Skúsiť znova
        </Button>
      )}
    </LessonTile>
  );
}
