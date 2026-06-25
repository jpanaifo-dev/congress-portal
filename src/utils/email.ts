import { Resend } from 'resend';

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Sender info from environment variables
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@bequi.site';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'FONOTECA-IIAP';
const FROM_FIELD = `${FROM_NAME} <${FROM_EMAIL}>`;

// Default administrator notification recipient
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@iiap.gob.pe';

// Base application URL
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3006';
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4321';

export async function sendRequestConfirmationEmail({
  recipientEmail,
  requesterName,
  institution,
  rationale,
  items,
}: {
  recipientEmail: string;
  requesterName: string;
  institution: string;
  rationale: string;
  items: Array<{
    title: string;
    scientificName?: string;
    vernacularName?: string;
    genusName?: string;
    familyName?: string;
    duration?: number;
    format?: string;
    vocalizationType?: string;
    backgroundSpecies?: string;
    occurrenceId?: string;
  }>;
}) {
  if (!resend) {
    console.warn("Resend is not initialized (missing RESEND_API_KEY). Skipping emails.");
    return;
  }

  const itemsListHtml = items
    .map(
      (item) => `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; font-family: system-ui, -apple-system, sans-serif; font-size: 13px; text-align: left;">
          <div style="font-weight: bold; color: #0f172a; font-size: 14px; margin-bottom: 2px;">
            ${item.title || 'Grabación de audio'}
          </div>
          ${item.scientificName ? `
            <div style="margin: 2px 0; color: #10b981; font-weight: 600; font-style: italic; font-size: 13px;">
              ${item.scientificName} ${item.vernacularName ? `<span style="color: #64748b; font-style: normal; font-weight: normal;">(${item.vernacularName})</span>` : ''}
            </div>
          ` : ''}
          
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0; color: #475569; font-size: 11px; line-height: 1.5;">
            ${item.genusName || item.familyName ? `<div><strong>Taxonomía:</strong> Género: ${item.genusName || 'N/A'} | Familia: ${item.familyName || 'N/A'}</div>` : ''}
            ${item.vocalizationType ? `<div><strong>Vocalización:</strong> ${item.vocalizationType}</div>` : ''}
            ${item.backgroundSpecies ? `<div><strong>Especies de fondo:</strong> ${item.backgroundSpecies}</div>` : ''}
            <div>
              <strong>Detalles del archivo:</strong> 
              ${item.format ? `<span style="text-transform: uppercase;">${item.format}</span>` : ''} 
              ${item.duration ? ` | Duración: ${item.duration.toFixed(1)}s` : ''}
            </div>
          </div>

          ${item.occurrenceId ? `
            <div style="margin-top: 10px; font-size: 11px;">
              <a href="${PORTAL_URL}/es/species/${item.occurrenceId}" target="_blank" style="color: #0284c7; text-decoration: none; font-weight: bold; display: inline-block;">
                Ver registro en el Portal &rarr;
              </a>
            </div>
          ` : ''}
        </div>
      `
    )
    .join('');

  // 1. Send confirmation to user
  try {
    await resend.emails.send({
      from: FROM_FIELD,
      to: recipientEmail,
      subject: 'Solicitud de Audios Científicos Registrada - Fonoteca IIAP',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0284c7; font-size: 20px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">Solicitud Registrada</h2>
          <p>Estimado(a) <strong>${requesterName}</strong>,</p>
          <p>Hemos registrado correctamente tu solicitud de descarga de material acústico de la Fonoteca del Instituto de Investigaciones de la Amazonía Peruana (IIAP).</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; font-weight: 700;">Detalles de la Solicitud:</h4>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Institución:</strong> ${institution || 'N/A'}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Propósito Científico:</strong> <em>"${rationale}"</em></p>
          </div>

          <h4 style="color: #0f172a; font-size: 14px; font-weight: 700; margin-top: 24px;">Grabaciones Bioacústicas Solicitadas:</h4>
          <div style="margin-top: 12px;">
            ${itemsListHtml}
          </div>

          <p style="margin-top: 24px; font-size: 13px;">Nuestra curaduría evaluará tu rationale científico a la brevedad. Una vez aprobada la solicitud, recibirás un correo con un enlace temporal para descargar los archivos correspondientes.</p>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">Plataforma Fonoteca - Instituto de Investigaciones de la Amazonía Peruana (IIAP)</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send confirmation email to requester:', error);
  }

  // 2. Send notification to admin
  try {
    await resend.emails.send({
      from: FROM_FIELD,
      to: ADMIN_EMAIL,
      subject: `[ADMIN] Nueva Solicitud de Audios Científicos - ${requesterName}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">Nueva Solicitud Pendiente</h2>
          <p>Se ha recibido una nueva solicitud de descarga de audios científicos que requiere evaluación curatorial en el panel de administración.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Investigador:</strong> ${requesterName} (${recipientEmail})</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Institución:</strong> ${institution || 'N/A'}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Rationale:</strong> "${rationale}"</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Total de Audios:</strong> ${items.length}</p>
          </div>

          <p style="margin-top: 28px;">
            <a href="${APP_URL}/dashboard/audio-requests" 
               style="background-color: #0284c7; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
              Evaluar Solicitud en la Consola
            </a>
          </p>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">Consola de Administración - Fonoteca IIAP</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
}

export async function sendRequestResolutionEmail({
  recipientEmail,
  requesterName,
  status,
  requestId,
  expiresAt,
  items,
}: {
  recipientEmail: string;
  requesterName: string;
  status: 'approved' | 'rejected';
  requestId: string;
  expiresAt?: string | null;
  items?: Array<{
    title: string;
    scientificName?: string;
    vernacularName?: string;
    genusName?: string;
    familyName?: string;
    duration?: number;
    format?: string;
    vocalizationType?: string;
    backgroundSpecies?: string;
    occurrenceId?: string;
    downloadUrl?: string;
  }>;
}) {
  if (!resend) {
    console.warn("Resend is not initialized. Skipping resolution email.");
    return;
  }

  const isApproved = status === 'approved';
  const subject = isApproved
    ? 'Solicitud de Audios Científicos Aprobada - Fonoteca IIAP'
    : 'Solicitud de Audios Científicos Evaluada - Fonoteca IIAP';

  const downloadLink = `${APP_URL}/download/${requestId}`;
  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const itemsListHtml = isApproved && items
    ? items
        .map(
          (item) => `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; font-family: system-ui, -apple-system, sans-serif; font-size: 13px; text-align: left;">
          <div style="font-weight: bold; color: #0f172a; font-size: 14px; margin-bottom: 2px;">
            ${item.title || 'Grabación de audio'}
          </div>
          ${item.scientificName ? `
            <div style="margin: 2px 0; color: #10b981; font-weight: 600; font-style: italic; font-size: 13px;">
              ${item.scientificName} ${item.vernacularName ? `<span style="color: #64748b; font-style: normal; font-weight: normal;">(${item.vernacularName})</span>` : ''}
            </div>
          ` : ''}
          
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0; color: #475569; font-size: 11px; line-height: 1.5;">
            ${item.genusName || item.familyName ? `<div><strong>Taxonomía:</strong> Género: ${item.genusName || 'N/A'} | Familia: ${item.familyName || 'N/A'}</div>` : ''}
            ${item.vocalizationType ? `<div><strong>Vocalización:</strong> ${item.vocalizationType}</div>` : ''}
            ${item.backgroundSpecies ? `<div><strong>Especies de fondo:</strong> ${item.backgroundSpecies}</div>` : ''}
            <div>
              <strong>Detalles del archivo:</strong> 
              ${item.format ? `<span style="text-transform: uppercase;">${item.format}</span>` : ''} 
              ${item.duration ? ` | Duración: ${item.duration.toFixed(1)}s` : ''}
            </div>
          </div>

          <div style="margin-top: 10px; font-size: 11px;">
            ${item.downloadUrl ? `
              <a href="${item.downloadUrl}" target="_blank" style="background-color: #10b981; color: #ffffff; padding: 6px 14px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-right: 8px;">
                Descargar Audio
              </a>
            ` : ''}
            ${item.occurrenceId ? `
              <a href="${PORTAL_URL}/es/species/${item.occurrenceId}" target="_blank" style="color: #0284c7; text-decoration: none; font-weight: bold; display: inline-block; padding: 6px 0;">
                Ver en el Portal &rarr;
              </a>
            ` : ''}
          </div>
        </div>
      `
        )
        .join('')
    : '';

  const htmlContent = isApproved
    ? `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #10b981; font-size: 20px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">¡Solicitud Aprobada!</h2>
        <p>Estimado(a) <strong>${requesterName}</strong>,</p>
        <p>Nos complace informarte que la curaduría científica de la Fonoteca IIAP ha evaluado y aprobado tu solicitud de descarga acústica.</p>
        
        <p style="margin: 24px 0; text-align: left;">
          <a href="${downloadLink}" 
             style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            Acceder al Portal de Descarga
          </a>
        </p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 13px; color: #15803d; font-weight: bold;">
            Importante: Vencimiento del Acceso
          </p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #166534; line-height: 1.4;">
            Este enlace de descarga es efímero y estará activo únicamente por 48 horas. Vence de forma improrrogable el: <strong>${formattedExpiry}</strong>. Después de esta hora el acceso será cerrado.
          </p>
        </div>

        <h4 style="color: #0f172a; font-size: 14px; font-weight: 700; margin-top: 28px;">Audios Autorizados para Descarga:</h4>
        <div style="margin-top: 12px;">
          ${itemsListHtml}
        </div>

        <p style="font-size: 13px; margin-top: 28px;">Te recordamos que al descargar este material científico te has comprometido a citar la base de datos de la Fonoteca bajo el estándar Darwin Core y a no comercializar ni redistribuir el material acústico.</p>
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">Plataforma Fonoteca - Instituto de Investigaciones de la Amazonía Peruana (IIAP)</p>
      </div>
    `
    : `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #ef4444; font-size: 20px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">Solicitud Rechazada</h2>
        <p>Estimado(a) <strong>${requesterName}</strong>,</p>
        <p>Lamentamos informarte que la curaduría científica de la Fonoteca IIAP ha evaluado tu solicitud de descarga de material acústico y en esta oportunidad no ha sido aprobada.</p>
        
        <p style="font-size: 13px;">Si consideras que ha habido un error o deseas ampliar el rationale científico del proyecto, te invitamos a registrar una nueva solicitud en el portal.</p>
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">Plataforma Fonoteca - Instituto de Investigaciones de la Amazonía Peruana (IIAP)</p>
      </div>
    `;

  try {
    await resend.emails.send({
      from: FROM_FIELD,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send resolution email:', error);
  }
}
