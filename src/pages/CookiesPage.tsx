import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/ui/glass-card';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <GlassCard padding="lg">
              <h1 className="text-3xl font-display font-bold gradient-text mb-6">
                Zásady používania cookies
              </h1>
              
              <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">Čo sú cookies?</h2>
                  <p>
                    Cookies sú malé textové súbory, ktoré sa ukladajú vo vašom prehliadači 
                    pri návšteve webových stránok.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">Aké cookies používame</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Nevyhnutné cookies:</strong> Potrebné pre fungovanie platformy</li>
                    <li><strong>Analytické cookies:</strong> Pomáhajú nám pochopiť, ako používate platformu</li>
                    <li><strong>Funkčné cookies:</strong> Ukladajú vaše preferencie (jazyk, téma)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">Ako spravovať cookies</h2>
                  <p>
                    Cookies môžete spravovať v nastaveniach vášho prehliadača. 
                    Niektoré funkcie platformy však nemusia fungovať správne bez cookies.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-3">Kontakt</h2>
                  <p>
                    Pre otázky týkajúce sa cookies nás kontaktujte na info@objavuj-ai.sk.
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
