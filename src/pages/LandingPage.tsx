import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Headphones, Target, Play, Lock, Unlock, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseWithModulesAndLessons } from '@/hooks/useCourseData';
import { useCourseProgress } from '@/hooks/useProgress';
import { usePodcastEpisodes, useLatestEpisodes, getSpotifyEmbedUrl } from '@/hooks/usePodcastData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';

// Aurora Background Component
function AuroraBackground() {
  return (
    <div className="aurora-bg">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
    </div>
  );
}

// Glass Card Component
function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  padding = 'p-8'
}: { 
  children: React.ReactNode; 
  className?: string; 
  hover?: boolean;
  padding?: string;
}) {
  return (
    <div className={`glass-premium ${hover ? '' : 'hover:transform-none hover:shadow-none'} ${padding} ${className}`}>
      {children}
    </div>
  );
}

// Podcast Modal
function PodcastModal({ 
  episode, 
  onClose 
}: { 
  episode: { title: string; spotify_episode_url: string; description_md: string | null } | null;
  onClose: () => void;
}) {
  if (!episode) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay"
      onClick={onClose}
    >
      <div 
        className="glass-premium p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-white pr-8">{episode.title}</h3>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {episode.description_md && (
          <p className="text-white/70 mb-6 text-sm">{episode.description_md}</p>
        )}
        <iframe
          src={getSpotifyEmbedUrl(episode.spotify_episode_url)}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: courseData } = useCourseWithModulesAndLessons('objavuj-ai');
  const { data: progressData } = useCourseProgress('objavuj-ai');
  const { data: podcastEpisodes } = usePodcastEpisodes();
  const latestEpisodes = useLatestEpisodes(podcastEpisodes, undefined, 4);
  const [selectedEpisode, setSelectedEpisode] = useState<typeof latestEpisodes[0] | null>(null);

  const handleStartCourse = () => {
    if (user && progressData && progressData.completed > 0) {
      if (progressData.nextLesson) {
        navigate(`/learn/objavuj-ai/${progressData.nextLesson.moduleOrder}/${progressData.nextLesson.lessonOrder}`);
      }
    } else {
      navigate('/kurzy/objavuj-ai');
    }
  };

  const whyUs = [
    { 
      icon: Sparkles, 
      title: 'Bez zbytocneho zargonu', 
      desc: 'Vysvetlujeme AI tak, ako by sme to povedali kamaratovi pri kave.' 
    },
    { 
      icon: Headphones, 
      title: 'Pocuvaj a ucz sa', 
      desc: 'Kazda lekcia ma audio verziu. Ucz sa pri jazde, behu ci vareni.' 
    },
    { 
      icon: Target, 
      title: 'Prakticky pristup', 
      desc: 'Nie teoria, ale realne pouzitie. Okamzite vidis vysledky.' 
    },
  ];

  return (
    <div className="min-h-screen relative text-white">
      <AuroraBackground />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        <Navbar />

        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex items-center justify-center px-4 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 leading-tight">
              <span className="block text-white/90">Objav AI.</span>
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                Bez strachu.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Vzdelavacia platforma pre tych, ktori chcu AI konecne pochopit. 
              Pokojne, vlastnym tempom, bez prehltenych informacii.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartCourse}
                className="glass-pill glass-pill-primary text-lg flex items-center justify-center gap-2"
              >
                {user && progressData && progressData.completed > 0 
                  ? 'Pokracovat v kurze' 
                  : 'Zacat bezplatny kurz'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/kurzy')}
                className="glass-pill text-lg"
              >
                Prezriet kurzy
              </button>
            </div>
          </div>
        </section>

        {/* WHY OBJAVUJ AI SECTION */}
        <section className="py-24 md:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-16 text-white/90">
              Preco Objavuj AI?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {whyUs.map((item, index) => (
                <GlassCard key={index}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM PREVIEW SECTION */}
        <section className="py-24 md:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-6 text-white/90">
              Nahliadni do platformy
            </h2>
            <p className="text-center text-white/50 mb-16 max-w-xl mx-auto">
              Jednoduche rozhranie, ktore nerozbije tvoju koncentraciu
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course Card Preview */}
              <GlassCard className="md:translate-y-8">
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 mb-4 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white/50" />
                </div>
                <span className="text-xs text-indigo-400 font-medium">KURZ</span>
                <h4 className="text-lg font-semibold text-white mt-1">Zaklady AI</h4>
                <p className="text-sm text-white/50 mt-2">12 lekcii  ~  4-6 hodin</p>
              </GlassCard>
              
              {/* Progress Preview */}
              <GlassCard>
                <span className="text-xs text-purple-400 font-medium">TVOJ POKROK</span>
                <h4 className="text-lg font-semibold text-white mt-1 mb-4">Pokracuj kde si skoncil</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">Modul 1</span>
                      <span className="text-indigo-400">100%</span>
                    </div>
                    <div className="glass-progress h-2">
                      <div className="glass-progress-fill h-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">Modul 2</span>
                      <span className="text-indigo-400">60%</span>
                    </div>
                    <div className="glass-progress h-2">
                      <div className="glass-progress-fill h-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </GlassCard>
              
              {/* Mobile Preview */}
              <GlassCard className="md:translate-y-8">
                <span className="text-xs text-violet-400 font-medium">MOBILNA VERZIA</span>
                <h4 className="text-lg font-semibold text-white mt-1 mb-4">Ucz sa kdekolkvek</h4>
                <div className="w-24 h-40 mx-auto rounded-2xl border-2 border-white/20 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center">
                  <Headphones className="w-8 h-8 text-white/40" />
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* FEATURED COURSE CARD */}
        {courseData && (
          <section className="py-24 md:py-32 px-4">
            <div className="max-w-3xl mx-auto">
              <GlassCard padding="p-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-500/30 mb-4">
                      ZDARMA
                    </span>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white">
                      {courseData.course.title}
                    </h3>
                    <p className="text-white/60 mt-3 max-w-lg">
                      {courseData.course.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm text-white/50 mb-8">
                  <span>{courseData.modules.length} modulov</span>
                  <span>|</span>
                  <span>{courseData.totalLessons} lekcii</span>
                </div>
                
                <div className="space-y-3 mb-8">
                  {courseData.modules.slice(0, 3).map((module, idx) => (
                    <div 
                      key={module.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-sm font-medium text-indigo-300">
                          {module.module_order}
                        </div>
                        <span className="font-medium text-white">{module.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/40">{module.lessons.length} lekcii</span>
                        {idx === 0 ? (
                          <Unlock className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-white/30" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Glass Progress Bar */}
                {user && progressData && progressData.total > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Tvoj pokrok</span>
                      <span className="text-indigo-400">{Math.round((progressData.completed / progressData.total) * 100)}%</span>
                    </div>
                    <div className="glass-progress h-3">
                      <div 
                        className="glass-progress-fill h-full" 
                        style={{ width: `${(progressData.completed / progressData.total) * 100}%` }} 
                      />
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleStartCourse}
                  className="w-full glass-pill glass-pill-primary text-lg flex items-center justify-center gap-2"
                >
                  {user && progressData && progressData.completed > 0 
                    ? 'Pokracovat v kurze' 
                    : 'Zacat kurz zdarma'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </GlassCard>
            </div>
          </section>
        )}

        {/* PODCAST SECTION */}
        {latestEpisodes.length > 0 && (
          <section className="py-24 md:py-32 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-6 text-white/90">
                Objavuj AI Podcast
              </h2>
              <p className="text-center text-white/50 mb-12 max-w-xl mx-auto">
                Rozhovory, novinky a tipy zo sveta umelej inteligencie
              </p>
              
              <GlassCard padding="p-2">
                <div className="divide-y divide-white/10">
                  {latestEpisodes.map((episode) => (
                    <button
                      key={episode.id}
                      onClick={() => setSelectedEpisode(episode)}
                      className="w-full p-6 flex items-center gap-4 hover:bg-white/5 transition-colors rounded-xl text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <Play className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{episode.title}</h4>
                        <p className="text-sm text-white/50 truncate mt-1">
                          Epizoda {episode.episode_number}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/30" />
                    </button>
                  ))}
                </div>
              </GlassCard>
              
              <div className="text-center mt-8">
                <button 
                  onClick={() => navigate('/podcast')}
                  className="glass-pill"
                >
                  Vsetky epizody
                </button>
              </div>
            </div>
          </section>
        )}

        {/* FINAL CTA SECTION */}
        <section className="py-24 md:py-32 px-4">
          <div className="max-w-4xl mx-auto">
            <GlassCard padding="p-12 md:p-16" className="text-center">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
                AI je konecne zrozumitelna.
              </h2>
              <p className="text-xl text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
                Chcem to objavovat pokojne, vlastnym tempom.
              </p>
              
              <button 
                onClick={handleStartCourse}
                className="glass-pill glass-pill-primary text-lg inline-flex items-center gap-2"
              >
                {user && progressData && progressData.completed > 0 
                  ? 'Pokracovat v uceni' 
                  : 'Zacat objavovat'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </GlassCard>
          </div>
        </section>

        <Footer />
        <CookieConsent />
      </div>
      
      {/* Podcast Modal */}
      <PodcastModal 
        episode={selectedEpisode} 
        onClose={() => setSelectedEpisode(null)} 
      />
    </div>
  );
}
