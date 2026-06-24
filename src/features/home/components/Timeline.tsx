import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSessions, fetchConfig } from '../../../lib/supabase';

interface TimelineProps {
  editionId?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ editionId }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string>('day-1');
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        let activeEditionId = editionId;
        if (!activeEditionId) {
          const config = await fetchConfig();
          activeEditionId = config.edition?.id || "";
        }
        if (activeEditionId) {
          const list = await fetchSessions(activeEditionId);
          setSessions(list);
        }
      } catch (err: any) {
        console.warn("Failed to load sessions from database:", err);
        setDbError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [editionId]);

  // Reset showAll when switching blocks/days
  useEffect(() => {
    setShowAll(false);
  }, [selectedBlock]);

  // Group database sessions by date string
  let displaySchedule: any[] = [];

  if (sessions.length > 0) {
    const grouped: { [date: string]: any[] } = {};
    sessions.forEach(sess => {
      let dateKey = 'Fecha desconocida';

      let start_time_date = new Date();
      let end_time_date = new Date();
      try {
        if (sess.start_time && sess.start_time.includes('T')) {
          start_time_date = new Date(sess.start_time);
          end_time_date = new Date(sess.end_time);
        } else if (sess.session_date && sess.start_time) {
          start_time_date = new Date(`${sess.session_date}T${sess.start_time}`);
          end_time_date = new Date(`${sess.session_date}T${sess.end_time}`);
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        const formatted = start_time_date.toLocaleDateString('es-ES', options);
        dateKey = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      } catch (e) {
        console.error(e);
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      let timeStr = '00:00';
      try {
        const formatTime = (date: Date) => {
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        };
        timeStr = `${formatTime(start_time_date)} - ${formatTime(end_time_date)}`;
      } catch (e) {
        console.error(e);
      }

      const speakerData = sess.session_speakers?.[0]?.event_participants?.profile;
      const locationName = sess.facility?.name || sess.location || 'Auditorio Principal';

      grouped[dateKey].push({
        id: sess.id,
        time: timeStr,
        title: sess.title,
        description: sess.description || '',
        type: sess.type || sess.session_type || 'presentation',
        location: locationName,
        speaker: speakerData ? {
          name: `${speakerData.first_name} ${speakerData.last_name}`.trim(),
          specialty: speakerData.dedication || (speakerData.expertise_areas?.[0] || 'Investigador'),
          photoUrl: speakerData.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400'
        } : null
      });
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const sessA = sessions.find(s => {
        let st_date = new Date();
        try {
          if (s.start_time && s.start_time.includes('T')) {
            st_date = new Date(s.start_time);
          } else if (s.session_date && s.start_time) {
            st_date = new Date(`${s.session_date}T${s.start_time}`);
          }
        } catch { }
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        const formatted = st_date.toLocaleDateString('es-ES', options);
        const key = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        return key === a;
      });
      const sessB = sessions.find(s => {
        let st_date = new Date();
        try {
          if (s.start_time && s.start_time.includes('T')) {
            st_date = new Date(s.start_time);
          } else if (s.session_date && s.start_time) {
            st_date = new Date(`${s.session_date}T${s.start_time}`);
          }
        } catch { }
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        const formatted = st_date.toLocaleDateString('es-ES', options);
        const key = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        return key === b;
      });
      if (sessA && sessB) {
        let timeA = new Date();
        let timeB = new Date();
        try {
          if (sessA.start_time && sessA.start_time.includes('T')) {
            timeA = new Date(sessA.start_time);
          } else if (sessA.session_date && sessA.start_time) {
            timeA = new Date(`${sessA.session_date}T${sessA.start_time}`);
          }
          if (sessB.start_time && sessB.start_time.includes('T')) {
            timeB = new Date(sessB.start_time);
          } else if (sessB.session_date && sessB.start_time) {
            timeB = new Date(`${sessB.session_date}T${sessB.start_time}`);
          }
        } catch { }
        return timeA.getTime() - timeB.getTime();
      }
      return 0;
    });

    displaySchedule = sortedDates.map((dateStr, idx) => ({
      day: idx + 1,
      dateString: dateStr,
      activities: grouped[dateStr]
    }));
  }

  const activeDayIndex = selectedBlock.startsWith('day-')
    ? Math.min(Math.max(0, parseInt(selectedBlock.split('-')[1], 10) - 1), displaySchedule.length - 1)
    : 0;
  const currentDayData = displaySchedule[activeDayIndex] || displaySchedule[0];

  const getGridColsClass = (count: number) => {
    if (count <= 1) return 'lg:grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'lg:grid-cols-2 max-w-3xl mx-auto';
    if (count === 3) return 'lg:grid-cols-3';
    return 'lg:grid-cols-4';
  };

  const translateType = (type: string) => {
    switch (type) {
      case 'keynote': return 'Conferencia';
      case 'panel': return 'Mesa Redonda';
      case 'workshop': return 'Taller';
      case 'research': return 'Ponencia';
      case 'break': return 'Receso';
      case 'ceremony': return 'Ceremonia';
      default: return 'Actividad';
    }
  };

  if (loading) {
    return (
      <div className="w-full relative z-10 animate-pulse">
        {/* Selector Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col gap-4">
              <div className="flex justify-between">
                <div className="h-3 w-12 bg-foreground/10 rounded"></div>
                <div className="h-3 w-12 bg-foreground/10 rounded"></div>
              </div>
              <div className="h-12 w-16 bg-foreground/15 rounded-xl"></div>
              <div className="h-5 w-24 bg-foreground/15 rounded mt-2"></div>
              <div className="h-4 w-32 bg-foreground/10 rounded"></div>
            </div>
          ))}
        </div>

        {/* Date text skeleton */}
        <div className="flex justify-center mb-8">
          <div className="h-6 w-48 bg-foreground/15 rounded"></div>
        </div>

        {/* Skeleton Timeline Cards */}
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-5 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] w-full flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-foreground/15 rounded"></div>
                <div className="h-4 w-20 bg-foreground/10 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-foreground/15 rounded"></div>
              <div className="h-4 w-1/2 bg-foreground/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displaySchedule.length === 0) {
    return (
      <div className="w-full text-center py-16 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 relative z-10 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
        <h3 className="font-display font-bold text-lg text-foreground dark:text-white">No hay actividades registradas</h3>
        <p className="text-xs sm:text-sm text-foreground/70 dark:text-white/70 max-w-md mx-auto text-center">
          Actualmente no se encuentran sesiones de cronograma registradas en la base de datos para la edición activa del evento.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative z-10">
      {/* Cards Selector Row */}
      <div
        className={`flex overflow-x-auto snap-x gap-5 pb-8 lg:grid ${getGridColsClass(displaySchedule.length)} lg:gap-6 lg:overflow-visible lg:pb-12 container mx-auto px-1 scrollbar-thin scrollbar-thumb-primary/20`}
        role="tablist"
        aria-label="Bloques del programa académico"
      >
        {displaySchedule.map((dayData, idx) => {
          const dayNumber = idx + 1;
          const blockKey = `day-${dayNumber}`;
          const isSelected = selectedBlock === blockKey;

          let dateNum = String(dayNumber).padStart(2, '0');
          let weekdayShort = 'Día';
          let monthName = 'Julio';
          try {
            const parts = dayData.dateString.split(',');
            weekdayShort = parts[0]?.trim().slice(0, 3) || 'Día';
            const dateParts = parts[1]?.trim().split(' de ');
            dateNum = dateParts[0] || dateNum;
            monthName = dateParts[1] || monthName;

            // Capitalize
            weekdayShort = weekdayShort.charAt(0).toUpperCase() + weekdayShort.slice(1);
            monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
          } catch (e) { }

          return (
            <button
              key={blockKey}
              role="tab"
              aria-selected={isSelected}
              aria-controls="program-detail-panel"
              onClick={() => setSelectedBlock(blockKey)}
              className={`snap-start shrink-0 w-[290px] sm:w-auto relative min-h-[340px] rounded-3xl overflow-hidden flex flex-col justify-between p-6 text-left group transition-all duration-300 hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                isSelected
                  ? 'bg-secondary/15 border-2 border-secondary shadow-[0_0_25px_rgba(76,175,80,0.25)] ring-2 ring-secondary/35 scale-[1.01]'
                  : 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-secondary/40'
              }`}
            >
              <div className="flex items-center justify-between w-full text-foreground/60 dark:text-white/60 font-display font-semibold text-xs tracking-wider uppercase">
                <span>{monthName}</span>
                <span>{weekdayShort}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-7xl font-display font-black text-foreground dark:text-white leading-none my-6 select-none">
                  {dateNum}
                </span>

                <h3 className="font-display font-black text-lg leading-tight text-foreground dark:text-white uppercase mt-2">
                  DÍA {dayNumber}
                </h3>

                <p className="text-xs text-foreground/70 dark:text-white/70 leading-relaxed">
                  {dayData.activities.length} {dayData.activities.length === 1 ? 'actividad' : 'actividades'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Date panel / content section below cards */}
      <div
        id="program-detail-panel"
        role="tabpanel"
        className="mt-8 border-t border-black/10 dark:border-white/10 pt-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedBlock}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {selectedBlock.startsWith('day-') && currentDayData && (
              <div>
                <div className="text-center mb-8">
                  <h4 className="text-secondary dark:text-primary font-display font-bold text-lg">
                    {currentDayData.dateString}
                  </h4>
                </div>

                {/* Minimalist Vertical Timeline List (Desktop & Mobile) */}
                <div className="flex flex-col gap-5 w-full max-w-3xl mx-auto mt-6">
                  {currentDayData.activities.slice(0, showAll ? undefined : 3).map((act: any, index: number) => {
                    const speaker = act.speaker;
                    const isKeynote = act.type === 'keynote';

                    return (
                      <motion.div
                        key={act.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-2xl p-6 transition-all duration-300 border ${
                          isKeynote
                            ? 'bg-[#0D1F17] border-secondary/35 text-white shadow-lg'
                            : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/10 dark:border-white/10 hover:border-secondary/30 dark:hover:border-secondary/30 shadow-sm'
                        } flex flex-col gap-4`}
                      >
                        <div>
                          {/* Time & Type & Location row */}
                          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-bold">
                            <span className={isKeynote ? 'text-[#fcd34d]' : 'text-secondary dark:text-primary'}>
                              {act.time}
                            </span>
                            <span className="text-foreground/30 dark:text-white/30">•</span>
                            <span className="uppercase tracking-wider text-[9px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-foreground/80 dark:text-white/80 border border-black/10 dark:border-white/10">
                              {translateType(act.type)}
                            </span>
                            {act.location && (
                              <>
                                <span className="text-foreground/30 dark:text-white/30">•</span>
                                <span className="text-[10px] font-medium text-foreground/60 dark:text-white/60">
                                  {act.location}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className={`font-display font-black text-lg leading-snug ${isKeynote ? 'text-[#fcd34d]' : 'text-foreground dark:text-white'}`}>
                            {act.title}
                          </h4>

                          {/* Description */}
                          {act.description && (
                            <p className={`text-xs leading-relaxed mt-2 ${isKeynote ? 'text-white/80' : 'text-foreground/75 dark:text-white/75'}`}>
                              {act.description}
                            </p>
                          )}

                          {/* Speaker details */}
                          {speaker && (
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                              <img
                                src={speaker.photoUrl}
                                alt={speaker.name}
                                className="w-8 h-8 rounded-full object-cover border border-secondary/20 shrink-0"
                                loading="lazy"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-bold truncate ${isKeynote ? 'text-white' : 'text-foreground dark:text-white'}`}>
                                  {speaker.name}
                                </span>
                                <span className={`text-[10px] truncate ${isKeynote ? 'text-[#fcd34d]' : 'text-foreground/60 dark:text-white/60'}`}>
                                  {speaker.specialty}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* "Ver más" button */}
                  {currentDayData.activities.length > 3 && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-foreground dark:text-white border border-black/15 dark:border-white/15 hover:border-secondary/40 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 py-3.5 px-8 rounded-full transition-all duration-300 hover:shadow-lg active:scale-98 cursor-pointer shrink-0"
                      >
                        {showAll ? 'Ver menos' : `Ver más (${currentDayData.activities.length - 3} actividades más)`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
