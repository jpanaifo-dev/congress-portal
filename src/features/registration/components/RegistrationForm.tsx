import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Send, ArrowRight, FileCheck } from 'lucide-react';
import type { RegistrationInput } from '../../../types';

const registrationSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: 'El nombre completo debe tener al menos 3 caracteres.' })
    .max(100, { message: 'El nombre completo es demasiado largo.' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre debe contener solo letras y espacios.' }),
  email: z
    .string()
    .email({ message: 'Ingrese un correo electrónico válido.' }),
  phone: z
    .string()
    .min(9, { message: 'El teléfono debe tener al menos 9 dígitos.' })
    .max(15, { message: 'El teléfono es demasiado largo.' })
    .regex(/^[+0-9\s]+$/, { message: 'El teléfono debe contener solo números, espacios o "+".' }),
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationInput | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      institution: '',
      participantType: 'Pregrado',
      researchArea: '',
    },
  });

  // Mock API post handler using TanStack Query Mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationInput) => {
      // Simulate API call lag
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return data;
    },
    onSuccess: (data) => {
      setSubmittedData(data);
      setIsSubmitted(true);
      reset();
    },
  });

  const onSubmit = (data: RegistrationInput) => {
    registrationMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-dark/60 backdrop-blur-xl border border-accent/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
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
              <h3 className="font-display font-bold text-2xl text-white">Ficha de Pre-Inscripción</h3>
              <p className="text-sm text-light/75 mt-1.5">
                Complete el formulario con sus datos reales para reservar su cupo académico en el Encuentro.
              </p>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="fullName" className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Ej: Juan Pérez Flores"
                  {...register('fullName')}
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${
                    errors.fullName ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
                  }`}
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <span id="fullName-error" className="text-xs text-red-400 font-medium mt-0.5" role="alert">
                    {errors.fullName.message}
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
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${
                    errors.email ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
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
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${
                    errors.phone ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
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
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-light/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${
                    errors.institution ? 'border-red-500/60 focus:ring-red-500' : 'border-accent/15'
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
                  className={`w-full bg-dark/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all ${
                    errors.researchArea ? 'border-red-500/60' : 'border-accent/15'
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
                Ocurrió un error al enviar el formulario. Por favor, inténtelo de nuevo.
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={registrationMutation.isPending}
              className="mt-4 w-full bg-secondary hover:bg-accent disabled:bg-primary/30 disabled:text-light/50 text-dark font-display font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-secondary/15 hover:shadow-secondary/25 active:scale-98"
            >
              {registrationMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando Registro...
                </>
              ) : (
                <>
                  Enviar Pre-Inscripción
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
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
            
            <h3 className="font-display font-bold text-2xl text-white mb-2">¡Pre-Inscripción Exitosa!</h3>
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
                <span className="text-white font-semibold col-span-2 truncate">{submittedData?.fullName}</span>

                <span className="text-light/50 font-medium col-span-1">Correo:</span>
                <span className="text-white font-semibold col-span-2 truncate">{submittedData?.email}</span>

                <span className="text-light/50 font-medium col-span-1">Modalidad:</span>
                <span className="text-secondary font-bold col-span-2">Certificación {submittedData?.participantType}</span>

                <span className="text-light/50 font-medium col-span-1">Área:</span>
                <span className="text-white font-semibold col-span-2">{submittedData?.researchArea}</span>
              </div>
            </div>

            <button
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-accent border border-secondary/20 hover:border-accent/40 bg-transparent py-2.5 px-5 rounded-full transition-all cursor-pointer"
            >
              Registrar otra persona
              <ArrowRight className="w-4 h-4" />
            </button>
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
