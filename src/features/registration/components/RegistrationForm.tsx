import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Send, ArrowRight, FileCheck } from 'lucide-react';
import { checkProfileRegistration, createRegistration, fetchConfig } from '../../../lib/supabase';
import confetti from 'canvas-confetti';

const registrationSchema = z.object({
  firstNames: z
    .string()
    .min(2, { message: 'El nombre completo debe tener al menos 2 caracteres.' })
    .max(50, { message: 'El nombre es demasiado largo.' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre debe contener solo letras y espacios.' }),
  lastNames: z
    .string()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
    .max(50, { message: 'El apellido es demasiado largo.' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El apellido debe contener solo letras y espacios.' }),
  email: z
    .string()
    .email({ message: 'Ingrese un correo electrónico válido.' }),
  docType: z.enum(['DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE'], {
    message: 'Seleccione un tipo de documento válido.',
  }),
  documentNumber: z
    .string()
    .min(8, { message: 'El documento de identidad debe tener al menos 8 dígitos.' })
    .max(12, { message: 'El documento de identidad es demasiado largo.' })
    .regex(/^[a-zA-Z0-9]+$/, { message: 'El documento debe contener solo letras y números.' }),
  institution: z
    .string()
    .min(3, { message: 'Ingrese el nombre de su institución.' })
    .max(120, { message: 'El nombre de la institución es demasiado largo.' }),
  ticketReference: z
    .string()
    .min(2, { message: 'Seleccione un tipo de certificación válido.' }),
});

type RegistrationFormInput = z.infer<typeof registrationSchema>;

const queryClient = new QueryClient();

interface ThematicLine {
  id: string;
  name: string;
}

interface RegistrationFormProps {
  editionId?: string;
  mainEventId?: string;
  thematicLines?: ThematicLine[];
  registrationCategories?: string[];
}

const RegistrationFormContent: React.FC<RegistrationFormProps> = ({
  editionId,
  mainEventId,
  registrationCategories
}) => {
  const DEFAULT_CATEGORIES = ["Pregrado", "Postgrado", "Público General"];

  const categories = registrationCategories && registrationCategories.length > 0
    ? registrationCategories
    : DEFAULT_CATEGORIES;

  const [docCheckStatus, setDocCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationFormInput | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset
  } = useForm<RegistrationFormInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstNames: '',
      lastNames: '',
      email: '',
      docType: 'DNI',
      documentNumber: '',
      institution: '',
      ticketReference: categories[0] || 'Pregrado',
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormInput) => {
      let activeEditionId = editionId;
      let activeMainEventId = mainEventId;

      if (!activeEditionId || !activeMainEventId) {
        const config = await fetchConfig();
        activeEditionId = activeEditionId || config.edition?.id || undefined;
        activeMainEventId = activeMainEventId || config.event?.id || undefined;
      }

      if (!activeEditionId || !activeMainEventId) {
        throw new Error('No se pudo determinar el evento o edición activos. Por favor, asegúrate de que existan registros configurados en la base de datos.');
      }

      // Check if already registered
      const check = await checkProfileRegistration(
        data.email,
        data.docType,
        data.documentNumber,
        activeEditionId
      );

      if (check.isRegisteredForEdition) {
        throw new Error('El número de documento o correo electrónico ya se encuentra registrado para este evento.');
      }

      // Create/update profile and insert into event_participants
      await createRegistration({
        profileId: check.profileId,
        email: data.email,
        firstNames: data.firstNames,
        lastNames: data.lastNames,
        docType: data.docType,
        docNumber: data.documentNumber,
        institution: data.institution,
        ticketReference: data.ticketReference,
        editionId: activeEditionId,
        mainEventId: activeMainEventId
      });

      return data;
    },
    onSuccess: (data) => {
      setSubmittedData(data);
      setIsSubmitted(true);
      reset();

      // Trigger premium confetti animations on success
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4ade80', '#fbbf24', '#38bdf8', '#ec4899', '#f8fafc']
        });
      } catch (e) {
        console.error('Confetti animation error:', e);
      }
    },
  });

  const onSubmit = (data: RegistrationFormInput) => {
    registrationMutation.mutate(data);
  };

  return (
    <div className="w-full relative overflow-hidden">
      {/* Decorative leaf glows */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

      {!isSubmitted ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 relative z-10"
          noValidate
        >
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nombres */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="firstNames" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Nombres
              </label>
              <input
                type="text"
                id="firstNames"
                placeholder="Ej: Juan Carlos"
                {...register('firstNames')}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.firstNames ? 'border-red-500 focus:ring-red-500' : 'border-border/80 hover:border-foreground/30'
                  }`}
                aria-invalid={errors.firstNames ? 'true' : 'false'}
                aria-describedby={errors.firstNames ? 'firstNames-error' : undefined}
              />
              {errors.firstNames && (
                <span id="firstNames-error" className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                  {errors.firstNames.message}
                </span>
              )}
            </div>

            {/* Apellidos */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastNames" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Apellidos
              </label>
              <input
                type="text"
                id="lastNames"
                placeholder="Ej: Pérez Gómez"
                {...register('lastNames')}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.lastNames ? 'border-red-500 focus:ring-red-500' : 'border-border/80 hover:border-foreground/30'
                  }`}
                aria-invalid={errors.lastNames ? 'true' : 'false'}
                aria-describedby={errors.lastNames ? 'lastNames-error' : undefined}
              />
              {errors.lastNames && (
                <span id="lastNames-error" className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                  {errors.lastNames.message}
                </span>
              )}
            </div>

            {/* Tipo de Documento */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="docType" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tipo de Documento
              </label>
              <select
                id="docType"
                {...register('docType')}
                className="w-full bg-background border border-border/80 hover:border-foreground/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="DNI" className="bg-background text-foreground">DNI</option>
                <option value="CARNET_EXTRANJERIA" className="bg-background text-foreground">Carnet de Extranjería</option>
                <option value="PASAPORTE" className="bg-background text-foreground">Pasaporte</option>
              </select>
              {errors.docType && (
                <span className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                  {errors.docType.message}
                </span>
              )}
            </div>

            {/* Número de Documento */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="documentNumber" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Número de Documento
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="documentNumber"
                  placeholder="Ej: 71234567"
                  {...register('documentNumber')}
                  onBlur={async () => {
                    const value = getValues('documentNumber');
                    const docType = getValues('docType');
                    if (!value || !docType) { setDocCheckStatus('idle'); return; }
                    setDocCheckStatus('checking');
                    try {
                      let activeEditionId = editionId;
                      if (!activeEditionId) {
                        const config = await fetchConfig();
                        activeEditionId = config.edition?.id || "";
                      }
                      const check = await checkProfileRegistration('', docType, value, activeEditionId);
                      setDocCheckStatus(check.isRegisteredForEdition ? 'taken' : 'available');
                    } catch (e) {
                      console.error(e);
                      setDocCheckStatus('idle');
                    }
                  }}
                  className={`w-full bg-background border rounded-xl pl-4 pr-10 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.documentNumber ? 'border-red-500 focus:ring-red-500' : 'border-border/80 hover:border-foreground/30'
                    }`}
                  aria-invalid={errors.documentNumber ? 'true' : 'false'}
                  aria-describedby={errors.documentNumber ? 'documentNumber-error' : undefined}
                />
                {docCheckStatus === 'checking' && (
                  <Loader2 className="w-4 h-4 text-secondary animate-spin absolute right-3 top-3.5" />
                )}
                {docCheckStatus === 'available' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-3.5" />
                )}
              </div>
              {docCheckStatus === 'taken' && (
                <span className="text-xs text-red-500 mt-1">El documento ya está registrado.</span>
              )}
              {errors.documentNumber && (
                <span id="documentNumber-error" className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                  {errors.documentNumber.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="Ej: jperez@unap.edu.pe"
                {...register('email')}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-border/80 hover:border-foreground/30'
                  }`}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span id="email-error" className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Institution */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="institution" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Institución / Universidad
              </label>
              <input
                type="text"
                id="institution"
                placeholder="Ej: Universidad Nacional de la Amazonía Peruana"
                {...register('institution')}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.institution ? 'border-red-500 focus:ring-red-500' : 'border-border/80 hover:border-foreground/30'
                  }`}
                aria-invalid={errors.institution ? 'true' : 'false'}
                aria-describedby={errors.institution ? 'institution-error' : undefined}
              />
              {errors.institution && (
                <span id="institution-error" className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                  {errors.institution.message}
                </span>
              )}
            </div>

            {/* Ticket select - PREGRADO, POSTGRADO or GENERAL */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="ticketReference" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tipo de Certificación Deseada
              </label>
              <select
                id="ticketReference"
                {...register('ticketReference')}
                className="w-full bg-background border border-border/80 hover:border-foreground/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-background text-foreground">{cat}</option>
                ))}
              </select>
              {errors.ticketReference && (
                <span className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                  {errors.ticketReference.message}
                </span>
              )}
            </div>
          </div>

          {/* Error general state */}
          {registrationMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs sm:text-sm text-red-400">
              {registrationMutation.error instanceof Error
                ? registrationMutation.error.message
                : 'Ocurrió un error al enviar el formulario. Por favor, inténtelo de nuevo.'}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={registrationMutation.isPending || docCheckStatus === 'checking' || docCheckStatus === 'taken'}
            className="mt-4 w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:text-primary-foreground/50 text-[#0D1F17] font-display font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {registrationMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando Registro...
              </>
            ) : (
              <>
                Enviar Inscripción
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center text-center p-2 relative z-10">
          <div className="w-16 h-16 bg-primary/20 rounded-full border border-secondary/40 flex items-center justify-center text-secondary mb-6 shadow-[0_0_20px_rgba(76,175,80,0.25)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="font-display font-bold text-2xl text-foreground mb-2">¡Inscripción Exitosa!</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            Su solicitud ha sido recibida con éxito. Se ha enviado un correo de confirmación con los pasos detallados para realizar el pago de la certificación.
          </p>

          {/* Receipt Summary Card */}
          <div className="w-full bg-muted/20 border border-border/80 rounded-2xl p-5 mb-8 text-left flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary border-b border-border pb-2.5">
              <FileCheck className="w-5 h-5 text-secondary" />
              <span className="font-display font-semibold text-sm">Resumen de Registro</span>
            </div>
            <div className="grid grid-cols-3 text-xs gap-y-2.5">
              <span className="text-muted-foreground font-medium col-span-1">Participante:</span>
              <span className="text-foreground font-semibold col-span-2 truncate">{submittedData?.firstNames} {submittedData?.lastNames}</span>

              <span className="text-muted-foreground font-medium col-span-1">Documento:</span>
              <span className="text-foreground font-semibold col-span-2">{submittedData?.docType}: {submittedData?.documentNumber}</span>

              <span className="text-muted-foreground font-medium col-span-1">Correo:</span>
              <span className="text-foreground font-semibold col-span-2 truncate">{submittedData?.email}</span>

              <span className="text-muted-foreground font-medium col-span-1">Modalidad:</span>
              <span className="text-secondary font-bold col-span-2">Certificación {submittedData?.ticketReference}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-secondary hover:text-primary border border-secondary/20 hover:border-primary/40 bg-transparent py-2.5 px-5 rounded-full transition-all cursor-pointer"
            >
              Registrar otra persona
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-muted/10 py-2.5 px-5 rounded-full transition-all cursor-pointer"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  editionId,
  mainEventId,
  thematicLines,
  registrationCategories
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RegistrationFormContent
        editionId={editionId}
        mainEventId={mainEventId}
        thematicLines={thematicLines}
        registrationCategories={registrationCategories}
      />
    </QueryClientProvider>
  );
};
