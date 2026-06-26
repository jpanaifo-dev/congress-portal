// ============================================
// Email Sender — Congress Portal
// ============================================
import { resend, FROM_FIELD, isResendReady } from './client';
import type { SendEmailOptions, EmailResult } from './types';

/**
 * Sends an email using the Resend API.
 *
 * This is the low-level send function. For specific email types,
 * use the high-level functions exported from the module index
 * (e.g., sendWelcomeEmail).
 *
 * @param options - Email sending options (to, subject, html)
 * @returns EmailResult with success status and optional error
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  if (!isResendReady() || !resend) {
    console.warn(
      '[Email] Resend no está inicializado (falta RESEND_API_KEY). Email omitido:',
      options.subject
    );
    return {
      success: false,
      error: 'Resend no está configurado. Verifique la variable RESEND_API_KEY.',
    };
  }

  try {
    const response = await resend.emails.send({
      from: FROM_FIELD,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    });

    if (response.error) {
      console.error('[Email] Error de Resend:', response.error);
      return {
        success: false,
        error: response.error.message || 'Error desconocido al enviar email.',
      };
    }

    console.log(`[Email] Enviado correctamente: "${options.subject}" → ${options.to}`);
    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error inesperado al enviar email';
    console.error('[Email] Excepción al enviar:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
