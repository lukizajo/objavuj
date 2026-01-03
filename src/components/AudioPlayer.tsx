import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { MarkdownContent } from './MarkdownContent';

interface AudioPlayerProps {
  audioUrl: string;
  transcript?: string | null;
  onTimeUpdate?: (currentTime: number) => void;
  initialTime?: number;
}

export function AudioPlayer({ audioUrl, transcript, onTimeUpdate, initialTime = 0 }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);

  // Set initial time when audio loads
  useEffect(() => {
    if (audioRef.current && initialTime > 0) {
      audioRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      onTimeUpdate?.(audioRef.current.currentTime);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleSpeedChange = useCallback(() => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const newSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }, [playbackSpeed]);

  const handleRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card rounded-xl border border-border/40 overflow-hidden">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Player controls */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handlePlayPause}
            className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-primary" />
            ) : (
              <Play className="h-5 w-5 text-primary ml-0.5" />
            )}
          </Button>
          
          {/* Progress bar */}
          <div className="flex-1 space-y-1">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Speed button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSpeedChange}
            className="text-xs font-medium min-w-[50px]"
          >
            {playbackSpeed}x
          </Button>
          
          {/* Restart button */}
          <Button variant="ghost" size="icon" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {/* Transcript toggle */}
          {transcript && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowTranscript(!showTranscript)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Prepis</span>
              {showTranscript ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Transcript panel */}
      {transcript && showTranscript && (
        <div className="border-t border-border/40 p-4 bg-secondary/30 max-h-64 overflow-y-auto">
          <MarkdownContent content={transcript} className="text-sm" />
        </div>
      )}
    </div>
  );
}
