import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Headphones, ClipboardList, BarChart3, Zap, ChevronRight, Play, CheckCircle2, MessageCircle, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseWithModulesAndLessons } from '@/hooks/useCourseData';
import { useCourseProgress } from '@/hooks/useProgress';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

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

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              ✨ Pilotný kurz zdarma
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in">
              <span className="gradient-text">{t.hero.title}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up">
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {user && progressData && progressData.completed > 0 ? (
                <Button size="xl" variant="gradient" onClick={handleContinueCta}>
                  {t.hero.ctaContinue}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button size="xl" variant="gradient" onClick={() => navigate('/kurzy/objavuj-ai')}>
                  {t.hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Button size="xl" variant="outline" onClick={() => navigate('/kurzy')}>
                {t.hero.ctaSecondary}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">
            {t.benefits.title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <GlassCard key={index} variant="hover" className="group">
                <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Course Preview Section */}
      {courseData && (
        <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">
              {t.coursePreview.title}
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <GlassCard padding="lg" className="mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Badge className="mb-3">{t.coursePreview.freeBadge}</Badge>
                    <h3 className="text-2xl font-display font-bold">{courseData.course.title}</h3>
                    <p className="text-muted-foreground mt-2">{courseData.course.description}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                  <span>{courseData.modules.length} {t.coursePreview.modules}</span>
                  <span>•</span>
                  <span>{courseData.totalLessons} {t.coursePreview.lessons}</span>
                </div>
                
                <div className="space-y-3">
                  {courseData.modules.slice(0, 3).map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {module.module_order}
                        </div>
                        <span className="font-medium">{module.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {module.lessons.length} {t.coursePreview.lessons}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-6" size="lg" variant="gradient" onClick={() => navigate('/kurzy/objavuj-ai')}>
                  {t.coursePreview.startFree}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </GlassCard>
            </div>
          </div>
        </section>
      )}

      {/* How it works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">
            {t.howItWorks.title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="text-6xl font-display font-bold text-primary/20 mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
                
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">
            {t.whatYouGet.title}
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <GlassCard>
              <ul className="space-y-4">
                {t.whatYouGet.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-8">
            {t.testimonials.title}
          </h2>
          <p className="text-center text-muted-foreground max-w-lg mx-auto">
            {t.testimonials.comingSoon}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32 bg-gradient-to-b from-transparent via-primary/5 to-transparent scroll-mt-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">
            {t.faq.title}
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass-card rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <GlassCard variant="gradient" padding="lg" className="max-w-4xl mx-auto text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {t.podcast.title}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t.podcast.description}
            </p>
            <Button size="lg" variant="outline">
              {t.podcast.cta}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </GlassCard>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            {t.finalCta.title}
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
            {t.finalCta.subtitle}
          </p>
          
          {user ? (
            progressData && progressData.completed > 0 ? (
              <Button size="xl" variant="gradient" onClick={handleContinueCta}>
                {t.hero.ctaContinue}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button size="xl" variant="gradient" onClick={() => navigate('/learn/zaklady-ai/1/1')}>
                {t.hero.ctaStart}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )
          ) : (
            <Button size="xl" variant="gradient" onClick={() => navigate('/kurzy/objavuj-ai')}>
              {t.finalCta.ctaStart}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      <Footer />
      <CookieConsent />
    </div>
  );
}
