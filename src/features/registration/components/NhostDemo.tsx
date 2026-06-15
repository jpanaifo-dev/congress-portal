import React, { useEffect, useState } from 'react';
import { nhost } from '../../../lib/nhost';
import { GET_SPEAKERS, CREATE_PARTICIPANT_REGISTRATION } from '../../../lib/queries';
import type { DbSpeaker, DbParticipationType, DbResearchArea } from '../../../types';
import { 
  Users, 
  Database, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Code, 
  Sparkles,
  Terminal
} from 'lucide-react';

export const NhostDemo: React.FC = () => {
  // Query States
  const [speakers, setSpeakers] = useState<DbSpeaker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  // Mutation Form States
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [participationType, setParticipationType] = useState<DbParticipationType>('pregrado');
  const [researchArea, setResearchArea] = useState<DbResearchArea>('ciencias_salud');
  
  // Custom UUIDs for test demonstration
  const [customProfileId, setCustomProfileId] = useState<string>(
    crypto.randomUUID ? crypto.randomUUID() : 'b51bb9e5-9fa5-45d2-a7f4-ee1fa42921f0'
  );
  const [customEditionId, setCustomEditionId] = useState<string>('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');

  // Mutation Status States
  const [mutationLoading, setMutationLoading] = useState<boolean>(false);
  const [mutationResult, setMutationResult] = useState<any | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'speakers' | 'queries'>('speakers');

  const fetchSpeakers = async (forceMock = false) => {
    setLoading(true);
    setError(null);
    
    // Check if subdomain is default or missing
    const subdomain = import.meta.env.PUBLIC_NHOST_SUBDOMAIN;
    if (!subdomain || subdomain === 'xxxx-yyyy-zzzz' || forceMock) {
      // Load fallback mock data
      setTimeout(() => {
        setSpeakers([
          {
            id: 'spk-1',
            full_name: 'Dr. Alberto Ruiz (Mock)',
            specialty: 'Ecología Tropical y Biodiversidad',
            bio: 'Investigador principal de bosques inundables en el llano amazónico.',
            photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            institution: 'UNAP',
            created_at: new Date().toISOString()
          },
          {
            id: 'spk-2',
            full_name: 'Dra. Elena Rostova (Mock)',
            specialty: 'Ciencia de Datos y Monitoreo Ambiental',
            bio: 'Especialista en inteligencia artificial aplicada a la teledetección forestal.',
            photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            institution: 'UNAP',
            created_at: new Date().toISOString()
          }
        ]);
        setIsMockMode(true);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const resp = await nhost.graphql.request<{ speakers: DbSpeaker[] }>({
        query: GET_SPEAKERS,
      });

      if (resp.body.errors && resp.body.errors.length > 0) {
        throw new Error(
          resp.body.errors.map(e => e.message).join(', ')
        );
      }

      setSpeakers(resp.body.data?.speakers || []);
      setIsMockMode(false);
    } catch (err: any) {
      console.warn("Nhost GraphQL failed, falling back to mock mode:", err.message);
      setError(err.message || 'Error al conectar con Nhost GraphQL');
      // Auto-fallback to mock mode
      fetchSpeakers(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMutationLoading(true);
    setMutationResult(null);
    setMutationError(null);

    if (isMockMode) {
      // Mock successful mutation response
      setTimeout(() => {
        setMutationResult({
          profile: {
            id: customProfileId,
            email,
            full_name: fullName,
            role: 'participant'
          },
          registration: {
            id: crypto.randomUUID ? crypto.randomUUID() : 'reg-12345',
            participation_type: participationType,
            research_area: researchArea,
            payment_status: 'pending',
            created_at: new Date().toISOString()
          }
        });
        setMutationLoading(false);
      }, 1500);
      return;
    }

    try {
      const resp = await nhost.graphql.request<any>({
        query: CREATE_PARTICIPANT_REGISTRATION,
        variables: {
          profileId: customProfileId,
          email,
          fullName,
          phone: phone || null,
          institution: institution || null,
          editionId: customEditionId,
          participationType,
          researchArea
        }
      });

      if (resp.body.errors && resp.body.errors.length > 0) {
        throw new Error(
          resp.body.errors.map(e => e.message).join(', ')
        );
      }

      setMutationResult(resp.body.data);
    } catch (err: any) {
      setMutationError(err.message || 'Error al procesar la mutación en Nhost');
    } finally {
      setMutationLoading(false);
    }
  };

  const regenerateProfileId = () => {
    setCustomProfileId(crypto.randomUUID ? crypto.randomUUID() : 'b51bb9e5-9fa5-45d2-a7f4-ee1fa42921f0');
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 text-light">
      
      {/* Header and status info bar */}
      <div className="col-span-1 lg:col-span-12 glass-card rounded-2xl p-6 border border-accent/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-secondary" />
            Consola de Integración Nhost
          </h2>
          <p className="text-xs text-light/70 mt-1">
            Esta pantalla demuestra la conexión GraphQL contra las tablas enlazadas de tu base de datos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            isMockMode 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'bg-secondary/15 text-secondary border border-secondary/30'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            {isMockMode ? 'Modo Simulado (Mock)' : 'Conectado a Nhost'}
          </span>
          <button 
            onClick={() => fetchSpeakers(false)}
            className="p-2 bg-dark border border-accent/15 rounded-lg hover:border-secondary transition-all text-light/70 hover:text-white cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LEFT PANEL: Database View / Query view */}
      <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
        
        {/* Tabs switcher */}
        <div className="flex border-b border-accent/10">
          <button
            onClick={() => setActiveTab('speakers')}
            className={`px-5 py-2.5 font-display text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'speakers' 
                ? 'border-secondary text-secondary font-bold' 
                : 'border-transparent text-light/60 hover:text-light'
            }`}
          >
            <Users className="w-4 h-4" />
            Ponentes de Base de Datos
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`px-5 py-2.5 font-display text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'queries' 
                ? 'border-secondary text-secondary font-bold' 
                : 'border-transparent text-light/60 hover:text-light'
            }`}
          >
            <Code className="w-4 h-4" />
            Estructuras GraphQL
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'speakers' ? (
          <div className="glass-card rounded-2xl p-6 border border-accent/10 flex-grow">
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              Tabla: `speakers`
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-light/60 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
                <span>Cargando ponentes desde la base de datos...</span>
              </div>
            ) : speakers.length === 0 ? (
              <div className="text-center py-12 text-light/50 border border-dashed border-accent/10 rounded-xl">
                No se encontraron registros en la tabla `speakers`.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {speakers.map((spk) => (
                  <div key={spk.id} className="bg-dark/40 border border-accent/5 rounded-xl p-4 flex gap-4 hover:border-secondary/30 transition-all">
                    {spk.photo_url ? (
                      <img 
                        src={spk.photo_url} 
                        alt={spk.full_name} 
                        className="w-14 h-14 rounded-full object-cover border border-accent/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/20 border border-accent/20 flex items-center justify-center text-secondary font-bold flex-shrink-0">
                        {spk.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display font-bold text-white text-base truncate">{spk.full_name}</h4>
                        <span className="text-[10px] bg-primary/10 border border-accent/10 px-2 py-0.5 rounded text-accent font-semibold flex-shrink-0">
                          {spk.institution || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-secondary font-medium mt-0.5">{spk.specialty}</p>
                      <p className="text-xs text-light/65 mt-2 line-clamp-2">{spk.bio}</p>
                      <div className="text-[9px] text-light/40 mt-3 font-mono">ID: {spk.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 border border-accent/10 flex-grow font-mono text-xs flex flex-col gap-4 overflow-x-auto">
            <div>
              <div className="flex items-center gap-2 text-white font-sans font-semibold mb-2">
                <Terminal className="w-4 h-4 text-secondary" />
                Consulta: Obtener Ponentes (GET_SPEAKERS)
              </div>
              <pre className="bg-dark/60 border border-accent/10 rounded-lg p-3 text-emerald-400 overflow-x-auto">
                {GET_SPEAKERS.trim()}
              </pre>
            </div>

            <div>
              <div className="flex items-center gap-2 text-white font-sans font-semibold mb-2">
                <Terminal className="w-4 h-4 text-secondary" />
                Mutación: Registro Transaccional (CREATE_PARTICIPANT_REGISTRATION)
              </div>
              <pre className="bg-dark/60 border border-accent/10 rounded-lg p-3 text-cyan-400 overflow-x-auto">
                {CREATE_PARTICIPANT_REGISTRATION.trim()}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Mutation Playground Form */}
      <div className="col-span-1 lg:col-span-5">
        <div className="glass-card rounded-2xl p-6 border border-accent/10 h-full flex flex-col justify-between">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <h3 className="text-lg font-display font-bold text-white mb-2 flex items-center gap-2 border-b border-accent/10 pb-3">
              <Send className="w-5 h-5 text-secondary" />
              Probar Mutación de Registro
            </h3>

            {/* Simulated environment variables details */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-[11px] text-light/80 leading-relaxed">
              <span className="font-semibold text-secondary block mb-1">Simulación Transaccional:</span>
              Crea un perfil de usuario en <code className="bg-dark/50 px-1 text-white rounded">profiles</code> e inserta una pre-inscripción en <code className="bg-dark/50 px-1 text-white rounded">registrations</code> usando UUIDs asociados.
            </div>

            {/* Profile ID config */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">UUID del Perfil (Simular Auth)</label>
                <button 
                  type="button" 
                  onClick={regenerateProfileId}
                  className="text-[10px] text-secondary hover:underline cursor-pointer"
                >
                  Regenerar UUID
                </button>
              </div>
              <input
                type="text"
                value={customProfileId}
                onChange={(e) => setCustomProfileId(e.target.value)}
                className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-secondary"
                required
              />
            </div>

            {/* Edition ID config */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">UUID del Evento/Edición</label>
              <input
                type="text"
                value={customEditionId}
                onChange={(e) => setCustomEditionId(e.target.value)}
                className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-secondary"
                required
              />
            </div>

            {/* User details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Correo</label>
                <input
                  type="email"
                  placeholder="juan@unap.edu.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-secondary"
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
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Institución</label>
                <input
                  type="text"
                  placeholder="UNAP"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            {/* Enums dropdown selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Participación</label>
                <select
                  value={participationType}
                  onChange={(e) => setParticipationType(e.target.value as DbParticipationType)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-secondary"
                >
                  <option value="pregrado">Pregrado</option>
                  <option value="postgrado">Postgrado</option>
                  <option value="publico_general">Público General</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-accent">Área Investigación</label>
                <select
                  value={researchArea}
                  onChange={(e) => setResearchArea(e.target.value as DbResearchArea)}
                  className="bg-dark/50 border border-accent/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-secondary"
                >
                  <option value="ciencias_salud">Ciencias de la Salud</option>
                  <option value="ciencias_naturales">Ciencias Naturales</option>
                  <option value="ingenierias">Ingenierías y Tecnología</option>
                  <option value="ciencias_sociales">Ciencias Sociales</option>
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={mutationLoading}
              className="mt-4 bg-secondary hover:bg-accent disabled:bg-primary/20 text-dark font-display font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-secondary/15 hover:shadow-secondary/25"
            >
              {mutationLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Ejecutando mutación...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ejecutar Mutación GraphQL
                </>
              )}
            </button>
          </form>

          {/* Results box */}
          <div className="mt-6 border-t border-accent/10 pt-4 flex-grow flex flex-col justify-end">
            {mutationResult && (
              <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-xs">
                <div className="flex items-center gap-1.5 text-secondary font-bold mb-2">
                  <CheckCircle className="w-4 h-4" />
                  ¡Registro guardado con éxito!
                </div>
                <pre className="bg-dark/40 p-2 rounded text-[10px] font-mono text-light overflow-x-auto max-h-40">
                  {JSON.stringify(mutationResult, null, 2)}
                </pre>
              </div>
            )}

            {mutationError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs">
                <div className="flex items-center gap-1.5 text-red-400 font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Error en la Base de Datos Nhost
                </div>
                <p className="text-light/80 leading-relaxed font-mono text-[10px]">
                  {mutationError}
                </p>
                <div className="mt-2 text-[9px] text-light/50">
                  Tip: Asegúrate de que el UUID de la Edición exista en tu tabla `editions`.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};
