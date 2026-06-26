// ============================================
// Resend Client — Congress Portal
// ============================================
import { Resend } from 'resend';

/**
 * Resend API key from environment variables.
 * In Astro SSR, use import.meta.env for accessing env vars.
 */
const getResendApiKey = (): string | undefined => {
  // Server-side (Astro SSR / Node)
  if (typeof process !== 'undefined' && process.env?.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY;
  }
  // Astro import.meta.env fallback
  try {
    return (import.meta as any).env?.RESEND_API_KEY;
  } catch {
    return undefined;
  }
};

const getEnv = (key: string, fallback: string): string => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]!;
  }
  try {
    return (import.meta as any).env?.[key] || fallback;
  } catch {
    return fallback;
  }
};

// ── Resend instance ──────────────────────────
const apiKey = getResendApiKey();
export const resend = apiKey ? new Resend(apiKey) : null;

// ── Sender configuration ────────────────────
export const FROM_EMAIL = getEnv('RESEND_FROM_EMAIL', 'noreply@bequi.site');
export const FROM_NAME = getEnv('RESEND_FROM_NAME', 'EVENTOSZYNC');
export const FROM_FIELD = `${FROM_NAME} <${FROM_EMAIL}>`;

// ── Portal URL ───────────────────────────────
export const PORTAL_URL = getEnv('PORTAL_URL', 'http://localhost:4321');

/**
 * Checks if the Resend client is properly initialized.
 */
export function isResendReady(): boolean {
  return resend !== null;
}
