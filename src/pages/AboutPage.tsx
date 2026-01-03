import { Heart, Target, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: 'Prístupnosť',
      description: 'Veríme, že AI vzdelávanie by malo byť dostupné pre každého, bez ohľadu na technické znalosti.',
    },
    {
      icon: Target,
      title: 'Praktickosť',
      description: 'Zameriavame sa na reálne využitie AI v každodennom živote a práci.',
    },
    {
      icon: Users,
      title: 'Komunita',
      description: 'Budujeme komunitu ľudí, ktorí sa navzájom podporujú v objavovaní AI.',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-4">
                O nás
              </h1>
              <p className="text-lg text-muted-foreground">
                Sme tím nadšencov, ktorí veria v silu vzdelávania.
              </p>
            </div>

            {/* Story */}
            <GlassCard padding="lg" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Náš príbeh</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  OBJAVUJ-AI vzniklo z jednoduchej myšlienky: urobiť umelú inteligenciu 
                  prístupnou pre každého. Videli sme, ako sa ľudia okolo nás boja AI 
                  alebo ju jednoducho nechápu.
                </p>
                <p>
                  Rozhodli sme sa to zmeniť. Vytvorili sme platformu, ktorá vysvetľuje 
                  komplexné koncepty jednoducho, prakticky a zábavne. Bez technického 
                  žargónu, s reálnymi príkladmi.
                </p>
                <p>
                  Naša misia je pomôcť tisícom ľudí pochopiť a využívať AI vo svojej 
                  práci aj osobnom živote. Či už ste učiteľ, podnikateľ, študent alebo 
                  jednoducho zvedavý človek – máme niečo pre vás.
                </p>
              </div>
            </GlassCard>

            {/* Values */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {values.map((value, index) => (
                <GlassCard key={index} padding="md" className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </GlassCard>
              ))}
            </div>

            {/* Contact */}
            <GlassCard padding="lg" className="text-center">
              <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
              <p className="text-muted-foreground mb-4">
                Máte otázky alebo návrhy? Ozvite sa nám!
              </p>
              <p className="text-primary font-medium">
                info@objavuj-ai.sk
              </p>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
