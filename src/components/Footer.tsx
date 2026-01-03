import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="font-display text-xl font-bold gradient-text">
              OBJAVUJ-AI
            </Link>
            <p className="text-sm text-muted-foreground">
              Praktické vzdelávanie o umelej inteligencii pre každého.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Odkazy</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/kurzy" className="hover:text-foreground transition-colors">
                  {t.nav.courses}
                </Link>
              </li>
              <li>
                <Link to="/podcast" className="hover:text-foreground transition-colors">
                  {t.nav.podcast}
                </Link>
              </li>
              <li>
                <Link to="/o-nas" className="hover:text-foreground transition-colors">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Právne</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Zásady ochrany osobných údajov
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Obchodné podmienky
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-foreground transition-colors">
                  {t.cookie.policy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Kontakt</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:info@objavuj-ai.sk" className="hover:text-foreground transition-colors">
                  info@objavuj-ai.sk
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} OBJAVUJ-AI. Všetky práva vyhradené.
          </p>
        </div>
      </div>
    </footer>
  );
}
