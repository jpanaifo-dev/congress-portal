import { useState, useEffect } from 'react';
import { fetchSpeakers, fetchConfig } from '../../../lib/supabase';

interface Speaker {
  id: string;
  full_name: string;
  specialty: string;
  bio: string;
  photo_url: string;
  institution: string;
  socials: Record<string, string>;
}

export function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const config = await fetchConfig();
        const editionId = config.edition?.id;
        if (editionId) {
          const data = await fetchSpeakers(editionId);
          setSpeakers(data);
        }
      } catch (err) {
        console.error('Error loading speakers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] rounded-2xl bg-white/5 mb-4" />
            <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (speakers.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-light/50 text-lg">No hay ponentes registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {speakers.map((speaker) => (
        <div
          key={speaker.id}
          className="group relative flex flex-col items-center text-center"
        >
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-5 bg-white/5">
            {speaker.photo_url ? (
              <img
                src={speaker.photo_url}
                alt={speaker.full_name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <span className="text-5xl font-display font-black text-light/20">
                  {speaker.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {speaker.bio && (
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white/80 text-xs leading-relaxed line-clamp-4">{speaker.bio}</p>
              </div>
            )}
          </div>

          <h3 className="font-display font-bold text-lg text-light">{speaker.full_name}</h3>
          <p className="text-secondary text-xs font-semibold uppercase tracking-wider mt-1">
            {speaker.specialty}
          </p>
          <p className="text-light/40 text-xs mt-1">{speaker.institution}</p>

          {Object.keys(speaker.socials).length > 0 && (
            <div className="flex gap-3 mt-3">
              {speaker.socials.linkedin && (
                <a href={speaker.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-light/30 hover:text-secondary transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
              {speaker.socials.twitter && (
                <a href={speaker.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-light/30 hover:text-secondary transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
