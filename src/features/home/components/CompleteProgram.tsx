import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Award, BookOpen, Coffee, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { nhost } from '../../../lib/nhost';
import type { ScheduleActivity } from '../../../types';

export const CompleteProgram: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const resp = await nhost.graphql.request<any>({
          query: `
            query GetActiveEditionDetails {
              editions(where: { is_active: { _eq: true } }) {
                id
                title
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
                      bio
                      institution
                    }
                  }
                }
              }
            }
          `
        });

        if (resp.body.errors && resp.body.errors.length > 0) {
          console.warn("GraphQL errors loading program:", resp.body.errors);
          setDbError(resp.body.errors[0].message);
        } else {
          const activeEd = resp.body.data?.editions?.[0];
          if (activeEd?.sessions && activeEd.sessions.length > 0) {
            setSessions(activeEd.sessions);
          }
        }
      } catch (err: any) {
        console.warn("Failed to load program sessions from database:", err);
        setDbError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedSessions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Group database sessions by date
  let displaySchedule: any[] = [];
  
  if (sessions.length > 0) {
    const grouped: { [date: string]: any[] } = {};
    sessions.forEach(sess => {
      let dateKey = 'Fecha del Evento';
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
        location: sess.location || 'Auditorio Principal',
        speaker: speakerData ? {
          name: speakerData.full_name,
          specialty: speakerData.specialty,
          bio: speakerData.bio || '',
          institution: speakerData.institution || 'UNAP',
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'keynote':
        return <Award className="w-5 h-5 text-secondary" />;
      case 'panel':
      case 'workshop':
      case 'research':
        return <BookOpen className="w-5 h-5 text-accent" />;
      case 'break':
        return <Coffee className="w-5 h-5 text-light/45" />;
      case 'ceremony':
        return <Calendar className="w-5 h-5 text-light" />;
      default:
        return <HelpCircle className="w-5 h-5 text-light/45" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'keynote':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'panel':
      case 'workshop':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'research':
        return 'bg-primary/20 text-accent border-primary/30';
      case 'break':
        return 'bg-light/5 text-light/60 border-light/10';
      case 'ceremony':
        return 'bg-light/5 text-light border-light/15';
      default:
        return 'bg-light/5 text-light/60 border-light/10';
    }
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
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-12 relative z-10">
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-dark/40 backdrop-blur-md rounded-3xl border border-accent/10 p-8">
          <svg className="w-8 h-8 text-secondary animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-light/60">Cargando cronograma científico...</span>
        </div>
      </div>
    );
  }

  if (displaySchedule.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-12 relative z-10">
        <div className="w-full text-center py-16 bg-dark/40 backdrop-blur-md rounded-3xl border border-accent/10 p-8 flex flex-col items-center justify-center gap-4">
          <Calendar className="w-12 h-12 text-accent/40 mx-auto" />
          <h3 className="font-display font-bold text-lg text-light">No hay actividades registradas</h3>
          <p className="text-xs sm:text-sm text-light/65 max-w-md mx-auto text-center">
            Actualmente no se encuentran sesiones de cronograma registradas en la base de datos para la edición activa del evento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-12 relative z-10">
      {displaySchedule.map((dayData, idx) => (
        <div key={dayData.dateString} className="flex flex-col gap-8">
          {/* Day Title */}
          <div className="flex items-center gap-4 border-b border-light/10 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center border border-secondary/35 text-secondary font-display font-black text-lg">
              {idx + 1}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-accent uppercase font-bold tracking-widest">Día del Congreso</span>
              <h2 className="text-lg sm:text-xl font-display font-black text-light">{dayData.dateString}</h2>
            </div>
          </div>

          {/* Vertical Timeline list */}
          <div className="flex flex-col relative pl-6 border-l border-primary/20 gap-8">
            {dayData.activities.map((act: any) => {
              const speaker = act.speaker;
              const isKeynote = act.type === 'keynote';
              const isExpanded = !!expandedSessions[act.id];

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-[37px] top-1.5 flex items-center justify-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center bg-dark z-10 transition-colors duration-300 ${
                      isKeynote ? 'border-secondary text-secondary shadow-[0_0_8px_rgba(76,175,80,0.15)]' : 'border-accent/15 text-light/50 group-hover:border-accent/40'
                    }`}>
                      {React.cloneElement(getActivityIcon(act.type), { className: 'w-3.5 h-3.5' })}
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className={`rounded-2xl p-5 sm:p-6 transition-all duration-300 border bg-dark/40 backdrop-blur-sm ${
                    isKeynote ? 'border-secondary/25 shadow-lg shadow-secondary/5' : 'border-accent/10 hover:border-accent/20 shadow-md'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${isKeynote ? 'text-secondary' : 'text-accent'}`}>
                          <Clock className="w-4 h-4" />
                          {act.time}
                        </span>
                        <span className="text-[10px] text-light/50">•</span>
                        <span className="text-xs text-light/60 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          {act.location}
                        </span>
                      </div>
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md border ${getBadgeStyle(act.type)}`}>
                        {translateType(act.type)}
                      </span>
                    </div>

                    <h3 className={`font-display font-extrabold text-base sm:text-lg mb-2 leading-snug text-light ${
                      isKeynote ? 'text-glow-secondary' : 'group-hover:text-secondary transition-colors'
                    }`}>
                      {act.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-light/75 leading-relaxed mb-4">
                      {act.description}
                    </p>

                    {/* Speaker block */}
                    {speaker && (
                      <div className="mt-4 pt-4 border-t border-accent/10 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={speaker.photoUrl}
                            alt={speaker.name}
                            className="w-10 h-10 rounded-full object-cover border border-secondary/20 shrink-0"
                            loading="lazy"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs sm:text-sm font-extrabold text-light truncate">{speaker.name}</span>
                            <span className="text-[10px] sm:text-xs text-accent truncate">{speaker.specialty} • <span className="text-light/55">{speaker.institution}</span></span>
                          </div>
                        </div>
                        
                        {speaker.bio && (
                          <div className="pl-13">
                            <button
                              onClick={() => toggleExpand(act.id)}
                              className="text-[10px] text-secondary hover:text-accent font-bold flex items-center gap-1 cursor-pointer focus:outline-none"
                            >
                              {isExpanded ? (
                                <>Ocultar trayectoria <ChevronUp className="w-3 h-3" /></>
                              ) : (
                                <>Ver trayectoria <ChevronDown className="w-3 h-3" /></>
                              )}
                            </button>
                            {isExpanded && (
                              <p className="text-xs text-light/60 leading-relaxed mt-2 p-3 bg-primary/5 border border-accent/10 rounded-xl max-w-2xl animate-fade-in">
                                {speaker.bio}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
