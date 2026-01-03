import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { href: '/kurzy', label: t.nav.courses },
    { href: '/podcast', label: t.nav.podcast },
    { href: '/o-nas', label: t.nav.about },
    { href: '/faq', label: t.nav.faq },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold gradient-text">
              OBJAVUJ-AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1">
                  {language.toUpperCase()}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('sk')}>
                  🇸🇰 Slovenčina
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('cz')}>
                  🇨🇿 Čeština
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* User Menu or Login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-24 truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    {t.nav.dashboard}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    {t.nav.profile}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  {t.nav.login}
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  {t.nav.signup}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            isOpen ? 'max-h-96 pb-4' : 'max-h-0'
          )}
        >
          <div className="flex flex-col gap-2 pt-2">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-sm text-muted-foreground">Language:</span>
              <Button variant="ghost" size="sm" onClick={() => setLanguage('sk')}>SK</Button>
              <Button variant="ghost" size="sm" onClick={() => setLanguage('cz')}>CZ</Button>
              <Button variant="ghost" size="sm" onClick={() => setLanguage('en')}>EN</Button>
            </div>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-foreground"
                >
                  {t.nav.dashboard}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-foreground"
                >
                  {t.nav.profile}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-sm font-medium text-destructive text-left"
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3">
                <Button variant="outline" size="sm" onClick={() => { navigate('/login'); setIsOpen(false); }}>
                  {t.nav.login}
                </Button>
                <Button size="sm" onClick={() => { navigate('/register'); setIsOpen(false); }}>
                  {t.nav.signup}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
