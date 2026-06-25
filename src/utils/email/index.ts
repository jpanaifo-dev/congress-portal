// ============================================
// Email Module — Public API
// Congress Portal
// ============================================
//
// Usage:
//   import { sendWelcomeEmail } from '../utils/email';
//
//   await sendWelcomeEmail({
//     participantName: 'Juan Pérez',
//     participantEmail: 'juan@unap.edu.pe',
//     institution: 'UNAP',
//     ticketCategory: 'Postgrado',
//     documentType: 'DNI',
//     documentNumber: '71234567',
//     eventName: 'III Encuentro Científico',
//   });
//

export { sendEmail } from './sender';
export { isResendReady } from './client';
export type {
  EmailRecipient,
  SendEmailOptions,
  EmailResult,
  WelcomeEmailData,
  BaseLayoutOptions,
} from './types';

// ── High-level email functions ──────────────

import { sendEmail } from './sender';
import { buildWelcomeEmailHtml, getWelcomeEmailSubject } from './templates';
import type { WelcomeEmailData, EmailResult } from './types';

/**
 * Sends a welcome/confirmation email to a participant
 * after a successful event registration.
 *
 * This is a fire-and-forget operation — failures are logged
 * but do not throw, so they never block the registration flow.
 *
 * @param data - Participant and event data for the email template
 * @returns EmailResult indicating success or failure
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  const html = buildWelcomeEmailHtml(data);
  const subject = getWelcomeEmailSubject(data.eventName);

  return sendEmail({
    to: data.participantEmail,
    subject,
    html,
  });
}
