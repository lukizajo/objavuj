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

// Starfield Background Component
function StarfieldBackground() {
  return (
    <div className="starfield-bg">
      {/* Nebula depth layer */}
      <div className="nebula-layer" />
      {/* Star layers with parallax */}
      <div className="stars-layer stars-far" />
      <div className="stars-layer stars-mid" />
      <div className="stars-layer stars-near" />
    </div>
  );
}

// Glass Card Component
function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  padding = 'p-10'
}: { 
  children: React.ReactNode; 
  className?: string; 
  hover?: boolean;
  padding?: string;
}) {
  return (
    <div 
      className={`glass-premium ${padding} ${className}`}
      style={hover ? {} : { pointerEvents: 'auto' }}
    >
      <div className="relative z-10">
        {children}
      </div>
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
        className="glass-premium p-8 max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-white pr-8">{episode.title}</h3>
            <button 
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {episode.description_md && (
            <p className="text-white/60 mb-8 text-sm leading-relaxed">{episode.description_md}</p>
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
      title: 'Bez zbytočného žargónu', 
      desc: 'Vysvetľujeme AI tak, ako by sme to povedali kamarátovi pri káve.' 
    },
    { 
      icon: Headphones, 
      title: 'Počúvaj a uč sa', 
      desc: 'Každá lekcia má audio verziu. Uč sa pri jazde, behu či varení.' 
    },
    { 
      icon: Target, 
      title: 'Praktický prístup', 
      desc: 'Nie teória, ale reálne použitie. Okamžite vidíš výsledky.' 
    },
  ];

  return (
    <div className="min-h-screen relative text-white">
      <StarfieldBackground />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        <Navbar />

        {/* HERO SECTION */}
        <section className="min-h-[92vh] flex items-center justify-center px-6 pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-10 leading-[1.1] tracking-tight">
              <span className="block text-white">Objav AI.</span>
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                Bez strachu.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/50 mb-14 max-w-2xl mx-auto leading-relaxed font-light">
              Vzdelávacia platforma pre tých, ktorí chcú AI konečne pochopiť. 
              Pokojne, vlastným tempom, bez prehltenýchinformácií.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button 
                onClick={handleStartCourse}
                className="glass-pill glass-pill-primary text-lg flex items-center justify-center gap-3"
              >
                {user && progressData && progressData.completed > 0 
                  ? 'Pokračovať v kurze' 
                  : 'Začať bezplatný kurz'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/kurzy')}
                className="glass-pill text-lg"
              >
                Prezrieť kurzy
              </button>
            </div>
          </div>
        </section>

        {/* WHY OBJAVUJ AI SECTION */}
        <section className="py-28 md:py-40 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-20 text-white tracking-tight">
              Prečo Objavuj AI?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {whyUs.map((item, index) => (
                <GlassCard key={index}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-8 border border-white/10">
                    <item.icon className="w-8 h-8 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM PREVIEW SECTION */}
        <section className="py-28 md:py-40 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-6 text-white tracking-tight">
              Nahliadni do platformy
            </h2>
            <p className="text-center text-white/40 mb-20 max-w-xl mx-auto text-lg">
              Jednoduché rozhranie, ktoré nerozbije tvoju koncentráciu
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Course Card Preview */}
              <GlassCard className="md:translate-y-12">
                <div className="w-full h-36 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 mb-6 flex items-center justify-center border border-white/5">
                  <Play className="w-14 h-14 text-white/40" />
                </div>
                <span className="text-xs text-indigo-400 font-medium tracking-wide uppercase">Kurz</span>
                <h4 className="text-xl font-semibold text-white mt-2">Základy AI</h4>
                <p className="text-sm text-white/40 mt-3">12 lekcií  •  4-6 hodín</p>
              </GlassCard>
              
              {/* Progress Preview */}
              <GlassCard>
                <span className="text-xs text-purple-400 font-medium tracking-wide uppercase">Tvoj pokrok</span>
                <h4 className="text-xl font-semibold text-white mt-2 mb-6">Pokračuj kde si skončil</h4>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Modul 1</span>
                      <span className="text-indigo-400">100%</span>
                    </div>
                    <div className="glass-progress h-2">
                      <div className="glass-progress-fill h-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Modul 2</span>
                      <span className="text-indigo-400">60%</span>
                    </div>
                    <div className="glass-progress h-2">
                      <div className="glass-progress-fill h-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </GlassCard>
              
              {/* Mobile Preview */}
              <GlassCard className="md:translate-y-12">
                <span className="text-xs text-violet-400 font-medium tracking-wide uppercase">Mobilná verzia</span>
                <h4 className="text-xl font-semibold text-white mt-2 mb-6">Uč sa kdekoľvek</h4>
                <div className="w-28 h-44 mx-auto rounded-2xl border-2 border-white/15 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center">
                  <Headphones className="w-10 h-10 text-white/30" />
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* FEATURED COURSE CARD */}
        {courseData && (
          <section className="py-28 md:py-40 px-6">
            <div className="max-w-3xl mx-auto">
              <GlassCard padding="p-12 md:p-14">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/25 mb-5">
                      ZDARMA
                    </span>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white">
                      {courseData.course.title}
                    </h3>
                    <p className="text-white/50 mt-4 max-w-lg leading-relaxed">
                      {courseData.course.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm text-white/40 mb-10">
                  <span>{courseData.modules.length} modulov</span>
                  <span>•</span>
                  <span>{courseData.totalLessons} lekcií</span>
                </div>
                
                <div className="space-y-4 mb-10">
                  {courseData.modules.slice(0, 3).map((module, idx) => (
                    <div 
                      key={module.id} 
                      className="flex items-center justify-between p-5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500/25 to-purple-500/25 flex items-center justify-center text-sm font-medium text-indigo-300 border border-white/10">
                          {module.module_order}
                        </div>
                        <span className="font-medium text-white">{module.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-white/35">{module.lessons.length} lekcií</span>
                        {idx === 0 ? (
                          <Unlock className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-white/25" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Glass Progress Bar */}
                {user && progressData && progressData.total > 0 && (
                  <div className="mb-10">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-white/50">Tvoj pokrok</span>
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
                  className="w-full glass-pill glass-pill-primary text-lg flex items-center justify-center gap-3"
                >
                  {user && progressData && progressData.completed > 0 
                    ? 'Pokračovať v kurze' 
                    : 'Začať kurz zdarma'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </GlassCard>
            </div>
          </section>
        )}

        {/* PODCAST SECTION */}
        {latestEpisodes.length > 0 && (
          <section className="py-28 md:py-40 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-6 text-white tracking-tight">
                Objavuj AI Podcast
              </h2>
              <p className="text-center text-white/40 mb-16 max-w-xl mx-auto text-lg">
                Rozhovory, novinky a tipy zo sveta umelej inteligencie
              </p>
              
              <GlassCard padding="p-3">
                <div className="divide-y divide-white/[0.06]">
                  {latestEpisodes.map((episode) => (
                    <button
                      key={episode.id}
                      onClick={() => setSelectedEpisode(episode)}
                      className="w-full p-6 flex items-center gap-5 hover:bg-white/[0.04] transition-colors rounded-xl text-left"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/25 to-purple-500/25 flex items-center justify-center flex-shrink-0 border border-white/10">
                        <Play className="w-6 h-6 text-indigo-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{episode.title}</h4>
                        <p className="text-sm text-white/40 truncate mt-1.5">
                          Epizóda {episode.episode_number}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/25" />
                    </button>
                  ))}
                </div>
              </GlassCard>
              
              <div className="text-center mt-10">
                <button 
                  onClick={() => navigate('/podcast')}
                  className="glass-pill"
                >
                  Všetky epizódy
                </button>
              </div>
            </div>
          </section>
        )}

        {/* FINAL CTA SECTION */}
        <section className="py-28 md:py-40 px-6">
          <div className="max-w-4xl mx-auto">
            <GlassCard padding="p-14 md:p-20" className="text-center">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 text-white tracking-tight">
                AI je konečne zrozumiteľná.
              </h2>
              <p className="text-xl text-white/45 mb-12 max-w-xl mx-auto leading-relaxed font-light">
                Chcem to objavovať pokojne, vlastným tempom.
              </p>
              
              <button 
                onClick={handleStartCourse}
                className="glass-pill glass-pill-primary text-lg inline-flex items-center gap-3"
              >
                {user && progressData && progressData.completed > 0 
                  ? 'Pokračovať v učení' 
                  : 'Začať objavovať'}
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
