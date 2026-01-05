import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PodcastHero, 
  EpisodeCard, 
  EpisodeList, 
  EpisodeModal 
} from '@/components/podcast';
import { 
  usePodcastEpisodes, 
  useFeaturedEpisode, 
  useLatestEpisodes,
  useRegularEpisodes,
  useSpecialEpisodes,
  type PodcastEpisode 
} from '@/hooks/usePodcastData';

export default function PodcastPage() {
  const { data: episodes, isLoading, error } = usePodcastEpisodes();
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);

  // Derived data
  const featuredEpisode = useFeaturedEpisode(episodes);
  const latestEpisodes = useLatestEpisodes(episodes, featuredEpisode?.id, 3);
  const regularEpisodes = useRegularEpisodes(episodes);
  const specialEpisodes = useSpecialEpisodes(episodes);

  // Find intro episode (episode 0 or 1, or marked as intro)
  const introEpisode = episodes?.find(ep => ep.episode_number === 0 || ep.episode_number === 1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <PodcastHero />

        <div className="container mx-auto px-4">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nepodarilo sa načítať epizódy. Skúste to neskôr.
              </p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && episodes && (
            <>
              {/* Featured + Intro Section */}
              {(featuredEpisode || introEpisode) && (
                <section className="py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {featuredEpisode && (
                      <div>
                        <h2 className="text-xl font-display font-bold mb-4">Aktuálna epizóda</h2>
                        <EpisodeCard 
                          episode={featuredEpisode} 
                          variant="featured"
                          onClick={() => setSelectedEpisode(featuredEpisode)}
                        />
                      </div>
                    )}
                    
                    {introEpisode && introEpisode.id !== featuredEpisode?.id && (
                      <div>
                        <h2 className="text-xl font-display font-bold mb-4">Úvodná epizóda</h2>
                        <EpisodeCard 
                          episode={introEpisode} 
                          variant="featured"
                          onClick={() => setSelectedEpisode(introEpisode)}
                        />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Latest Episodes */}
              {latestEpisodes.length > 0 && (
                <EpisodeList
                  episodes={latestEpisodes}
                  title="Posledné epizódy"
                  onEpisodeClick={setSelectedEpisode}
                />
              )}

              {/* All Episodes */}
              {regularEpisodes.length > 0 && (
                <EpisodeList
                  episodes={regularEpisodes}
                  title="Všetky epizódy"
                  onEpisodeClick={setSelectedEpisode}
                  variant="list"
                />
              )}

              {/* Special Episodes */}
              {specialEpisodes.length > 0 && (
                <EpisodeList
                  episodes={specialEpisodes}
                  title="Špeciálne epizódy"
                  onEpisodeClick={setSelectedEpisode}
                />
              )}

              {/* Empty State */}
              {episodes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Zatiaľ nemáme žiadne epizódy. Čoskoro pribudnú!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Episode Modal */}
      <EpisodeModal 
        episode={selectedEpisode} 
        onClose={() => setSelectedEpisode(null)} 
      />
    </div>
  );
}
