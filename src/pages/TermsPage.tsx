import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <GlassCard padding="lg">
              <h1 className="text-3xl font-display font-bold gradient-text mb-6">
                Obchodné podmienky
              </h1>
              
              <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">1. Úvodné ustanovenia</h2>
                  <p>
                    Tieto obchodné podmienky upravujú vzťahy medzi prevádzkovateľom 
                    platformy OBJAVUJ-AI a jej používateľmi.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">2. Registrácia a účet</h2>
                  <p>
                    Pre využívanie niektorých funkcií platformy je potrebná registrácia. 
                    Ste povinní poskytnúť pravdivé údaje a chrániť svoje prihlasovacie údaje.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">3. Obsah a licencia</h2>
                  <p>
                    Všetok obsah na platforme je chránený autorským právom. 
                    Získavate licenciu na osobné, nekomerčné použitie obsahu.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">4. Platby</h2>
                  <p>
                    Bezplatné kurzy sú dostupné bez poplatkov. 
                    Prémiové moduly budú dostupné za poplatok (bude upresnené).
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">5. Záverečné ustanovenia</h2>
                  <p>
                    Tieto podmienky sa riadia právnym poriadkom Slovenskej republiky.
                  </p>
                </section>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
