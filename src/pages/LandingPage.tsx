import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useMemo } from 'react';
import { ArrowRight, Sparkles, Headphones, ClipboardList, BarChart3, Zap, ChevronRight, CheckCircle2, MessageCircle, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseWithModulesAndLessons } from '@/hooks/useCourseData';
import { useCourseProgress } from '@/hooks/useProgress';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { Badge } from '@/components/ui/badge';

// Generate star positions deterministically
function generateStars(count: number) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: `${(i * 7.3) % 100}%`,
      top: `${(i * 11.7) % 100}%`,
      delay: `${(i * 0.3) % 4}s`,
      size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2.5 : 2,
    });
  }
  return stars;
}

// Cosmic background component
function CosmicBackground() {
  const stars = useMemo(() => generateStars(50), []);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 dawn-space-bg" />
      
      {/* Dawn light overlay */}
      <div className="dawn-light-overlay" />
      
      {/* Nebula clouds */}
      <div 
        className="nebula-cloud"
        style={{
          width: '600px',
          height: '400px',
          left: '-10%',
          top: '20%',
          background: 'radial-gradient(ellipse, rgba(140, 100, 200, 0.15) 0%, transparent 70%)',
          animationDelay: '0s',
        }}
      />
      <div 
        className="nebula-cloud"
        style={{
          width: '500px',
          height: '350px',
          right: '-5%',
          top: '40%',
          background: 'radial-gradient(ellipse, rgba(100, 140, 200, 0.12) 0%, transparent 70%)',
          animationDelay: '-20s',
        }}
      />
      <div 
        className="nebula-cloud"
        style={{
          width: '700px',
          height: '500px',
          left: '30%',
          bottom: '5%',
          background: 'radial-gradient(ellipse, rgba(200, 140, 160, 0.1) 0%, transparent 70%)',
          animationDelay: '-40s',
        }}
      />
      
      {/* Stars */}
      <div className="star-field">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>
      
      {/* Glowing points */}
      <div 
        className="glow-point"
        style={{
          width: '6px',
          height: '6px',
          left: '15%',
          top: '25%',
          background: 'rgba(180, 160, 255, 0.8)',
          animationDelay: '0s',
        }}
      />
      <div 
        className="glow-point"
        style={{
          width: '4px',
          height: '4px',
          right: '20%',
          top: '35%',
          background: 'rgba(160, 200, 255, 0.7)',
          animationDelay: '-2s',
        }}
      />
      <div 
        className="glow-point"
        style={{
          width: '5px',
          height: '5px',
          left: '70%',
          top: '60%',
          background: 'rgba(200, 180, 220, 0.6)',
          animationDelay: '-4s',
        }}
      />
    </div>
  );
}

// Glass Panel component
interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'recessed';
  hover?: boolean;
}

