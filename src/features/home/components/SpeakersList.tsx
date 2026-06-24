import React, { useState, useEffect } from 'react';
import { fetchSpeakers, fetchConfig } from '../../../lib/supabase';

interface SpeakersListProps {
  editionId?: string;
}

export const SpeakersList: React.FC<SpeakersListProps> = ({ editionId }) => {
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpeakers = async () => {
      try {
        let activeEditionId = editionId;
        if (!activeEditionId) {
          const config = await fetchConfig();
          activeEditionId = config.edition?.id || "";
        }
        if (activeEditionId) {
          const list = await fetchSpeakers(activeEditionId);
          setSpeakers(list);
        }
      } catch (err: any) {
        console.warn("Failed to load speakers from database:", err);
        setDbError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    loadSpeakers();
  }, [editionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 w-full">
        <svg className="w-8 h-8 text-secondary animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-light/60">Cargando ponentes...</span>
      </div>
    );
  }

  if (speakers.length === 0) {
    return (
      <div className="w-full text-center py-16 bg-dark/40 backdrop-blur-md rounded-2xl border border-accent/10 p-8 flex flex-col items-center justify-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-accent/40">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
        <h3 className="font-display font-bold text-base text-light">No hay ponentes registrados</h3>
        <p className="text-xs text-light/65 max-w-md mx-auto text-center">
          Actualmente no se encuentran investigadores o líderes académicos registrados en la base de datos.
        </p>
        {dbError && (
          <p className="text-red-400 text-xs font-semibold mt-2 bg-red-400/10 p-3 rounded-lg border border-red-400/20 max-w-lg mx-auto">
            Error de conexión: {dbError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* 5-column responsive clean grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 w-full">
        {speakers.map((spk) => (
          <div key={spk.id} className="group flex flex-col text-left transition-all duration-300 hover:scale-[1.01]">
            {/* Portrait Speaker Photo */}
            <div className="relative overflow-hidden aspect-[4/5] rounded-3xl bg-light/5 dark:bg-white/5 border border-accent/10 hover:border-secondary/35 transition-all duration-300 shadow-sm">
              <img
                src={spk.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400'}
                alt={spk.full_name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Clean Details below the photo */}
            <div className="mt-4 flex flex-col gap-1">
              <h3 className="font-display font-bold text-base sm:text-lg text-light group-hover:text-secondary transition-colors leading-snug">
                {spk.full_name}
              </h3>
              <p className="text-xs sm:text-sm text-light/70 font-medium leading-normal">
                {spk.specialty}{spk.institution ? `, ${spk.institution}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Overlapping Avatar Group Stack */}
      {speakers.length > 0 && (
        <div className="flex flex-col items-center gap-3 mt-16">
          <div className="flex -space-x-3.5 overflow-hidden">
            {speakers.slice(0, 4).map((spk) => (
              <img
                key={`avatar-${spk.id}`}
                className="inline-block h-10 w-10 rounded-full ring-2 ring-dark object-cover"
                src={spk.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100'}
                alt={spk.full_name}
              />
            ))}
            <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-dark bg-secondary/15 border border-secondary/40 text-secondary text-xs font-black font-display select-none">
              +{speakers.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
