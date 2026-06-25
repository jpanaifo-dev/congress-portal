// ============================================
// Base Email Layout — Congress Portal
// ============================================
import type { BaseLayoutOptions } from '../types';

/**
 * Brand colors consistent with the congress portal design system.
 */
const COLORS = {
  // Primary greens
  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryBg: '#052e16',

  // Backgrounds
  bgDark: '#0a0f0d',
  bgCard: '#111916',
  bgCardAlt: '#0d1512',
  bgMuted: '#1a2420',

  // Text
  textPrimary: '#f0fdf4',
  textSecondary: '#bbf7d0',
  textMuted: '#6b7f75',
  textDim: '#4a5e54',

  // Accents
  accent: '#fbbf24',
  border: '#1e3a2a',
  borderLight: '#2d4f3c',
  white: '#ffffff',
} as const;

/**
 * Wraps email body content in a professional, responsive HTML layout
 * with consistent branding for the congress portal.
 *
 * @param content - The inner HTML content of the email body
 * @param options - Layout configuration options
 * @returns Complete HTML document string for the email
 */
export function wrapInBaseLayout(
  content: string,
  options: BaseLayoutOptions = {}
): string {
  const {
    preheader = '',
    eventName = 'III Encuentro Científico',
    showFooter = true,
  } = options;

  return `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${eventName}</title>
  <!--[if mso]>
  <style>
    table, td, div, p, a, span { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.bgDark}; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}</div>` : ''}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.bgDark};">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Main container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="padding: 28px 32px 20px; background: linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.primaryBg} 100%); border-radius: 16px 16px 0 0; border-bottom: 1px solid ${COLORS.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Event badge -->
                    <div style="display: inline-block; background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 20px; padding: 4px 14px; margin-bottom: 12px;">
                      <span style="font-size: 10px; font-weight: 700; color: ${COLORS.accent}; text-transform: uppercase; letter-spacing: 1.5px;">
                        Escuela de Postgrado UNAP
                      </span>
                    </div>
                    <!-- Event name -->
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: ${COLORS.textPrimary}; letter-spacing: -0.3px; text-transform: uppercase; line-height: 1.3;">
                      ${eventName}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ BODY ═══ -->
          <tr>
            <td style="padding: 32px; background-color: ${COLORS.bgCard}; border-left: 1px solid ${COLORS.border}; border-right: 1px solid ${COLORS.border};">
              ${content}
            </td>
          </tr>

          ${showFooter ? `
          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="padding: 24px 32px; background-color: ${COLORS.bgCardAlt}; border-radius: 0 0 16px 16px; border-top: 1px solid ${COLORS.border}; border-left: 1px solid ${COLORS.border}; border-right: 1px solid ${COLORS.border}; border-bottom: 1px solid ${COLORS.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid ${COLORS.border};">
                    <p style="margin: 0; font-size: 11px; color: ${COLORS.textDim}; line-height: 1.5;">
                      Este correo fue enviado automáticamente por el sistema de registro del evento. 
                      Por favor no responda directamente a este mensaje.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <p style="margin: 0; font-size: 11px; color: ${COLORS.textDim}; line-height: 1.5;">
                      © ${new Date().getFullYear()} Universidad Nacional de la Amazonía Peruana.<br />
                      Escuela de Postgrado — Todos los derechos reservados.
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 10px; color: ${COLORS.textDim}; font-style: italic;">
                      Ciencia que transforma la Amazonía
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

        </table>
        <!-- End main container -->

      </td>
    </tr>
  </table>
  <!-- End outer wrapper -->
</body>
</html>
  `.trim();
}