function GlassPanel({ children, className = '', variant = 'default', hover = false }: GlassPanelProps) {
  const baseClass = variant === 'elevated' 
    ? 'dawn-glass-elevated' 
    : variant === 'recessed' 
    ? 'dawn-glass-recessed' 
    : 'dawn-glass';
  const hoverClass = hover ? 'dawn-glass-hover' : '';
  
  return (
    <div className={`${baseClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}

// Glass Button component
interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'glass' | 'primary';
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

function GlassButton({ children, onClick, variant = 'glass', size = 'md', className = '' }: GlassButtonProps) {
  const sizeClasses = {
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const variantClass = variant === 'primary' ? 'dawn-primary-button' : 'dawn-glass-button';
  
  return (
    <button
      onClick={onClick}
      className={`${variantClass} ${sizeClasses[size]} rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: courseData } = useCourseWithModulesAndLessons('zaklady-ai');
  const { data: progressData } = useCourseProgress('zaklady-ai');

  const handlePrimaryCta = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleContinueCta = () => {
    if (progressData?.nextLesson) {
      navigate(`/learn/zaklady-ai/${progressData.nextLesson.moduleOrder}/${progressData.nextLesson.lessonOrder}`);
    } else {
      navigate('/learn/zaklady-ai/1/1');
    }
  };

  const benefits = [
    { icon: Sparkles, title: t.benefits.noJargon, desc: t.benefits.noJargonDesc },
    { icon: Headphones, title: t.benefits.voice, desc: t.benefits.voiceDesc },
    { icon: ClipboardList, title: t.benefits.tasks, desc: t.benefits.tasksDesc },
    { icon: BarChart3, title: t.benefits.progress, desc: t.benefits.progressDesc },
    { icon: Zap, title: t.benefits.modern, desc: t.benefits.modernDesc },
  ];

  const steps = [
    { step: '01', title: t.howItWorks.step1, desc: t.howItWorks.step1Desc },
    { step: '02', title: t.howItWorks.step2, desc: t.howItWorks.step2Desc },
    { step: '03', title: t.howItWorks.step3, desc: t.howItWorks.step3Desc },
  ];

  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-36 overflow-hidden">
          <div className="container relative mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <GlassPanel className="inline-block px-4 py-2 mb-8" variant="recessed">
                <span className="dawn-text text-sm font-medium tracking-wide">
                  Pilotny kurz zdarma
                </span>
              </GlassPanel>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight animate-fade-in">
                <span className="dawn-gradient-text">{t.hero.title}</span>
              </h1>
              
              <p className="text-xl md:text-2xl dawn-text mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up">
                {t.hero.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {user && progressData && progressData.completed > 0 ? (
                  <GlassButton size="xl" variant="primary" onClick={handleContinueCta}>
                    {t.hero.ctaContinue}
                    <ArrowRight className="h-5 w-5" />
                  </GlassButton>
                ) : (
                  <GlassButton size="xl" variant="primary" onClick={() => navigate('/kurzy/objavuj-ai')}>
                    {t.hero.cta}
                    <ArrowRight className="h-5 w-5" />
                  </GlassButton>
                )}
                <GlassButton size="xl" variant="glass" onClick={() => navigate('/kurzy')}>
                  {t.hero.ctaSecondary}
                </GlassButton>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-display dawn-heading text-center mb-16">
              {t.benefits.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <GlassPanel 
                  key={index} 
                  hover 
                  className="p-6"
                  variant={index === 0 ? 'elevated' : 'default'}
                >
                  <div className="h-12 w-12 rounded-xl dawn-primary-button flex items-center justify-center mb-5">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold dawn-heading mb-3">{benefit.title}</h3>
                  <p className="dawn-text-muted leading-relaxed">{benefit.desc}</p>
                </GlassPanel>
              ))}
            </div>
          </div>
        </section>

        {/* Course Preview Section */}
        {courseData && (
          <section className="py-20 md:py-32 relative">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-5xl font-display dawn-heading text-center mb-16">
                {t.coursePreview.title}
              </h2>
              
              <div className="max-w-4xl mx-auto">
                <GlassPanel variant="elevated" className="p-8 md:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <GlassPanel variant="recessed" className="inline-block px-3 py-1.5 mb-4">
                        <span className="dawn-text text-sm font-medium">{t.coursePreview.freeBadge}</span>
                      </GlassPanel>
                      <h3 className="text-2xl md:text-3xl font-display dawn-heading">{courseData.course.title}</h3>
                      <p className="dawn-text mt-3 leading-relaxed">{courseData.course.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm dawn-text-muted mb-8">
                    <span>{courseData.modules.length} {t.coursePreview.modules}</span>
                    <span className="opacity-50">|</span>
                    <span>{courseData.totalLessons} {t.coursePreview.lessons}</span>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {courseData.modules.slice(0, 3).map((module, idx) => (
                      <GlassPanel 
                        key={module.id} 
                        variant="recessed" 
                        className="p-4 flex items-center justify-between"
                        style={{ transform: `translateZ(${(3 - idx) * 10}px)` } as React.CSSProperties}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full dawn-glass-button flex items-center justify-center text-sm font-semibold text-white">
                            {module.module_order}
                          </div>
                          <span className="font-medium dawn-heading">{module.title}</span>
                        </div>
                        <span className="text-sm dawn-text-muted">
                          {module.lessons.length} {t.coursePreview.lessons}
                        </span>
                      </GlassPanel>
                    ))}
                  </div>
                  
                  <GlassButton 
                    variant="primary" 
                    size="lg" 
                    onClick={() => navigate('/kurzy/objavuj-ai')}
                    className="w-full"
                  >
                    {t.coursePreview.startFree}
                    <ArrowRight className="h-5 w-5" />
                  </GlassButton>
                </GlassPanel>
              </div>
            </div>
          </section>
        )}

        {/* How it works Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-display dawn-heading text-center mb-16">
              {t.howItWorks.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="relative text-center">
                  <div className="text-7xl font-display font-bold mb-6" style={{ color: 'rgba(140, 160, 255, 0.15)' }}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold dawn-heading mb-3">{step.title}</h3>
                  <p className="dawn-text-muted leading-relaxed">{step.desc}</p>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight className="hidden md:block absolute top-10 -right-4 h-8 w-8" style={{ color: 'rgba(140, 160, 255, 0.3)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you get Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-display dawn-heading text-center mb-16">
              {t.whatYouGet.title}
            </h2>
            
            <div className="max-w-2xl mx-auto">
              <GlassPanel className="p-8">
                <ul className="space-y-5">
                  {t.whatYouGet.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-5 w-5" style={{ color: 'rgba(120, 200, 150, 0.9)' }} />
                      </div>
                      <span className="dawn-text leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </div>
          </div>
        </section>

        {/* Podcast Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto relative">
              {/* Background floating panels for depth */}
              <GlassPanel 
                variant="recessed" 
                className="absolute -left-8 top-1/4 w-32 h-24 opacity-50 hidden lg:block"
                style={{ transform: 'rotate(-6deg) translateZ(-20px)' }}
              />
              <GlassPanel 
                variant="recessed" 
                className="absolute -right-8 bottom-1/4 w-28 h-20 opacity-40 hidden lg:block"
                style={{ transform: 'rotate(4deg) translateZ(-30px)' }}
              />
              
              <GlassPanel variant="elevated" className="p-10 md:p-12 text-center relative z-10">
                <div className="h-16 w-16 rounded-2xl dawn-glass-button flex items-center justify-center mx-auto mb-8">
                  <MessageCircle className="h-8 w-8" style={{ color: 'rgba(160, 140, 255, 0.9)' }} />
                </div>
                <h2 className="text-3xl md:text-4xl font-display dawn-heading mb-5">
                  {t.podcast.title}
                </h2>
                <p className="dawn-text mb-10 max-w-lg mx-auto leading-relaxed">
                  {t.podcast.description}
                </p>
                <GlassButton size="lg" variant="glass" onClick={() => navigate('/podcast')}>
                  {t.podcast.cta}
                  <ExternalLink className="h-4 w-4" />
                </GlassButton>
              </GlassPanel>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-36 relative">
          <div className="container mx-auto px-4">
            <GlassPanel variant="elevated" className="max-w-4xl mx-auto p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-5xl font-display dawn-heading mb-6 leading-tight">
                {t.finalCta.title}
              </h2>
              <p className="text-xl dawn-text mb-12 max-w-lg mx-auto leading-relaxed">
                {t.finalCta.subtitle}
              </p>
              
              {user ? (
                progressData && progressData.completed > 0 ? (
                  <GlassButton size="xl" variant="primary" onClick={handleContinueCta}>
                    {t.hero.ctaContinue}
                    <ArrowRight className="h-5 w-5" />
                  </GlassButton>
                ) : (
                  <GlassButton size="xl" variant="primary" onClick={() => navigate('/learn/zaklady-ai/1/1')}>
                    {t.hero.ctaStart}
                    <ArrowRight className="h-5 w-5" />
                  </GlassButton>
                )
              ) : (
                <GlassButton size="xl" variant="primary" onClick={() => navigate('/kurzy/objavuj-ai')}>
                  {t.finalCta.ctaStart}
                  <ArrowRight className="h-5 w-5" />
                </GlassButton>
              )}
            </GlassPanel>
          </div>
        </section>

        <Footer />
        <CookieConsent />
      </div>
    </div>
  );
}
