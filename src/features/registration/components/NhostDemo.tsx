import React, { useEffect, useState } from 'react';
import { fetchConfig, fetchSpeakers, createRegistration, checkProfileRegistration, type EventConfig } from '../../../lib/supabase';
import {
  Users,
  Database,
  Send,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Settings
} from 'lucide-react';

export const NhostDemo: React.FC = () => {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mutation Form States
  const [firstNames, setFirstNames] = useState<string>('');
  const [lastNames, setLastNames] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [docType, setDocType] = useState<'DNI' | 'CARNET_EXTRANJERIA' | 'PASAPORTE'>('DNI');
  const [docNumber, setDocNumber] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [participationType, setParticipationType] = useState<string>('Pregrado');
  const [researchArea, setResearchArea] = useState<string>('Ciencias Naturales');

  // Custom IDs for test
  const [customEditionId, setCustomEditionId] = useState<string>('');
  const [customMainEventId, setCustomMainEventId] = useState<string>('');

  // Mutation Status States
  const [mutationLoading, setMutationLoading] = useState<boolean>(false);
  const [mutationResult, setMutationResult] = useState<any | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeConfig = await fetchConfig();
      setConfig(activeConfig);

      if (activeConfig.edition?.id) {
        setCustomEditionId(activeConfig.edition.id);
        const list = await fetchSpeakers(activeConfig.edition.id);
        setSpeakers(list);
      }
      if (activeConfig.event?.id) {
        setCustomMainEventId(activeConfig.event.id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con Supabase REST');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMutationLoading(true);
    setMutationResult(null);
    setMutationError(null);

    try {
      const check = await checkProfileRegistration(email, docType, docNumber, customEditionId);

      if (check.isRegisteredForEdition) {
        throw new Error('El usuario ya se encuentra registrado para esta edición del congreso.');
      }

      const result = await createRegistration({
        profileId: check.profileId,
        email,
        firstNames,
        lastNames,
        docType,
        docNumber,
        phone,
        institution,
        researchArea,
        participantType: participationType,
        editionId: customEditionId,
        mainEventId: customMainEventId
      });

      setMutationResult({
        success: true,
        message: '¡Registro guardado con éxito!',
        data: result
      });
    } catch (err: any) {
      setMutationError(err.message || 'Error al guardar el registro en Supabase');
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 text-light">

      {/* Header and status info bar */}
      <div className="col-span-1 lg:col-span-12 glass-card rounded-2xl p-6 border border-accent/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-light flex items-center gap-2">
            <Database className="w-6 h-6 text-secondary" />
            Consola de Integración Supabase
          </h2>
          <p className="text-xs text-light/70 mt-1">
            Esta pantalla demuestra la conexión REST y PostgREST contra las tablas enlazadas de tu base de datos Supabase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-primary/15 text-secondary border border-secondary/30">
            <Sparkles className="w-3.5 h-3.5" />
            Conectado a Supabase
          </span>
          <button
            onClick={loadData}
            type="button"
            className="p-2 bg-dark border border-accent/15 rounded-lg hover:border-secondary transition-all text-light/70 hover:text-light cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="col-span-1 lg:col-span-12 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          Error general: {error}
        </div>
      )}

      {/* LEFT PANEL: Database View / Active Config */}
      <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">

        {/* Dynamic Config details */}
        <div className="glass-card rounded-2xl p-6 border border-accent/10">
          <h3 className="text-lg font-display font-bold text-light mb-4 flex items-center gap-2 border-b border-accent/10 pb-2">
            <Settings className="w-5 h-5 text-secondary" />
            Configuración Activa (Astro / Supabase)
          </h3>
          {loading ? (
            <div className="flex justify-center py-6 text-xs text-light/50">Cargando variables...</div>
          ) : !config ? (
            <div className="text-xs text-light/50">No hay configuraciones.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1 p-3 bg-dark/40 rounded-xl">
                <span className="text-[10px] text-accent font-bold uppercase">Event Name (main_events.name)</span>
                <span className="font-semibold text-light">{config.event?.name || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-dark/40 rounded-xl">
                <span className="text-[10px] text-accent font-bold uppercase">Active Slug (APP_NAME_SLUG)</span>
                <span className="font-mono text-light font-bold">{config.event?.slug || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-dark/40 rounded-xl">
                <span className="text-[10px] text-accent font-bold uppercase">Active Edition (editions.slug)</span>
                <span className="font-semibold text-light">{config.edition?.slug || 'N/A'} (Año {config.edition?.year})</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-dark/40 rounded-xl">
                <span className="text-[10px] text-accent font-bold uppercase">Dates (editions.start_date)</span>
                <span className="font-semibold text-light">{config.edition?.start_date} al {config.edition?.end_date}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-dark/40 rounded-xl sm:col-span-2">
                <span className="text-[10px] text-accent font-bold uppercase">Brand Colors (main_events.brand_colors)</span>
                <span className="font-mono text-light flex gap-4">
                  <span>Primary: <span style={{ color: config.event?.brand_colors?.primary || '#0B5D1E' }} className="font-bold">{config.event?.brand_colors?.primary || '#0B5D1E'}</span></span>
                  <span>Secondary: <span style={{ color: config.event?.brand_colors?.secondary || '#4CAF50' }} className="font-bold">{config.event?.brand_colors?.secondary || '#4CAF50'}</span></span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Speakers List */}
        <div className="glass-card rounded-2xl p-6 border border-accent/10 flex-grow">
          <h3 className="text-lg font-display font-bold text-light mb-4 flex items-center gap-2 border-b border-accent/10 pb-2">
            <Users className="w-5 h-5 text-secondary" />
            Ponentes de la Edición
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-light/60 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
              <span>Cargando ponentes desde Supabase...</span>
            </div>
          ) : speakers.length === 0 ? (
            <div className="text-center py-12 text-light/50 border border-dashed border-accent/10 rounded-xl">
              No se encontraron registros de ponentes asignados a sesiones en esta edición.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {speakers.map((spk) => (
                <div key={spk.id} className="bg-dark/40 border border-accent/5 rounded-xl p-4 flex gap-4 hover:border-secondary/30 transition-all">
                  {spk.photo_url ? (
                    <img
                      src={spk.photo_url}
                      alt={spk.full_name}
                      className="w-12 h-12 rounded-full object-cover border border-accent/20 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-accent/20 flex items-center justify-center text-secondary font-bold flex-shrink-0">
                      {spk.full_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-bold text-light text-sm truncate">{spk.full_name}</h4>
                      <span className="text-[9px] bg-primary/10 border border-accent/10 px-2 py-0.5 rounded text-accent font-semibold flex-shrink-0">
                        {spk.institution || 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-secondary font-medium mt-0.5">{spk.specialty}</p>
                    <p className="text-xs text-light/65 mt-1.5 line-clamp-2">{spk.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Test Mutation */}
      <div className="col-span-1 lg:col-span-5">
        <div className="glass-card rounded-2xl p-6 border border-accent/10 h-full flex flex-col justify-between">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <h3 className="text-lg font-display font-bold text-light mb-2 flex items-center gap-2 border-b border-accent/10 pb-3">
              <Send className="w-5 h-5 text-secondary" />
              Probar Registro REST
            </h3>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-[11px] text-light/80 leading-relaxed">
              <span className="font-semibold text-secondary block mb-1">Simulación Supabase:</span>
              Crea un perfil de usuario en <code className="bg-dark/50 px-1 text-light rounded">profiles</code> e inserta una pre-inscripción en <code className="bg-dark/50 px-1 text-light rounded">event_participants</code> utilizando PostgREST.
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Nombres</label>
                <input
                  type="text"
                  placeholder="Juan Carlos"
                  value={firstNames}
                  onChange={(e) => setFirstNames(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Apellidos</label>
                <input
                  type="text"
                  placeholder="Pérez"
                  value={lastNames}
                  onChange={(e) => setLastNames(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Tipo Doc</label>
                <select
                  value={docType}
                  onChange={(e: any) => setDocType(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-secondary"
                >
                  <option value="DNI">DNI</option>
                  <option value="CARNET_EXTRANJERIA">C.E.</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Número Doc</label>
                <input
                  type="text"
                  placeholder="71234567"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Correo</label>
                <input
                  type="email"
                  placeholder="juan@unap.edu.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Teléfono</label>
                <input
                  type="text"
                  placeholder="987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Institución</label>
                <input
                  type="text"
                  placeholder="UNAP"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            {/* IDs configs */}
            <div className="border-t border-accent/10 pt-3 mt-1 flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">UUID Edición</label>
                <input
                  type="text"
                  value={customEditionId}
                  onChange={(e) => setCustomEditionId(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 font-mono text-light focus:outline-none focus:border-secondary"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">UUID Evento Principal</label>
                <input
                  type="text"
                  value={customMainEventId}
                  onChange={(e) => setCustomMainEventId(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 font-mono text-light focus:outline-none focus:border-secondary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutationLoading}
              className="mt-4 bg-primary hover:bg-accent disabled:bg-primary/20 text-dark font-display font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-secondary/15 hover:shadow-secondary/25"
            >
              {mutationLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ejecutar Registro REST
                </>
              )}
            </button>
          </form>

          {/* Results box */}
          <div className="mt-6 border-t border-accent/10 pt-4 flex-grow flex flex-col justify-end">
            {mutationResult && (
              <div className="bg-primary/10 border border-secondary/30 rounded-xl p-4 text-xs">
                <div className="flex items-center gap-1.5 text-secondary font-bold mb-2">
                  <CheckCircle className="w-4 h-4" />
                  {mutationResult.message}
                </div>
                <pre className="bg-dark/40 p-2 rounded text-[10px] font-mono text-light overflow-x-auto max-h-40">
                  {JSON.stringify(mutationResult.data, null, 2)}
                </pre>
              </div>
            )}

            {mutationError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs">
                <div className="flex items-center gap-1.5 text-red-400 font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Error en Supabase
                </div>
                <p className="text-light/80 leading-relaxed font-mono text-[10px]">
                  {mutationError}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
