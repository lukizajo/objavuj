import { Headphones, Mic } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

export function PodcastHero() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard variant="gradient" padding="lg" className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Headphones className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 gradient-text">
              OBJAVUJ – AI Podcast
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Podcast, ktorý ti pomôže pochopiť svet umelej inteligencie. 
              Jednoducho, prakticky a bez zbytočného technického žargónu.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mic className="h-4 w-4" />
              <span>Nové epizódy každý týždeň na Spotify</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
