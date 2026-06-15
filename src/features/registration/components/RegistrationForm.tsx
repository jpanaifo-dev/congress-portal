import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
// Duplicate import removed
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Send, ArrowRight, FileCheck } from 'lucide-react';
import type { RegistrationInput } from '../../../types';
import { nhost } from '../../../lib/nhost';
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
  phone: z
    .string()
    .min(9, { message: 'El teléfono debe tener al menos 9 dígitos.' })
    .max(15, { message: 'El teléfono es demasiado largo.' })
    .regex(/^[+0-9\s]+$/, { message: 'El teléfono debe contener solo números, espacios o "+".' }),
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
  participantType: z.enum(['Pregrado', 'Postgrado', 'Público General'], {
    message: 'Seleccione un tipo de participante válido.',
  }),
  researchArea: z
    .string()
    .min(3, { message: 'Seleccione o ingrese su área de investigación.' }),
});

const queryClient = new QueryClient();

// Internal Form Content Component that uses useMutation
const RegistrationFormContent: React.FC = () => {
  const [docCheckStatus, setDocCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationInput | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstNames: '',
      lastNames: '',
      email: '',
      phone: '',
      docType: 'DNI',
      documentNumber: '',
      institution: '',
      participantType: 'Pregrado',
      researchArea: '',
    },
  });

  // API handler with Nhost integration and validation
  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationInput) => {
      const subdomain = import.meta.env.PUBLIC_NHOST_SUBDOMAIN;
      const isConfigured = subdomain && subdomain !== 'xxxx-yyyy-zzzz';

      if (!isConfigured) {
        // Mock Mode Simulation: Check for mock duplicates
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (data.documentNumber === '12345678' || data.email === 'duplicate@test.com') {
          throw new Error('El número de documento o correo electrónico ya se encuentra registrado para este evento.');
        }
        return data;
      }

      // Live Mode check if email or (doc_type, doc_number) is already registered
      const checkResp = await nhost.graphql.request<any>({
        query: `
          query CheckRegistered($email: String!, $docType: document_type!, $docNumber: String!) {
            profiles(
              where: {
                _or: [
                  { email: { _eq: $email } },
                  {
                    _and: [
                      { doc_type: { _eq: $docType } },
                      { doc_number: { _eq: $docNumber } }
                    ]
                  }
                ]
              }
            ) {
              id
              email
              registrations {
                id
              }
            }
          }
        `,
        variables: {
          email: data.email,
          docType: data.docType,
          docNumber: data.documentNumber
        }
      });

      if (checkResp.body.errors && checkResp.body.errors.length > 0) {
        throw new Error(checkResp.body.errors.map((e: any) => e.message).join(', '));
      }

      const existingProfile = checkResp.body.data?.profiles?.[0];
      if (existingProfile && existingProfile.registrations?.length > 0) {
        throw new Error('El número de documento o correo electrónico ya se encuentra registrado para este evento.');
      }

      // Pre-registration mutation
      const profileId = existingProfile?.id || (crypto.randomUUID ? crypto.randomUUID() : 'b51bb9e5-9fa5-45d2-a7f4-ee1fa42921f0');

      let activeEditionId: string | null = null;
      let graphqlErrorMsg: string | null = null;
      try {
        const editionResp = await nhost.graphql.request<any>({
          query: `
            query GetActiveEdition {
              editions(order_by: { is_active: desc }, limit: 1) {
                id
              }
            }
          `
        });

        if (editionResp.body.errors && editionResp.body.errors.length > 0) {
          graphqlErrorMsg = editionResp.body.errors.map((e: any) => e.message).join(', ');
        } else {
          const firstEdition = editionResp.body.data?.editions?.[0];
          if (firstEdition?.id) {
            activeEditionId = firstEdition.id;
          }
        }
      } catch (err: any) {
        console.error('Error fetching active edition:', err);
        graphqlErrorMsg = err.message || String(err);
      }

      if (graphqlErrorMsg) {
        throw new Error(`Error al consultar ediciones: ${graphqlErrorMsg}. Asegúrate de que la tabla "editions" esté registrada (tracked) y tenga permisos de lectura (SELECT) en el Nhost Console.`);
      }

      if (!activeEditionId) {
        throw new Error('No se encontró ninguna edición del evento en la tabla "editions". Por favor, agrega al menos una edición en tu base de datos.');
      }

      const mutationResp = await nhost.graphql.request<any>({
        query: `
          mutation CreatePreRegistration(
            $profileId: uuid!,
            $email: String!,
            $firstNames: String!,
            $lastNames: String!,
            $docType: document_type!,
            $docNumber: String!,
            $phone: String,
            $institution: String,
            $editionId: uuid!,
            $participationType: participation_type!,
            $researchArea: research_area
          ) {
            insert_profiles_one(
              object: {
                id: $profileId,
                email: $email,
                first_names: $firstNames,
                last_names: $lastNames,
                doc_type: $docType,
                doc_number: $docNumber,
                phone: $phone,
                institution: $institution,
                role: participant
              },
              on_conflict: {
                constraint: profiles_pkey,
                update_columns: [first_names, last_names, doc_type, doc_number, phone, institution]
              }
            ) {
              id
            }
            insert_registrations_one(
              object: {
                profile_id: $profileId,
                edition_id: $editionId,
                participation_type: $participationType,
                research_area: $researchArea,
                payment_status: pending
              }
            ) {
              id
            }
          }
        `,
        variables: {
          profileId,
          email: data.email,
          firstNames: data.firstNames,
          lastNames: data.lastNames,
          docType: data.docType,
          docNumber: data.documentNumber,
          phone: data.phone,
          institution: data.institution,
          editionId: activeEditionId,
          participationType: data.participantType === 'Pregrado' ? 'pregrado' : data.participantType === 'Postgrado' ? 'postgrado' : 'publico_general',
          researchArea: data.researchArea === 'Ciencias de la Salud' ? 'ciencias_salud' : data.researchArea === 'Ciencias Naturales' ? 'ciencias_naturales' : data.researchArea === 'Ingenierías y Tecnología' ? 'ingenierias' : 'ciencias_sociales'
        }
      });

      if (mutationResp.body.errors && mutationResp.body.errors.length > 0) {
        throw new Error(mutationResp.body.errors.map((e: any) => e.message).join(', '));
      }

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

        // Dynamic multi-burst sidebar effects for extra premium feel
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.75 }
          });
        }, 200);

        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.75 }
          });
        }, 400);
      } catch (e) {
        console.error('Confetti animation error:', e);
      }
    },
  });

  const onSubmit = (data: RegistrationInput) => {
    registrationMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-dark/60 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border relative overflow-hidden">
      {/* Decorative leaf glows */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/5 rounded-full blur-2xl"></div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="registration-form"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6 relative z-10"
            noValidate
          >
            <div className="text-center sm:text-left mb-2">
              <p className="text-sm text-light/75 mt-1.5">
                Complete el formulario con sus datos reales para reservar su cupo académico en el Encuentro.
              </p>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nombres */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firstNames" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Nombres
                </label>
                <input
                  type="text"
                  id="firstNames"
                  placeholder="Ej: Juan Carlos"
                  {...register('firstNames')}
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${errors.firstNames ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
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
                <label htmlFor="lastNames" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Apellidos
                </label>
                <input
                  type="text"
                  id="lastNames"
                  placeholder="Ej: Pérez Gómez"
                  {...register('lastNames')}
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${errors.lastNames ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
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
                <label htmlFor="docType" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Tipo de Documento
                </label>
                <select
                  id="docType"
                  {...register('docType')}
                  className="w-full bg-dark/50 border border-accent/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                >
                  <option value="DNI">DNI</option>
                  <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
                {errors.docType && (
                  <span className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                    {errors.docType.message}
                  </span>
                )}
              </div>

              {/* Número de Documento */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="documentNumber" className="text-xs font-semibold text-accent uppercase tracking-wider">
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
                        const resp = await nhost.graphql.request<any>({
                          query: `
                            query CheckDoc($docType: document_type!, $docNumber: String!) {
                              profiles(where: { _and: [{ doc_type: { _eq: $docType } }, { doc_number: { _eq: $docNumber } }] }) {
                                id
                              }
                            }
                          `,
                          variables: { docType, docNumber: value },
                        });
                        const exists = resp.body.data?.profiles?.length > 0;
                        setDocCheckStatus(exists ? 'taken' : 'available');
                      } catch (e) {
                        console.error(e);
                        setDocCheckStatus('idle');
                      }
                    }}
                    className={`w-full bg-dark/50 border rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${errors.documentNumber ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
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
                <label htmlFor="email" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Ej: jperez@unap.edu.pe"
                  {...register('email')}
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${errors.email ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
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

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Teléfono / Celular
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Ej: +51 912345678"
                  {...register('phone')}
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${errors.phone ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
                    }`}
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <span id="phone-error" className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              {/* Institution */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="institution" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Institución / Universidad
                </label>
                <input
                  type="text"
                  id="institution"
                  placeholder="Ej: Universidad Nacional de la Amazonía Peruana"
                  {...register('institution')}
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${errors.institution ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
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

              {/* Participant Type Selection */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="participantType" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Tipo de Participante
                </label>
                <select
                  id="participantType"
                  {...register('participantType')}
                  className="w-full bg-dark/50 border border-accent/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                >
                  <option value="Pregrado">Pregrado</option>
                  <option value="Postgrado">Postgrado</option>
                  <option value="Público General">Público General</option>
                </select>
                {errors.participantType && (
                  <span className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                    {errors.participantType.message}
                  </span>
                )}
              </div>

              {/* Research Area / Area of Interest */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="researchArea" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Área de Investigación
                </label>
                <select
                  id="researchArea"
                  {...register('researchArea')}
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${errors.researchArea ? 'border-red-500/60' : 'border-accent/15'
                    }`}
                  aria-invalid={errors.researchArea ? 'true' : 'false'}
                  aria-describedby={errors.researchArea ? 'researchArea-error' : undefined}
                >
                  <option value="">-- Seleccione una área --</option>
                  <option value="Ciencias de la Salud">Ciencias de la Salud</option>
                  <option value="Ciencias Naturales">Ciencias Naturales</option>
                  <option value="Ingenierías y Tecnología">Ingenierías y Tecnología</option>
                  <option value="Ciencias Sociales y Políticas">Ciencias Sociales y Políticas</option>
                </select>
                {errors.researchArea && (
                  <span id="researchArea-error" className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                    {errors.researchArea.message}
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
              className="mt-4 w-full bg-secondary hover:bg-accent disabled:bg-primary/30 disabled:text-light/50 text-dark font-display font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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
            <a
              href="/"
              className="w-full text-center inline-block mt-4 text-xs font-semibold text-white/50 hover:text-white transition-colors hover:underline cursor-pointer"
            >
              Volver al Inicio
            </a>
          </motion.form>
        ) : (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="flex flex-col items-center text-center p-2 relative z-10"
          >
            <div className="w-16 h-16 bg-secondary/20 rounded-full border border-secondary/40 flex items-center justify-center text-secondary mb-6 shadow-[0_0_20px_rgba(76,175,80,0.25)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-display font-bold text-2xl text-white mb-2">¡Inscripción Exitosa!</h3>
            <p className="text-sm text-light/80 max-w-md mb-8">
              Su solicitud ha sido recibida con éxito. Se ha enviado un correo de confirmación con los pasos detallados para realizar el pago de la certificación.
            </p>

            {/* Receipt Summary Card */}
            <div className="w-full bg-primary/10 border border-accent/15 rounded-2xl p-5 mb-8 text-left flex flex-col gap-3">
              <div className="flex items-center gap-2 text-accent border-b border-accent/10 pb-2.5">
                <FileCheck className="w-5 h-5 text-secondary" />
                <span className="font-display font-semibold text-sm">Resumen de Registro</span>
              </div>
              <div className="grid grid-cols-3 text-xs gap-y-2.5">
                <span className="text-light/50 font-medium col-span-1">Participante:</span>
                <span className="text-white font-semibold col-span-2 truncate">{submittedData?.firstNames} {submittedData?.lastNames}</span>

                <span className="text-light/50 font-medium col-span-1">Documento:</span>
                <span className="text-white font-semibold col-span-2">{submittedData?.docType}: {submittedData?.documentNumber}</span>

                <span className="text-light/50 font-medium col-span-1">Correo:</span>
                <span className="text-white font-semibold col-span-2 truncate">{submittedData?.email}</span>

                <span className="text-light/50 font-medium col-span-1">Modalidad:</span>
                <span className="text-secondary font-bold col-span-2">Certificación {submittedData?.participantType}</span>

                <span className="text-light/50 font-medium col-span-1">Área:</span>
                <span className="text-white font-semibold col-span-2">{submittedData?.researchArea}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-secondary hover:text-accent border border-secondary/20 hover:border-accent/40 bg-transparent py-2.5 px-5 rounded-full transition-all cursor-pointer"
              >
                Registrar otra persona
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 py-2.5 px-5 rounded-full transition-all cursor-pointer"
              >
                Volver al Inicio
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Exported component with QueryClientProvider wrapper
export const RegistrationForm: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RegistrationFormContent />
    </QueryClientProvider>
  );
};
