import React, { useState, useEffect } from 'react';
import { fetchConfig, fetchThematicLines } from '../../lib/supabase';

interface FooterReactProps {
  logoUrl?: string;
  eventName?: string;
  contactInfo?: {
    address: string;
    phones: string[];
    emails: string[];
  };
}

export const FooterReact: React.FC<FooterReactProps> = ({
  logoUrl = "/images/postgrado_brandwhite.webp",
  eventName = "Escuela de Postgrado UNAP",
  contactInfo = {
    address: "Calle Loreto N° 123, Iquitos, Loreto, Perú",
    phones: ["+51 965 123 456"],
    emails: ["postgrado@unapiquitos.edu.pe"]
  }
}) => {
  const [thematicLines, setThematicLines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = await fetchConfig();
        const edId = config.edition?.id;
        if (edId) {
          const lines = await fetchThematicLines(edId);
          setThematicLines(lines || []);
        }
      } catch (err) {
        console.error("Failed to load thematic lines for footer:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <footer className="w-full bg-[#fafafa] dark:bg-[#07140F] border-t border-black/10 dark:border-white/5 pt-12 pb-8 px-6 md:px-12 transition-colors duration-300">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Col 1: Branding & Description */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt={eventName}
              className="h-10 w-auto object-contain transition-transform hover:scale-[1.02] duration-300"
            />
          </div>
          <p className="text-xs text-foreground/70 dark:text-white/70 leading-relaxed max-w-xs">
            Impulsando la investigación de alto impacto en la Amazonía peruana, formando investigadores de excelencia y construyendo el desarrollo sostenible.
          </p>
        </div>

        {/* Col 3: Research lines fetched from DB */}
        <div className="flex flex-col gap-3">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-foreground dark:text-white border-l-2 border-secondary pl-3">
            Líneas de Investigación
          </h3>
          {loading ? (
            <div className="flex flex-col gap-2 animate-pulse">
              <div className="h-3 w-3/4 bg-foreground/10 dark:bg-white/10 rounded animate-pulse"></div>
              <div className="h-3 w-5/6 bg-foreground/10 dark:bg-white/10 rounded animate-pulse"></div>
              <div className="h-3 w-2/3 bg-foreground/10 dark:bg-white/10 rounded animate-pulse"></div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2 text-xs text-foreground/75 dark:text-white/70">
              {thematicLines.length > 0 ? (
                thematicLines.map((line) => (
                  <li key={line.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{line.name?.es || line.name || "Línea de investigación"}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Biodiversidad Amazónica
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Salud y Patologías Tropicales
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Bioingeniería y Tecnologías
                  </li>
                </>
              )}
            </ul>
          )}
        </div>

        {/* Col 4: Contact info */}
        <div className="flex flex-col gap-3">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-foreground dark:text-white border-l-2 border-secondary pl-3">
            Contacto Oficial
          </h3>
          <div className="flex flex-col gap-2 text-xs text-foreground/75 dark:text-white/70">
            <p>{contactInfo.address}</p>
            <p>Telf: {contactInfo.phones.join(', ')}</p>
            <a
              href={`mailto:${contactInfo.emails[0]}`}
              className="hover:text-secondary dark:hover:text-primary transition-colors truncate"
            >
              {contactInfo.emails[0]}
            </a>
          </div>
        </div>

      </div>

      {/* Copyright Centered Close Section */}
      <div className="container mx-auto mt-8 pt-6 border-t border-black/10 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-foreground/50 dark:text-white/40">
        <p>
          © {currentYear} Universidad Nacional de la Amazonía Peruana. Escuela de Postgrado. Todos los derechos reservados.
        </p>
        <div className="flex gap-4">
          <a href="/#sobre-evento" className="hover:text-secondary dark:hover:text-primary transition-colors">Sobre el Evento</a>
          <a href="/#contacto" className="hover:text-secondary dark:hover:text-primary transition-colors">Soporte & Contacto</a>
        </div>
      </div>
    </footer>
  );
};
