import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface StickyBottomBannerProps {
  targetDateStr?: string;
  registrationUrl?: string;
}

export const StickyBottomBanner: React.FC<StickyBottomBannerProps> = ({
  targetDateStr = '2026-07-02T08:00:00-05:00',
  registrationUrl = '/registro'
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsClient(true);

    const targetDate = new Date(targetDateStr).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  if (!isClient) return null;

  // If the event has already started/ended, we can still show the banner but with 00 or choose to hide it.
  // We'll show 00 to remain consistent.
  const timeItems = [
    { label: 'Días', value: timeLeft?.days ?? 0 },
    { label: 'Horas', value: timeLeft?.hours ?? 0 },
    { label: 'Min', value: timeLeft?.minutes ?? 0 },
    { label: 'Seg', value: timeLeft?.seconds ?? 0 },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#07140F]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_35px_rgba(0,0,0,0.4)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
              
              {/* Countdown Timer with Vertical Dividers */}
              <div className="flex items-center gap-3 sm:gap-4 select-none shrink-0 w-full sm:w-auto justify-center md:justify-start">
                {timeItems.map((item, index) => (
                  <React.Fragment key={item.label}>
                    {index > 0 && (
                      <div className="h-7 w-px bg-white/10 self-center"></div>
                    )}
                    <div className="flex flex-col items-center min-w-[45px] sm:min-w-[50px]">
                      <div className="relative overflow-hidden h-7 flex items-center justify-center">
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={item.value}
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -15, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                            className="text-xl sm:text-2xl font-display font-black leading-none text-glow text-white"
                          >
                            {String(item.value).padStart(2, '0')}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <span className="text-[9px] text-secondary font-bold uppercase tracking-wider mt-0.5">
                        {item.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Alert Message/Announcement */}
              <div className="hidden lg:flex items-center gap-2 text-center my-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                <p className="text-[11px] xl:text-xs font-display font-bold uppercase tracking-wider text-white/90">
                  ¡REGÍSTRATE AHORA! ASEGURA TU PARTICIPACIÓN Y CERTIFICADO DEL III ENCUENTRO CIENTÍFICO
                </p>
              </div>
              
              {/* Fallback layout for medium screens (between md and lg) to keep text but smaller */}
              <div className="hidden md:flex lg:hidden items-center gap-1.5 text-center my-auto">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary"></span>
                </span>
                <p className="text-[10px] font-display font-bold uppercase tracking-wider text-white/85">
                  III ENCUENTRO CIENTÍFICO: REGÍSTRATE YA
                </p>
              </div>

              {/* Registration CTA Button */}
              <div className="shrink-0 w-full sm:w-auto flex justify-center md:justify-end">
                <a
                  href={registrationUrl}
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center font-display font-black text-[11px] uppercase tracking-widest text-[#0D1F17] bg-secondary hover:bg-accent px-8 py-3.5 rounded-full transition-all cursor-pointer shadow-md shadow-secondary/15 hover:shadow-secondary/25 active:scale-95 duration-200"
                >
                  Inscribirse ahora
                </a>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
