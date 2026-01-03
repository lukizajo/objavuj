import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <GlassCard padding="lg">
              <h1 className="text-3xl font-display font-bold gradient-text mb-6">
                Zásady ochrany osobných údajov
              </h1>
              
              <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">1. Úvod</h2>
                  <p>
                    Tieto zásady ochrany osobných údajov vysvetľujú, ako zhromažďujeme, 
                    používame a chránime vaše osobné údaje pri používaní platformy OBJAVUJ-AI.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">2. Aké údaje zhromažďujeme</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Email a meno pri registrácii</li>
                    <li>Pokrok v kurzoch a odpovede na úlohy</li>
                    <li>Analytické údaje o používaní platformy</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">3. Ako používame vaše údaje</h2>
                  <p>
                    Vaše údaje používame na poskytovanie služieb, sledovanie pokroku 
                    a zlepšovanie platformy. Vaše údaje nikdy nepredávame tretím stranám.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">4. Vaše práva</h2>
                  <p>
                    Máte právo na prístup, opravu alebo vymazanie vašich údajov. 
                    Kontaktujte nás na info@objavuj-ai.sk.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">5. Kontakt</h2>
                  <p>
                    Pre otázky týkajúce sa ochrany údajov nás kontaktujte na info@objavuj-ai.sk.
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
