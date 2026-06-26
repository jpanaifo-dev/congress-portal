// ============================================
// Email System Types — Congress Portal
// ============================================

/**
 * Represents an email recipient.
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Generic options for sending an email via Resend.
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Result of an email send operation.
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Data required to render the welcome email template
 * sent after a successful participant registration.
 */
export interface WelcomeEmailData {
  participantName: string;
  participantEmail: string;
  institution: string;
  ticketCategory: string;
  documentType: string;
  documentNumber: string;
  eventName: string;
  editionTitle?: string;
  eventDates?: string;
  eventLocation?: string;
  eventModality?: string;
  portalUrl?: string;
}

/**
 * Base options for the HTML email layout wrapper.
 */
export interface BaseLayoutOptions {
  preheader?: string;
  eventName?: string;
  showFooter?: boolean;
}
