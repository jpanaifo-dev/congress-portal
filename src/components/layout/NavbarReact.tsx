import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#sobre-evento', label: 'Sobre el Evento' },
  { href: '#cronograma', label: 'Programa' },
  { href: '#ponentes', label: 'Ponentes' },
  { href: '#tarifas', label: 'Inversión' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacto', label: 'Contacto' },
  { href: '/registro', label: 'Registro' },
];

interface NavbarProps {
  logoUrl?: string;
  eventName?: string;
}

export const NavbarReact: React.FC<NavbarProps> = ({
  logoUrl = "/images/postgrado_brandwhite.webp",
  eventName = "Escuela de Postgrado UNAP"
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Determine initial theme based on class list
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const hasHero = document.getElementById('inicio') !== null;

    const handleScroll = () => {
      if (!hasHero) {
        setIsScrolled(true);
        return;
      }
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 ${isScrolled || isMenuOpen
      ? 'bg-[#07140F]/80 backdrop-blur-lg border-b border-white/5 py-3 shadow-md shadow-black/10'
      : 'bg-transparent border-b border-transparent py-5'
    }`;

  return (
    <>
      <header className={headerClass}>
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <a
            href="#inicio"
            className="flex items-center focus-visible:outline-2 focus-visible:outline-accent rounded-lg"
            aria-label="Volver al inicio"
          >
            <img
              src={logoUrl}
              alt={eventName}
              className="h-12 md:h-14 w-auto object-contain transition-transform hover:scale-[1.02] duration-300"
            />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isRegister = link.href === '#registro' || link.href === '/registro';
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`font-display text-[11px] tracking-widest uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary ${isRegister
                      ? 'border border-secondary/40 text-secondary hover:bg-primary hover:text-[#0D1F17] px-4 py-1.5 rounded-full font-bold shadow-sm shadow-secondary/5'
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Side Actions (Theme Toggle + Mobile Nav Toggle) */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle IconButton */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              aria-label="Cambiar tema de color"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full transition-all"
              aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              aria-expanded={isMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu (outside header to prevent theme pollution) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 top-[65px] bg-[#07140F]/95 backdrop-blur-xl border-t border-white/5 lg:hidden flex flex-col p-6 z-40"
            role="dialog"
            aria-label="Menú móvil"
          >
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link) => {
                const isRegister = link.href === '#registro' || link.href === '/registro';
                if (isRegister) return null;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="mobile-nav-link font-display text-[13px] font-bold tracking-widest uppercase text-white/70 hover:text-white py-3.5 border-b border-white/5 transition-colors"
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
            <div className="mt-auto mb-8">
              <a
                href="/registro"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center inline-block font-display font-bold text-xs uppercase tracking-widest text-[#0D1F17] bg-primary hover:bg-accent py-4 rounded-full transition-colors shadow-lg shadow-secondary/15"
              >
                Registrarse ahora
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
