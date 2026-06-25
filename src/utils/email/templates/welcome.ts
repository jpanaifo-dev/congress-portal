// ============================================
// Welcome Email Template — Congress Portal
// ============================================
import type { WelcomeEmailData } from '../types';
import { wrapInBaseLayout } from './base-layout';

/**
 * Brand colors (mirrored from base-layout for inline usage).
 */
const C = {
  primary: '#22c55e',
  primaryDark: '#16a34a',
  accent: '#fbbf24',
  bgMuted: '#1a2420',
  bgCard: '#111916',
  textPrimary: '#f0fdf4',
  textSecondary: '#bbf7d0',
  textMuted: '#6b7f75',
  border: '#1e3a2a',
  borderLight: '#2d4f3c',
  white: '#ffffff',
} as const;

/**
 * Generates the HTML for the welcome/confirmation email
 * sent to participants after a successful event registration.
 */
export function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
  const {
    participantName,
    institution,
    ticketCategory,
    documentType,
    documentNumber,
    eventName = 'III Encuentro Científico',
    editionTitle,
    eventDates,
    eventLocation,
    eventModality,
    portalUrl = '/',
  } = data;

  // Format doc type label
  const docTypeLabel: Record<string, string> = {
    DNI: 'DNI',
    CARNET_EXTRANJERIA: 'Carnet de Extranjería',
    PASAPORTE: 'Pasaporte',
  };

  const content = `
    <!-- Success badge -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding-bottom: 28px;">
          <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%); border: 2px solid rgba(34, 197, 94, 0.3); border-radius: 50%; line-height: 64px; text-align: center;">
            <span style="font-size: 32px; line-height: 64px;">✓</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Title -->
    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: ${C.primary}; text-align: center; letter-spacing: -0.3px;">
      ¡Registro Exitoso!
    </h2>
    <p style="margin: 0 0 28px 0; font-size: 13px; color: ${C.textMuted}; text-align: center;">
      Tu inscripción ha sido procesada correctamente
    </p>

    <!-- Greeting -->
    <p style="margin: 0 0 6px 0; font-size: 15px; color: ${C.textPrimary}; line-height: 1.6;">
      Estimado(a) <strong style="color: ${C.textSecondary};">${participantName}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: ${C.textMuted}; line-height: 1.6;">
      Te damos la bienvenida al <strong style="color: ${C.textPrimary};">${eventName}</strong>${editionTitle ? ` — ${editionTitle}` : ''}. 
      Tu participación ha quedado registrada exitosamente en nuestro sistema.
    </p>

    <!-- Registration summary card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
      <tr>
        <td style="background-color: ${C.bgMuted}; border: 1px solid ${C.border}; border-radius: 12px; padding: 0; overflow: hidden;">
          <!-- Card header -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 14px 20px; border-bottom: 1px solid ${C.border}; background-color: rgba(34, 197, 94, 0.05);">
                <span style="font-size: 12px; font-weight: 700; color: ${C.primary}; text-transform: uppercase; letter-spacing: 1px;">
                  📋 Resumen de Registro
                </span>
              </td>
            </tr>
          </table>

          <!-- Card body -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 16px 20px;">
            <tr>
              <td style="padding: 6px 0; width: 140px; font-size: 12px; font-weight: 600; color: ${C.textMuted}; vertical-align: top;">
                Participante
              </td>
              <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: ${C.textPrimary};">
                ${participantName}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: ${C.textMuted}; vertical-align: top;">
                Documento
              </td>
              <td style="padding: 6px 0; font-size: 13px; color: ${C.textSecondary};">
                ${docTypeLabel[documentType] || documentType}: <strong>${documentNumber}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: ${C.textMuted}; vertical-align: top;">
                Institución
              </td>
              <td style="padding: 6px 0; font-size: 13px; color: ${C.textSecondary};">
                ${institution}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: ${C.textMuted}; vertical-align: top;">
                Certificación
              </td>
              <td style="padding: 6px 0;">
                <span style="display: inline-block; background-color: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.25); color: ${C.accent}; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${ticketCategory}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${eventDates || eventLocation || eventModality ? `
    <!-- Event details card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
      <tr>
        <td style="background-color: ${C.bgMuted}; border: 1px solid ${C.border}; border-radius: 12px; padding: 0; overflow: hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 14px 20px; border-bottom: 1px solid ${C.border}; background-color: rgba(34, 197, 94, 0.05);">
                <span style="font-size: 12px; font-weight: 700; color: ${C.primary}; text-transform: uppercase; letter-spacing: 1px;">
                  📅 Datos del Evento
                </span>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 16px 20px;">
            ${eventDates ? `
            <tr>
              <td style="padding: 6px 0; width: 140px; font-size: 12px; font-weight: 600; color: ${C.textMuted};">Fecha</td>
              <td style="padding: 6px 0; font-size: 13px; color: ${C.textSecondary}; font-weight: 600;">${eventDates}</td>
            </tr>
            ` : ''}
            ${eventLocation ? `
            <tr>
              <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: ${C.textMuted};">Ubicación</td>
              <td style="padding: 6px 0; font-size: 13px; color: ${C.textSecondary};">${eventLocation}</td>
            </tr>
            ` : ''}
            ${eventModality ? `
            <tr>
              <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: ${C.textMuted};">Modalidad</td>
              <td style="padding: 6px 0; font-size: 13px; color: ${C.textSecondary};">${eventModality}</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- CTA button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="${portalUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 100%); color: #052e16; font-size: 13px; font-weight: 800; padding: 14px 32px; border-radius: 10px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);">
            Visitar Portal del Evento →
          </a>
        </td>
      </tr>
    </table>

    <!-- Info note -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color: rgba(34, 197, 94, 0.05); border-left: 3px solid ${C.primary}; border-radius: 0 8px 8px 0; padding: 14px 16px;">
          <p style="margin: 0; font-size: 12px; color: ${C.textMuted}; line-height: 1.5;">
            <strong style="color: ${C.textSecondary};">Próximos pasos:</strong> Recibirás información adicional sobre el programa académico, instrucciones de pago para la certificación y detalles logísticos del evento en los próximos días.
          </p>
        </td>
      </tr>
    </table>
  `;

  return wrapInBaseLayout(content, {
    preheader: `¡Bienvenido(a) al ${eventName}! Tu registro ha sido confirmado.`,
    eventName,
  });
}

/**
 * Returns the email subject line for the welcome email.
 */
export function getWelcomeEmailSubject(eventName: string): string {
  return `✅ Registro Confirmado — ${eventName}`;
}
