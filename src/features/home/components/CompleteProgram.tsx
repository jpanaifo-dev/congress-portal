import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronDown, ChevronUp, LayoutGrid, Table } from 'lucide-react';
import { fetchActivities, fetchConfig } from '../../../lib/supabase';

interface CompleteProgramProps {
  editionId?: string;
}

export const CompleteProgram: React.FC<CompleteProgramProps> = ({ editionId }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<{ [id: string]: boolean }>({});
  const [selectedBlock, setSelectedBlock] = useState<string>('day-1');
  const [showAll, setShowAll] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    const loadSessions = async () => {
      try {
        let activeEditionId = editionId;
        if (!activeEditionId) {
          const config = await fetchConfig();
          activeEditionId = config.edition?.id || "";
        }
        if (activeEditionId) {
          const list = await fetchActivities(activeEditionId);
          setSessions(list);
        }
      } catch (err: any) {
        console.warn("Failed to load program sessions from database:", err);
        setDbError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [editionId]);

  useEffect(() => {
    setShowAll(false);
  }, [selectedBlock]);

  const toggleExpand = (id: string) => {
    setExpandedSessions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  let displaySchedule: any[] = [];

  if (sessions.length > 0) {
    const grouped: { [date: string]: any[] } = {};
    sessions.forEach((sess: any) => {
      let dateKey = 'Fecha del Evento';

      let start_time_date = new Date();
      let end_time_date = new Date();
      try {
        start_time_date = new Date(sess.start_time);
        end_time_date = new Date(sess.end_time);
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

      const speakerProfile = sess.speaker?.profile;
      const locationName = sess.custom_location || 'Auditorio Principal';

      grouped[dateKey].push({
        id: sess.id,
        time: timeStr,
        title: sess.activity_name,
        description: sess.description || '',
        type: sess.activity_mode || 'presentation',
        location: locationName,
        speaker: speakerProfile ? {
          name: `${speakerProfile.first_name} ${speakerProfile.last_name}`.trim(),
          specialty: speakerProfile.dedication || (speakerProfile.expertise_areas?.[0] || 'Investigador'),
          bio: speakerProfile.bio || '',
          institution: speakerProfile.institution || 'UNAP',
          photoUrl: speakerProfile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400'
        } : null
      });
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const firstA = grouped[a]?.[0];
      const firstB = grouped[b]?.[0];
      if (firstA && firstB) {
        try {
          return new Date(firstA.id ? sessions.find((s: any) => s.id === firstA.id)?.start_time : 0).getTime()
            - new Date(firstB.id ? sessions.find((s: any) => s.id === firstB.id)?.start_time : 0).getTime();
        } catch { return 0; }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-5 bg-black/[0.03] dark:bg-white/[0.01] border border-black/[0.08] dark:border-white/[0.06] flex items-baseline gap-3">
              <div className="h-8 w-8 bg-black/[0.06] dark:bg-white/[0.04] rounded-lg"></div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-3 w-12 bg-black/[0.06] dark:bg-white/[0.04] rounded"></div>
                <div className="h-3.5 w-24 bg-black/[0.08] dark:bg-white/[0.06] rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mb-8">
          <div className="h-6 w-48 bg-foreground/15 rounded"></div>
        </div>
        <div className="flex flex-col gap-4 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-md p-6 pl-8 border border-black/[0.08] dark:border-white/[0.06] bg-black/[0.03] dark:bg-white/[0.01] w-full flex flex-col md:flex-row gap-4 md:gap-8 items-start relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-black/[0.08] dark:bg-white/[0.06]" />
              <div className="flex flex-col gap-2 w-48 shrink-0">
                <div className="h-4 w-16 bg-black/[0.08] dark:bg-white/[0.06] rounded"></div>
                <div className="h-3 w-20 bg-black/[0.06] dark:bg-white/[0.04] rounded"></div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-5 w-3/4 bg-black/[0.08] dark:bg-white/[0.06] rounded"></div>
                <div className="h-3.5 w-1/2 bg-black/[0.06] dark:bg-white/[0.04] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displaySchedule.length === 0) {
    return (
      <div className="w-full text-center py-16 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 relative z-10 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
        <Calendar className="w-12 h-12 text-accent/40 mx-auto" />
        <h3 className="font-display font-bold text-lg text-foreground dark:text-white">No hay actividades registradas</h3>
        <p className="text-xs sm:text-sm text-foreground/70 dark:text-white/70 text-center">
          Actualmente no se encuentran actividades de cronograma registradas en la base de datos para la edición activa del evento.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative z-10">
      {/* Day selector pills + view mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.05] mb-8">
        <div
          className="flex flex-wrap items-center justify-start gap-3"
          role="tablist"
          aria-label="Días del programa"
        >
          {displaySchedule.map((dayData, idx) => {
            const dayNumber = idx + 1;
            const blockKey = `day-${dayNumber}`;
            const isSelected = selectedBlock === blockKey;

            let dateNum = String(dayNumber).padStart(2, '0');
            let monthName = 'Julio';
            try {
              const parts = dayData.dateString.split(',');
              const dateParts = parts[1]?.trim().split(' de ');
              dateNum = dateParts[0] || dateNum;
              monthName = dateParts[1] || monthName;
              monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            } catch (e) { }

            return (
              <button
                key={blockKey}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedBlock(blockKey)}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-3 border ${isSelected
                  ? 'bg-jsyellow/[0.06] border-jsyellow/60 text-jsyellow'
                  : 'bg-white/[0.01] border-white/[0.08] hover:border-white/[0.2] text-light/60 hover:text-light'
                  }`}
              >
                <span className="font-mono text-[10px] tracking-wider uppercase opacity-80">DÍA {dayNumber}</span>
                <span className="h-3.5 w-[1px] bg-white/20"></span>
                <span className="font-sans text-light/90">
                  {dateNum} {monthName.slice(0, 3)}
                </span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-light/50 font-normal">
                  {dayData.activities.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 border border-white/[0.08] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === 'cards'
              ? 'bg-jsyellow/[0.1] text-jsyellow'
              : 'text-light/40 hover:text-light/70'
              }`}
            title="Vista de tarjetas"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === 'table'
              ? 'bg-jsyellow/[0.1] text-jsyellow'
              : 'text-light/40 hover:text-light/70'
              }`}
            title="Vista de tabla"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content panel */}
      <div className="mt-8 border-t border-white/[0.05] pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedBlock}-${viewMode}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {selectedBlock.startsWith('day-') && currentDayData && (
              <div>
                <div className="text-center mb-8">
                  <h4 className="text-secondary dark:text-primary font-display font-semibold text-base sm:text-lg">
                    {currentDayData.dateString}
                  </h4>
                </div>

                {viewMode === 'cards' ? (
                  /* ========== CARDS VIEW ========== */
                  <div className="flex flex-col gap-5 w-full mt-6">
                    {currentDayData.activities.filter((act: any) => act.speaker).slice(0, showAll ? undefined : 5).map((act: any, index: number) => {
                      const speaker = act.speaker;
                      const isKeynote = act.type === 'keynote';

                      return (
                        <motion.div
                          key={act.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-md p-6 pl-8 transition-all duration-300 border border-zinc-800/80 hover:border-zinc-700 relative overflow-hidden group ${isKeynote
                            ? 'bg-jsyellow/[0.02] text-light'
                            : 'bg-white/[0.01] hover:bg-white/[0.03]'
                            } flex flex-col md:flex-row gap-4 md:gap-8 items-start`}
                        >
                          {/* Solid Left Accent Line */}
                          <div
                            className={`absolute top-0 left-0 bottom-0 w-[4px] transition-colors duration-300 ${isKeynote
                              ? 'bg-jsyellow'
                              : 'bg-white/20 group-hover:bg-white/40'
                              }`}
                          />

                          {/* Time, Type, Location Column */}
                          <div className="flex flex-col gap-2 shrink-0 md:w-48 text-left">
                            <span className={`text-base font-bold font-mono ${isKeynote ? 'text-jsyellow' : 'text-light/90'}`}>
                              {act.time}
                            </span>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="uppercase tracking-widest text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-light/80 border border-white/[0.06]">
                                {translateType(act.type)}
                              </span>
                            </div>
                            {act.location && (
                              <span className="text-[11px] font-medium text-light/50 flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-jsyellow/70"></span>
                                {act.location}
                              </span>
                            )}
                          </div>

                          {/* Title, Description & Speaker Column */}
                          <div className="flex-1 flex flex-col gap-2 text-left">
                            <h4 className={`font-display font-bold text-base sm:text-2xl leading-snug ${isKeynote ? 'text-jsyellow' : 'text-light'}`}>
                              {act.title}
                            </h4>
                            {act.description && (
                              <p className="text-xs sm:text-sm leading-relaxed text-light/60">
                                {act.description}
                              </p>
                            )}

                            {/* Speaker details */}
                            {speaker && (
                              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.04]">
                                <img
                                  src={speaker.photoUrl}
                                  alt={speaker.name}
                                  className="w-8 h-8 rounded-full object-cover border border-white/[0.1] shrink-0"
                                  loading="lazy"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-light truncate">
                                    {speaker.name}
                                  </span>
                                  <span className="text-[10px] text-light/50 truncate">
                                    {speaker.specialty}{speaker.institution ? ` • ${speaker.institution}` : ''}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Ver trayectoria */}
                            {speaker?.bio && (
                              <div className="mt-2">
                                <button
                                  onClick={() => toggleExpand(act.id)}
                                  className="text-[10px] text-jsyellow hover:text-jsyellow/80 font-bold flex items-center gap-1 cursor-pointer focus:outline-none"
                                >
                                  {expandedSessions[act.id] ? (
                                    <>Ocultar trayectoria <ChevronUp className="w-3 h-3" /></>
                                  ) : (
                                    <>Ver trayectoria <ChevronDown className="w-3 h-3" /></>
                                  )}
                                </button>
                                {expandedSessions[act.id] && (
                                  <p className="text-xs text-light/60 leading-relaxed mt-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-fade-in">
                                    {speaker.bio}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* "Ver más" button */}
                    {currentDayData.activities.filter((act: any) => act.speaker).length > 5 && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => setShowAll(!showAll)}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-light border border-white/[0.1] hover:border-jsyellow/40 bg-white/[0.02] hover:bg-white/[0.06] py-3 px-6 rounded-xl transition-all cursor-pointer active:scale-98"
                        >
                          {showAll ? 'Ver menos' : `Ver más (${currentDayData.activities.filter((act: any) => act.speaker).length - 5} actividades más)`}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ========== TABLE VIEW ========== */
                  <div className="w-full overflow-x-auto mt-6 border border-white/[0.08] rounded-xl">
                    <table className="w-full text-left border-separate border-spacing-0">
                      <thead>
                        <tr className="border-b border-white/[0.08]">
                          <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-jsyellow w-40 border-r border-white/[0.08] bg-white/[0.03]">Horario</th>
                          <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-jsyellow border-r border-white/[0.08] bg-white/[0.03]">Actividad</th>
                          <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-jsyellow w-64 bg-white/[0.03]">Ponente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDayData.activities.map((act: any, index: number) => {
                          const speaker = act.speaker;
                          const isEven = index % 2 === 0;
                          return (
                            <tr
                              key={act.id}
                              className={`border-b border-white/[0.06] transition-colors hover:bg-white/[0.03] ${isEven ? 'bg-white/[0.01]' : 'bg-white/[0.03]'
                                }`}
                            >
                              <td className="py-4 px-4 border-r border-white/[0.06]">
                                <span className="text-sm font-bold font-mono text-light/90">{act.time}</span>
                              </td>
                              <td className="py-4 px-4 border-r border-white/[0.06]">
                                <div className="flex flex-col gap-1">
                                  <span className={`text-sm font-bold ${act.type === 'keynote' ? 'text-jsyellow' : 'text-light'}`}>
                                    {act.title}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="uppercase tracking-widest text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-light/60 border border-white/[0.06]">
                                      {translateType(act.type)}
                                    </span>
                                    {act.location && (
                                      <span className="text-[10px] text-light/40 flex items-center gap-1">
                                        <MapPin className="w-2.5 h-2.5" />
                                        {act.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {speaker ? (
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={speaker.photoUrl}
                                      alt={speaker.name}
                                      className="w-7 h-7 rounded-full object-cover border border-white/[0.1] shrink-0"
                                      loading="lazy"
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-bold text-light truncate">{speaker.name}</span>
                                      <span className="text-[10px] text-light/50 truncate">{speaker.institution}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-light/30">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
