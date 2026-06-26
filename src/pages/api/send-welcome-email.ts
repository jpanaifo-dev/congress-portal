// ============================================
// API: Send Welcome Email (Server-Side Only)
// POST /api/send-welcome-email
// ============================================
import type { APIRoute } from 'astro';
import { sendWelcomeEmail } from '../../utils/email';
import type { WelcomeEmailData } from '../../utils/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as WelcomeEmailData;

    // Validate required fields
    if (!body.participantEmail || !body.participantName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Faltan campos requeridos: participantEmail, participantName' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await sendWelcomeEmail(body);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    console.error('[API /send-welcome-email] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
