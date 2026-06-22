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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
      {speakers.map((spk) => (
        <div key={spk.id} className="glass-card rounded-2xl overflow-hidden border border-accent/10 hover:border-secondary/35 transition-all duration-300 group flex flex-col justify-between">
          <div>
            {/* Speaker Photo container */}
            <div className="relative overflow-hidden aspect-square border-b border-accent/10">
              <img
                src={spk.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400'}
                alt={spk.full_name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content Details */}
            <div className="p-6 flex flex-col gap-3">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
                  {spk.specialty}
                </span>
                <h3 className="font-display font-bold text-lg text-light group-hover:text-secondary transition-colors">
                  {spk.full_name}
                </h3>
                {spk.institution && (
                  <span className="text-[10px] text-light/50 font-medium block mt-1">{spk.institution}</span>
                )}
              </div>

              <p className="text-xs text-light/75 leading-relaxed">{spk.bio}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
