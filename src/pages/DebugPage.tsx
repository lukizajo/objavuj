import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Database, Loader2 } from 'lucide-react';

interface DebugStats {
  connectionOk: boolean;
  supabaseUrl: string;
  lessonsCount: number;
  tilesCount: number;
  coursesCount: number;
  modulesCount: number;
}

interface LessonDebugInfo {
  lessonId: string;
  lessonTitle: string;
  tilesCount: number;
  tileTypes: Record<string, number>;
}

export default function DebugPage() {
  const { user } = useAuth();
  const { lessonId } = useParams();
  const [stats, setStats] = useState<DebugStats | null>(null);
  const [lessonInfo, setLessonInfo] = useState<LessonDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDebugInfo() {
      setIsLoading(true);
      setError(null);

      try {
        // Get masked Supabase URL
        const url = import.meta.env.VITE_SUPABASE_URL || 'Not configured';
        const maskedUrl = url.replace(/https:\/\/([a-z0-9]+)\./, 'https://***.');

        // Test connection with a simple query
        const { error: connError } = await supabase.from('courses').select('id').limit(1);
        const connectionOk = !connError;

        // Get counts
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true });

        const { count: tilesCount } = await supabase
          .from('lesson_tiles')
          .select('*', { count: 'exact', head: true });

        const { count: coursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true });

        const { count: modulesCount } = await supabase
          .from('modules')
          .select('*', { count: 'exact', head: true });

        setStats({
          connectionOk,
          supabaseUrl: maskedUrl,
          lessonsCount: lessonsCount || 0,
          tilesCount: tilesCount || 0,
          coursesCount: coursesCount || 0,
          modulesCount: modulesCount || 0,
        });

        // If lessonId is provided, get lesson-specific info
        if (lessonId) {
          const { data: lesson } = await supabase
            .from('lessons')
            .select('id, title')
            .eq('id', lessonId)
            .maybeSingle();

          if (lesson) {
            const { data: tiles } = await supabase
              .from('lesson_tiles')
              .select('type')
              .eq('lesson_id', lessonId);

            const tileTypes: Record<string, number> = {};
            tiles?.forEach(t => {
              tileTypes[t.type] = (tileTypes[t.type] || 0) + 1;
            });

            setLessonInfo({
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              tilesCount: tiles?.length || 0,
              tileTypes,
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDebugInfo();
  }, [lessonId]);

  // Only show in development or for admin users
  const isDev = import.meta.env.DEV;
  
  if (!isDev && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center">
          <GlassCard className="max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Prístup zamietnutý</h2>
            <p className="text-muted-foreground">
              Táto stránka je dostupná len pre prihlásených používateľov.
            </p>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Database className="h-6 w-6" />
            Debug Info
          </h1>

          {isLoading ? (
            <GlassCard className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </GlassCard>
          ) : error ? (
            <GlassCard className="border-destructive/50">
              <h3 className="font-semibold text-destructive mb-2">Chyba</h3>
              <pre className="text-xs bg-destructive/10 p-3 rounded-lg overflow-auto">
                {error}
              </pre>
            </GlassCard>
          ) : stats && (
            <div className="space-y-6">
              {/* Connection Status */}
              <GlassCard>
                <h3 className="font-semibold mb-4">Stav pripojenia</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Supabase URL:</span>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {stats.supabaseUrl}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pripojenie:</span>
                    {stats.connectionOk ? (
                      <Badge className="bg-success/20 text-success border-success/30">
                        <Check className="h-3 w-3 mr-1" />
                        OK
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <X className="h-3 w-3 mr-1" />
                        Chyba
                      </Badge>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Database Counts */}
              <GlassCard>
                <h3 className="font-semibold mb-4">Štatistiky databázy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{stats.coursesCount}</div>
                    <div className="text-sm text-muted-foreground">Kurzy</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{stats.modulesCount}</div>
                    <div className="text-sm text-muted-foreground">Moduly</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{stats.lessonsCount}</div>
                    <div className="text-sm text-muted-foreground">Lekcie</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{stats.tilesCount}</div>
                    <div className="text-sm text-muted-foreground">Tiles</div>
                  </div>
                </div>
              </GlassCard>

              {/* Lesson-specific info */}
              {lessonInfo && (
                <GlassCard>
                  <h3 className="font-semibold mb-4">Aktuálna lekcia</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {lessonInfo.lessonId}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Názov:</span>
                      <span className="font-medium">{lessonInfo.lessonTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Počet tiles:</span>
                      <Badge variant="secondary">{lessonInfo.tilesCount}</Badge>
                    </div>
                    {Object.keys(lessonInfo.tileTypes).length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm block mb-2">Typy tiles:</span>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(lessonInfo.tileTypes).map(([type, count]) => (
                            <Badge key={type} variant="outline">
                              {type}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Environment Info */}
              <GlassCard>
                <h3 className="font-semibold mb-4">Prostredie</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mode:</span>
                    <Badge variant={isDev ? 'secondary' : 'default'}>
                      {isDev ? 'Development' : 'Production'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">User:</span>
                    <span>{user ? user.email : 'Anonymous'}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
