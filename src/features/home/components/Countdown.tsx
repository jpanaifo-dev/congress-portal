import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Countdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Target Date: July 2, 2026 at 08:00:00 (Loreto Time, which is UTC-5)
    const targetDate = new Date('2026-07-02T08:00:00-05:00').getTime();

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
  }, []);

  if (!isClient || !timeLeft) {
    // Elegant placeholder matching layout to prevent layout shift during loading/hydration
    return (
      <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-lg mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-dark/40 border border-accent/10 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center animate-pulse">
            <span className="text-3xl md:text-5xl font-display font-extrabold text-white opacity-20">00</span>
            <span className="text-xs text-accent/40 uppercase tracking-widest mt-1">...</span>
          </div>
        ))}
      </div>
    );
  }

  const timeItems = [
    { label: 'Días', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Minutos', value: timeLeft.minutes },
    { label: 'Segundos', value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-lg mt-4">
      {timeItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative bg-dark/50 backdrop-blur-md border border-accent/15 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center group hover:border-secondary/30 transition-colors"
        >
          {/* Subtle Glow Overlay */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-2xl blur-md transition-opacity duration-300 pointer-events-none"></div>

          <div className="relative overflow-hidden h-10 sm:h-14 md:h-16 flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={item.value}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="text-2xl sm:text-4xl md:text-5xl font-display font-extrabold text-glow text-white"
              >
                {String(item.value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[10px] sm:text-xs text-accent font-semibold uppercase tracking-wider mt-1.5">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
