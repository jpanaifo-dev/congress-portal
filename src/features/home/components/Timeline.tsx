import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Award, BookOpen, Coffee, HelpCircle } from 'lucide-react';
import type { ScheduleActivity } from '../../../types';
import { nhost } from '../../../lib/nhost';

export const Timeline: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string>('day-1');

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const resp = await nhost.graphql.request<any>({
          query: `
            query GetActiveEditionDetails {
              editions(where: { is_active: { _eq: true } }) {
                id
                start_date
                end_date
                sessions(order_by: { start_time: asc }) {
                  id
                  title
                  description
                  type
                  start_time
                  end_time
                  location
                  session_speakers {
                    speaker {
                      id
                      full_name
                      specialty
                      photo_url
                    }
                  }
                }
              }
            }
          `
        });

        if (resp.body.errors && resp.body.errors.length > 0) {
          console.warn("GraphQL errors loading sessions:", resp.body.errors);
          setDbError(resp.body.errors[0].message);
        } else {
          const activeEd = resp.body.data?.editions?.[0];
          if (activeEd?.sessions && activeEd.sessions.length > 0) {
            setSessions(activeEd.sessions);
          }
        }
      } catch (err: any) {
        console.warn("Failed to load sessions from database:", err);
        setDbError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Group database sessions by date string
  let displaySchedule: any[] = [];
  
  if (sessions.length > 0) {
    const grouped: { [date: string]: any[] } = {};
    sessions.forEach(sess => {
      let dateKey = 'Fecha desconocida';
      try {
        const d = new Date(sess.start_time);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        const formatted = d.toLocaleDateString('es-ES', options);
        dateKey = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      } catch (e) {
        console.error(e);
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      let timeStr = '00:00';
      try {
        const start = new Date(sess.start_time);
        const end = new Date(sess.end_time);
        const formatTime = (date: Date) => {
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        };
        timeStr = `${formatTime(start)} - ${formatTime(end)}`;
      } catch (e) {
        console.error(e);
      }
      
      const speakerData = sess.session_speakers?.[0]?.speaker;
      
      grouped[dateKey].push({
        id: sess.id,
        time: timeStr,
        title: sess.title,
        description: sess.description || '',
        type: sess.type,
        speaker: speakerData ? {
          name: speakerData.full_name,
          specialty: speakerData.specialty,
          photoUrl: speakerData.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400'
        } : null
      });
    });
    
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const sessA = sessions.find(s => {
        const d = new Date(s.start_time);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        const formatted = d.toLocaleDateString('es-ES', options);
        const key = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        return key === a;
      });
      const sessB = sessions.find(s => {
        const d = new Date(s.start_time);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        const formatted = d.toLocaleDateString('es-ES', options);
        const key = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        return key === b;
      });
      if (sessA && sessB) {
        return new Date(sessA.start_time).getTime() - new Date(sessB.start_time).getTime();
      }
      return 0;
    });
    
    displaySchedule = sortedDates.map((dateStr, idx) => ({
      day: idx + 1,
      dateString: dateStr,
      activities: grouped[dateStr]
    }));
  }

  // Adjust activeDayIndex to remain within bounds
  const activeDayIndex = selectedBlock.startsWith('day-') 
    ? Math.min(Math.max(0, parseInt(selectedBlock.split('-')[1], 10) - 1), displaySchedule.length - 1)
    : 0;
  const currentDayData = displaySchedule[activeDayIndex] || displaySchedule[0];

  const getActivityIcon = (type: ScheduleActivity['type']) => {
    switch (type) {
      case 'keynote':
        return <Award className="w-5 h-5 text-secondary" />;
      case 'panel':
        return <BookOpen className="w-5 h-5 text-accent" />;
      case 'research':
        return <BookOpen className="w-5 h-5 text-secondary" />;
      case 'workshop':
        return <BookOpen className="w-5 h-5 text-accent" />;
      case 'break':
        return <Coffee className="w-5 h-5 text-light/40" />;
      case 'ceremony':
        return <Calendar className="w-5 h-5 text-light" />;
      default:
        return <HelpCircle className="w-5 h-5 text-light/40" />;
    }
  };

  const getTypeStyle = (type: ScheduleActivity['type']) => {
    switch (type) {
      case 'keynote':
        return 'bg-secondary/15 text-secondary border-secondary/25';
      case 'panel':
      case 'workshop':
        return 'bg-accent/15 text-accent border-accent/25';
      case 'research':
        return 'bg-primary/20 text-accent border-primary/30';
      case 'break':
        return 'bg-light/5 text-light/65 border-light/10';
      case 'ceremony':
        return 'bg-light/10 text-light border-light/20';
      default:
        return 'bg-light/5 text-light/65 border-light/10';
    }
  };

  const getGridColsClass = (count: number) => {
    if (count <= 1) return 'lg:grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'lg:grid-cols-2 max-w-3xl mx-auto';
    if (count === 3) return 'lg:grid-cols-3';
    return 'lg:grid-cols-4';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 bg-dark/40 backdrop-blur-md rounded-3xl border border-accent/10 p-8 w-full relative z-10">
        <svg className="w-8 h-8 text-secondary animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-light/60">Cargando cronograma científico...</span>
      </div>
    );
  }

  if (displaySchedule.length === 0) {
    return (
      <div className="w-full text-center py-16 bg-dark/40 backdrop-blur-md rounded-3xl border border-accent/10 p-8 flex flex-col items-center justify-center gap-4 relative z-10">
        <Calendar className="w-12 h-12 text-accent/40 mx-auto" />
        <h3 className="font-display font-bold text-lg text-light">No hay actividades registradas</h3>
        <p className="text-xs sm:text-sm text-light/65 max-w-md mx-auto text-center">
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
          } catch (e) {}

          return (
            <button
              key={blockKey}
              role="tab"
              aria-selected={isSelected}
              aria-controls="program-detail-panel"
              onClick={() => setSelectedBlock(blockKey)}
              className={`snap-start shrink-0 w-[290px] sm:w-auto relative min-h-[380px] rounded-3xl overflow-hidden border bg-dark/75 backdrop-blur-md flex flex-col justify-between p-6 text-left group transition-all duration-300 hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${isSelected
                  ? 'border-secondary shadow-[0_0_25px_rgba(76,175,80,0.25)] ring-2 ring-secondary/35 scale-[1.01]'
                  : 'border-accent/10 hover:border-secondary/40'
                }`}
            >
              <div className="flex items-center justify-between w-full text-accent/60 font-bold text-[10px] uppercase tracking-widest">
                <span>{monthName}</span>
                <span>{weekdayShort}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-7xl font-display font-black text-light text-glow leading-none">{dateNum}</span>

                <h3 className="font-display font-bold text-lg leading-tight text-light uppercase group-hover:text-secondary transition-colors mt-2">
                  DÍA {dayNumber}
                </h3>

                <p className="text-xs text-light/75 leading-relaxed">
                  {dayData.activities.length} {dayData.activities.length === 1 ? 'actividad programada' : 'actividades programadas'} para esta jornada.
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
        className="mt-8 border-t border-accent/10 pt-8"
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
                  <h4 className="text-accent font-display font-medium text-lg flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-secondary" />
                    {currentDayData.dateString}
                  </h4>
                </div>

                {/* Desktop Horizontal Timeline */}
                <div className="hidden lg:block overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  <div className="flex gap-6 min-w-max px-6 relative">
                    <div className="absolute top-[80px] left-0 right-0 h-[2px] bg-gradient-to-r from-primary/10 via-secondary/40 to-primary/10 -z-10"></div>

                    {currentDayData.activities.map((act, index) => {
                      const speaker = (act as any).speaker;
                      const isKeynote = act.type === 'keynote';

                      return (
                        <motion.div
                          key={act.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="w-[340px] flex flex-col items-center shrink-0 group"
                        >
                          <div className="h-20 flex items-center justify-center relative mb-4">
                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-dark transition-all duration-300 z-10 ${isKeynote || act.type === 'research'
                                ? 'border-secondary shadow-[0_0_15px_rgba(76,175,80,0.3)] group-hover:scale-110'
                                : 'border-accent/20 group-hover:border-accent/50'
                              }`}>
                              {getActivityIcon(act.type)}
                            </div>
                          </div>

                          {/* Individual Event Card */}
                          <div
                            className={`rounded-2xl p-5 relative w-full overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[240px] border ${isKeynote
                                ? 'border-[#fcd34d]/30 hover:border-secondary/40 shadow-lg'
                                : 'glass-card border-accent/10 hover:border-secondary/35 shadow-md'
                              }`}
                          >
                            {/* If Keynote, load a background image with dark overlay */}
                            {isKeynote && (
                              <>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=400&h=300')] bg-cover bg-center -z-10 group-hover:scale-103 transition-transform duration-500"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F17]/95 via-[#0D1F17]/80 to-[#0D1F17]/50 -z-10"></div>
                              </>
                            )}

                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className={`text-xs font-bold flex items-center gap-1.5 ${isKeynote ? 'text-[#fcd34d]' : 'text-secondary'}`}>
                                  <Clock className="w-3.5 h-3.5" />
                                  {act.time}
                                </span>
                                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border ${getTypeStyle(act.type)}`}>
                                  {act.type}
                                </span>
                              </div>

                              <h4 className={`font-display font-bold text-base leading-snug transition-colors mb-2 line-clamp-2 ${isKeynote ? 'text-[#fcd34d] text-glow group-hover:text-white' : 'text-light group-hover:text-secondary'
                                }`}>
                                {act.title}
                              </h4>
                              <p className="text-xs text-light/85 leading-relaxed mb-4 line-clamp-3">
                                {act.description}
                              </p>
                            </div>

                            {speaker && (
                              <div className="flex items-center gap-3 pt-3 border-t border-accent/10 mt-auto">
                                <img
                                  src={speaker.photoUrl}
                                  alt={speaker.name}
                                  className="w-8 h-8 rounded-full object-cover border border-secondary/20"
                                  loading="lazy"
                                />
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-xs font-semibold text-light truncate">{speaker.name}</span>
                                  <span className="text-[10px] text-accent truncate">{speaker.specialty}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile/Tablet Vertical Timeline */}
                <div className="lg:hidden flex flex-col relative px-4 pl-8 border-l border-primary/20 gap-8">
                  {currentDayData.activities.map((act, index) => {
                    const speaker = (act as any).speaker;
                    const isKeynote = act.type === 'keynote';

                    return (
                      <motion.div
                        key={act.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative flex flex-col gap-3 group"
                      >
                        <div className="absolute -left-[45px] top-1.5 flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center bg-dark z-10 ${isKeynote || act.type === 'research'
                              ? 'border-secondary text-secondary shadow-[0_0_10px_rgba(76,175,80,0.25)]'
                              : 'border-accent/20 text-light/50'
                            }`}>
                            {React.cloneElement(getActivityIcon(act.type), { className: 'w-4 h-4' })}
                          </div>
                        </div>

                        {/* Individual Card Content Mobile */}
                        <div
                          className={`rounded-xl p-5 relative overflow-hidden transition-all duration-300 border ${isKeynote
                              ? 'border-[#fcd34d]/30 shadow-lg'
                              : 'glass-card border-accent/10 hover:border-secondary/20 shadow-md'
                            }`}
                        >
                          {isKeynote && (
                            <>
                              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=400&h=300')] bg-cover bg-center -z-10"></div>
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F17]/95 via-[#0D1F17]/80 to-[#0D1F17]/50 -z-10"></div>
                            </>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span className={`text-xs font-bold flex items-center gap-1.5 ${isKeynote ? 'text-[#fcd34d]' : 'text-secondary'}`}>
                              <Clock className="w-4 h-4" />
                              {act.time}
                            </span>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${getTypeStyle(act.type)}`}>
                              {act.type}
                            </span>
                          </div>

                          <h4 className={`font-display font-bold text-base mb-1.5 leading-snug ${isKeynote ? 'text-[#fcd34d] text-glow' : 'text-light group-hover:text-secondary transition-colors'
                            }`}>
                            {act.title}
                          </h4>
                          <p className="text-xs text-light/85 leading-relaxed mb-4">
                            {act.description}
                          </p>

                          {speaker && (
                            <div className="flex items-center gap-3 pt-3 border-t border-accent/10">
                              <img
                                src={speaker.photoUrl}
                                alt={speaker.name}
                                className="w-9 h-9 rounded-full object-cover border border-secondary/20"
                                loading="lazy"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-light">{speaker.name}</span>
                                <span className="text-[10px] text-accent">{speaker.specialty}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
