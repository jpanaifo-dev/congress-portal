import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Award, BookOpen, Coffee, HelpCircle, BookCheck, ClipboardList, Info } from 'lucide-react';
import { SCHEDULE, SPEAKERS } from '../../../constants/eventData';
import type { ScheduleActivity } from '../../../types';

type SelectedBlock = 'workshops' | 'day1' | 'day2' | 'publishing';

export const Timeline: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock>('day1');

  // Map day1 / day2 to standard SCHEDULE list
  const activeDay = selectedBlock === 'day1' ? 1 : selectedBlock === 'day2' ? 2 : 1;
  const currentDayData = SCHEDULE.find(d => d.day === activeDay) || SCHEDULE[0];

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
        return <Calendar className="w-5 h-5 text-white" />;
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
        return 'bg-white/10 text-white border-white/20';
      default:
        return 'bg-light/5 text-light/65 border-light/10';
    }
  };

  return (
    <div className="w-full relative z-10">
      {/* 4 Cards Selector Row - Responsive Swipeable on Mobile, Grid on Desktop */}
      <div
        className="flex overflow-x-auto snap-x gap-5 pb-8 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-12 container mx-auto px-1 scrollbar-thin scrollbar-thumb-primary/20"
        role="tablist"
        aria-label="Bloques del programa académico"
      >

        {/* Card 1: Workshops (Image Background style from reference) */}
        <button
          role="tab"
          aria-selected={selectedBlock === 'workshops'}
          aria-controls="program-detail-panel"
          onClick={() => setSelectedBlock('workshops')}
          className={`snap-start shrink-0 w-[290px] sm:w-auto relative min-h-[380px] rounded-3xl overflow-hidden border flex flex-col justify-end p-6 text-left group transition-all duration-300 hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${selectedBlock === 'workshops'
              ? 'border-secondary shadow-[0_0_25px_rgba(76,175,80,0.25)] ring-2 ring-secondary/35 scale-[1.01]'
              : 'border-accent/10 hover:border-secondary/40'
            }`}
        >
          {/* Background Image of Scientist/Workshops */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600&h=800')] bg-cover bg-center transition-transform duration-700 group-hover:scale-103"></div>
          {/* Dark Overlay Gradient matching the image style */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/75 to-transparent z-0"></div>

          <div className="relative z-10 w-full flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent/80 block">Julio</span>

            <h3 className="font-display font-black text-2xl leading-none text-glow text-[#fcd34d] uppercase mb-1">
              TALLERES Y POSTERS
            </h3>

            <p className="text-xs text-light/85 leading-relaxed">
              Sesiones prácticas de redacción científica de alto impacto y exposición presencial de posters científicos.
            </p>
          </div>
        </button>

        {/* Card 2: Day 1 (Glassmorphism) */}
        <button
          role="tab"
          aria-selected={selectedBlock === 'day1'}
          aria-controls="program-detail-panel"
          onClick={() => setSelectedBlock('day1')}
          className={`snap-start shrink-0 w-[290px] sm:w-auto relative min-h-[380px] rounded-3xl overflow-hidden border bg-dark/75 backdrop-blur-md flex flex-col justify-between p-6 text-left group transition-all duration-300 hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${selectedBlock === 'day1'
              ? 'border-secondary shadow-[0_0_25px_rgba(76,175,80,0.25)] ring-2 ring-secondary/35 scale-[1.01]'
              : 'border-accent/10 hover:border-secondary/40'
            }`}
        >
          <div className="flex items-center justify-between w-full text-accent/60 font-bold text-[10px] uppercase tracking-widest">
            <span>Julio</span>
            <span>Jue</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-7xl font-display font-black text-white text-glow leading-none">02</span>

            <h3 className="font-display font-bold text-lg leading-tight text-white uppercase group-hover:text-secondary transition-colors mt-2">
              DÍA 1: CONFERENCIAS
            </h3>

            <p className="text-xs text-light/75 leading-relaxed">
              Ceremonia oficial de bienvenida, conferencias magistrales en biodiversidad amazónica y ponencias libres.
            </p>
          </div>
        </button>

        {/* Card 3: Day 2 (Glassmorphism) */}
        <button
          role="tab"
          aria-selected={selectedBlock === 'day2'}
          aria-controls="program-detail-panel"
          onClick={() => setSelectedBlock('day2')}
          className={`snap-start shrink-0 w-[290px] sm:w-auto relative min-h-[380px] rounded-3xl overflow-hidden border bg-dark/75 backdrop-blur-md flex flex-col justify-between p-6 text-left group transition-all duration-300 hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${selectedBlock === 'day2'
              ? 'border-secondary shadow-[0_0_25px_rgba(76,175,80,0.25)] ring-2 ring-secondary/35 scale-[1.01]'
              : 'border-accent/10 hover:border-secondary/40'
            }`}
        >
          <div className="flex items-center justify-between w-full text-accent/60 font-bold text-[10px] uppercase tracking-widest">
            <span>Julio</span>
            <span>Vie</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-7xl font-display font-black text-white text-glow leading-none">03</span>

            <h3 className="font-display font-bold text-lg leading-tight text-white uppercase group-hover:text-secondary transition-colors mt-2">
              DÍA 2: PONENCIAS
            </h3>

            <p className="text-xs text-light/75 leading-relaxed">
              Ciencia de datos aplicada, satélites, talleres metodológicos avanzados y clausura oficial.
            </p>
          </div>
        </button>

        {/* Card 4: ISBN/Publishing (Glassmorphism) */}
        <button
          role="tab"
          aria-selected={selectedBlock === 'publishing'}
          aria-controls="program-detail-panel"
          onClick={() => setSelectedBlock('publishing')}
          className={`snap-start shrink-0 w-[290px] sm:w-auto relative min-h-[380px] rounded-3xl overflow-hidden border bg-dark/75 backdrop-blur-md flex flex-col justify-between p-6 text-left group transition-all duration-300 hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${selectedBlock === 'publishing'
              ? 'border-secondary shadow-[0_0_25px_rgba(76,175,80,0.25)] ring-2 ring-secondary/35 scale-[1.01]'
              : 'border-accent/10 hover:border-secondary/40'
            }`}
        >
          <div className="flex items-center justify-between w-full text-accent/60 font-bold text-[10px] uppercase tracking-widest">
            <span>Julio</span>
            <span>ISBN</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-5xl sm:text-6xl font-display font-black text-white text-glow leading-none uppercase">Libro</span>

            <h3 className="font-display font-bold text-lg leading-tight text-white uppercase group-hover:text-secondary transition-colors mt-2">
              PUBLICACIONES
            </h3>

            <p className="text-xs text-light/75 leading-relaxed">
              Indexación oficial y publicación digital de los resúmenes científicos aprobados por el comité de postgrado.
            </p>
          </div>
        </button>

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
            {/* Timeline View for Day 1 and Day 2 */}
            {(selectedBlock === 'day1' || selectedBlock === 'day2') && (
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
                      const speaker = SPEAKERS.find(s => s.id === act.speakerId);
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

                          {/* Individual Event Card - Styled Tal cual la Imagen */}
                          <div
                            className={`rounded-2xl p-5 relative w-full overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[240px] border ${isKeynote
                                ? 'border-[#fcd34d]/30 hover:border-secondary/40 shadow-lg'
                                : 'glass-card border-accent/10 hover:border-secondary/35 shadow-md'
                              }`}
                          >
                            {/* If Keynote, load a background image with dark overlay to match Card 1 */}
                            {isKeynote && (
                              <>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=400&h=300')] bg-cover bg-center -z-10 group-hover:scale-103 transition-transform duration-500"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/80 to-dark/50 -z-10"></div>
                              </>
                            )}

                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className={`text-xs font-bold flex items-center gap-1 ${isKeynote ? 'text-[#fcd34d]' : 'text-secondary'}`}>
                                  <Clock className="w-3.5 h-3.5" />
                                  {act.time}
                                </span>
                                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border ${getTypeStyle(act.type)}`}>
                                  {act.type}
                                </span>
                              </div>

                              <h4 className={`font-display font-bold text-base leading-snug transition-colors mb-2 line-clamp-2 ${isKeynote ? 'text-[#fcd34d] text-glow group-hover:text-white' : 'text-white group-hover:text-secondary'
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
                                  <span className="text-xs font-semibold text-white truncate">{speaker.name}</span>
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
                    const speaker = SPEAKERS.find(s => s.id === act.speakerId);
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
                              ? 'border-secondary text-secondary shadow-[0_0_10px_rgba(76,175,80,0.2)]'
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
                              <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/80 to-dark/50 -z-10"></div>
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

                          <h4 className={`font-display font-bold text-base mb-1.5 leading-snug ${isKeynote ? 'text-[#fcd34d] text-glow' : 'text-white group-hover:text-secondary transition-colors'
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
                                <span className="text-xs font-bold text-white">{speaker.name}</span>
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

            {/* Detailed View for Workshops */}
            {selectedBlock === 'workshops' && (
              <div className="max-w-4xl mx-auto px-4 flex flex-col gap-6">
                <div className="text-center mb-6">
                  <h4 className="text-accent font-display font-medium text-lg flex items-center justify-center gap-2">
                    <ClipboardList className="w-5 h-5 text-secondary" />
                    Programa de Talleres y Posters Científicos
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Workshop block */}
                  <div className="glass-card rounded-2xl p-6 border border-accent/15 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-secondary font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Viernes 03 • 14:30 - 16:30
                        </span>
                        <span className="text-[10px] bg-accent/15 text-accent border border-accent/20 uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md">
                          Taller
                        </span>
                      </div>
                      <h5 className="text-white font-display font-bold text-lg mb-2">Redacción Científica de Alto Impacto</h5>
                      <p className="text-xs sm:text-sm text-light/75 leading-relaxed mb-4">
                        Taller práctico intensivo dictado por editores experimentados enfocado en la estructuración, redacción y postulación exitosa de artículos a revistas indexadas (Scopus / Web of Science).
                      </p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-accent">
                      Requisitos: Llevar laptop y un avance de su resumen de investigación.
                    </div>
                  </div>

                  {/* Posters block */}
                  <div className="glass-card rounded-2xl p-6 border border-accent/15 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-secondary font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Jueves y Viernes • Coffe Breaks
                        </span>
                        <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/20 uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md">
                          Posters
                        </span>
                      </div>
                      <h5 className="text-white font-display font-bold text-lg mb-2">Exhibición de Posters Científicos</h5>
                      <p className="text-xs sm:text-sm text-light/75 leading-relaxed mb-4">
                        Espacio interactivo de networking y debate en el hall principal del evento, donde estudiantes de maestría y doctorado expondrán los avances de sus tesis de grado y responderán consultas del jurado.
                      </p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-accent">
                      Coordinación: Los posters aprobados por el comité deben instalarse el 02 de Julio antes de las 08:00 AM.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed View for Publications */}
            {selectedBlock === 'publishing' && (
              <div className="max-w-3xl mx-auto px-4 flex flex-col gap-6 text-left">
                <div className="text-center mb-6">
                  <h4 className="text-accent font-display font-medium text-lg flex items-center justify-center gap-2">
                    <BookCheck className="w-5 h-5 text-secondary" />
                    Publicación en Libro de Actas (ISBN)
                  </h4>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-accent/15 flex flex-col gap-6">
                  <p className="text-xs sm:text-sm text-light/85 leading-relaxed">
                    Todos los trabajos de investigación aceptados por el Comité Científico del III Encuentro (ponencias presenciales y posters) serán publicados de manera oficial en formato de Libro de Actas Científico de la Escuela de Postgrado de la UNAP.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-accent/5">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-secondary font-bold uppercase tracking-wider font-display">Indexación y Respaldo</span>
                      <ul className="flex flex-col gap-2 text-xs text-light/70">
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                          Código ISBN registrado en la Biblioteca Nacional.
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                          Publicación oficial en el Repositorio de la UNAP.
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                          Certificación académica individual para los autores.
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-secondary font-bold uppercase tracking-wider font-display">Fechas del Proceso</span>
                      <div className="flex flex-col gap-2 text-xs text-light/75">
                        <div className="flex justify-between">
                          <span>Recepción de resúmenes:</span>
                          <span className="font-semibold text-white">Hasta el 15 de Junio</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resultados de evaluación:</span>
                          <span className="font-semibold text-white">22 de Junio</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Publicación del libro:</span>
                          <span className="font-semibold text-white">Julio de 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 items-start mt-2">
                    <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <p className="text-xs text-accent/90 leading-relaxed">
                      La plantilla de presentación, estructura del abstract (máximo 500 palabras, formato IMRyD) y los enlaces de envío se enviarán directamente al correo electrónico tras completar su registro.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
