import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  aspectRatio: string; // for simulated masonry heights
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'img-1',
    url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=800&h=1060',
    caption: 'Bosques tropicales en la Reserva Nacional Pacaya Samiria, Loreto',
    category: 'Biodiversidad',
    aspectRatio: 'h-[320px]',
  },
  {
    id: 'img-2',
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800&h=600',
    caption: 'Laboratorio de Investigación en Biotecnología Forestal de la UNAP',
    category: 'Ciencia',
    aspectRatio: 'h-[240px]',
  },
  {
    id: 'img-3',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800&h=530',
    caption: 'Plenaria inaugural de la edición científica anterior',
    category: 'Congreso',
    aspectRatio: 'h-[200px]',
  },
  {
    id: 'img-4',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800&h=1180',
    caption: 'Estudio de nervaduras y fotosíntesis foliar en especies nativas',
    category: 'Biodiversidad',
    aspectRatio: 'h-[360px]',
  },
  {
    id: 'img-5',
    url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800&h=800',
    caption: 'Análisis microscópico de patógenos del agua en la cuenca del Amazonas',
    category: 'Salud',
    aspectRatio: 'h-[280px]',
  },
  {
    id: 'img-6',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800&h=530',
    caption: 'Estudiantes del doctorado realizando trabajo de campo ecológico',
    category: 'Investigación',
    aspectRatio: 'h-[200px]',
  },
  {
    id: 'img-7',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800&h=600',
    caption: 'Presentación de posters y diálogo transdisciplinar en EPG',
    category: 'Congreso',
    aspectRatio: 'h-[240px]',
  },
];

export const Gallery: React.FC = () => {
  const [selectedImg, setSelectedImg] = useState<GalleryImage | null>(null);

  // Esc key closes lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImg(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full">
      {/* Grid columns for CSS Masonry */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
        {GALLERY_IMAGES.map((img) => (
          <div key={img.id} className="break-inside-avoid">
            <button
              onClick={() => setSelectedImg(img)}
              className="relative w-full overflow-hidden rounded-2xl group border border-accent/15 hover:border-secondary/35 transition-all shadow-md hover:shadow-secondary/5 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              aria-label={`Ver imagen ampliada: ${img.caption}`}
            >
              {/* Image element */}
              <img
                src={img.url}
                alt={img.caption}
                loading="lazy"
                className={`w-full ${img.aspectRatio} object-cover group-hover:scale-105 transition-transform duration-700`}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1.5 inline-block">
                  {img.category}
                </span>
                <p className="text-sm text-white font-display font-medium leading-snug">
                  {img.caption}
                </p>
                <div className="absolute top-4 right-4 p-2 bg-dark/60 rounded-full border border-white/10 text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox Modal Overlay */}
      <AnimatePresence>
        {selectedImg && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/95 backdrop-blur-md p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Visualizador de imagen ampliada"
          >
            {/* Backdrop click closer */}
            <div className="absolute inset-0 cursor-zoom-out" onClick={() => setSelectedImg(null)} />

            {/* Close Button */}
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 bg-primary/20 text-light hover:bg-secondary hover:text-dark border border-light/10 hover:border-transparent rounded-full transition-all cursor-pointer z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              aria-label="Cerrar vista de imagen"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative max-w-4xl w-full bg-dark/80 border border-accent/15 rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              <img
                src={selectedImg.url}
                alt={selectedImg.caption}
                className="w-full max-h-[70vh] object-contain bg-black/40"
              />
              <div className="p-6 bg-dark border-t border-accent/10">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
                  {selectedImg.category}
                </span>
                <p className="text-light font-display font-semibold text-lg sm:text-xl leading-snug">
                  {selectedImg.caption}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
