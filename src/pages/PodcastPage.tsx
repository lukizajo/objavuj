import { ExternalLink, Headphones } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

export default function PodcastPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <GlassCard padding="lg" className="space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Headphones className="h-10 w-10 text-primary" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
                {t.podcast.title}
              </h1>
              
              <p className="text-lg text-muted-foreground">
                {t.podcast.description}
              </p>
              
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => window.open('https://open.spotify.com', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {t.podcast.cta}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Spotify • Apple Podcasts • YouTube
              </p>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
