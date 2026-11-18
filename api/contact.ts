import { Resend } from 'resend';

/**
 * Vercel Serverless Function for Orpheus Studios contact delivery via Resend.
 * Configure RESEND_API_KEY in Vercel Environment Variables.
 * Optional overrides: CONTACT_RECIPIENT_EMAIL, RESEND_FROM_EMAIL.
 */

interface RequestLike {
  method?: string;
  body?: unknown;
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (data: unknown) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const recipientEmail =
    process.env.CONTACT_RECIPIENT_EMAIL?.trim() || 'zaheerhasiphone@gmail.com';
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || 'Orpheus Studios <onboarding@resend.dev>';

  if (!resendApiKey) {
    return res.status(503).json({
      code: 'RESEND_UNCONFIGURED',
      error:
        'Resend is not connected yet because RESEND_API_KEY is missing on the server. Add RESEND_API_KEY in Vercel Environment Variables, or copy/email your brief below.',
    });
  }

  let body: Record<string, unknown> = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }
  } else if (req.body && typeof req.body === 'object') {
    body = req.body as Record<string, unknown>;
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const projectType = typeof body.projectType === 'string' ? body.projectType.trim() : '';
  const budget = typeof body.budget === 'string' ? body.budget.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (name.length < 2 || !EMAIL_PATTERN.test(email) || !projectType || message.length < 20) {
    return res.status(400).json({ error: 'Missing or invalid required inquiry fields.' });
  }

  const text = [
    'ORPHEUS STUDIOS — NEW PROJECT INQUIRY',
    `Name: ${name}`,
    `Email: ${email}`,
    `Company / Organisation: ${company || 'Not specified'}`,
    `Project Type: ${projectType}`,
    `Estimated Budget: ${budget || 'Not specified'}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <div style="font-family: Georgia, serif; background:#F3EFE6; color:#171717; padding:32px; max-width:620px;">
      <p style="font-family: Inter, sans-serif; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:#C23A32; margin:0 0 12px;">
        Orpheus Studios · New Brief
      </p>
      <h1 style="font-size:26px; font-weight:500; margin:0 0 24px; border-bottom:1px solid rgba(23,23,23,0.18); padding-bottom:16px;">
        ${escapeHtml(projectType)} — ${escapeHtml(name)}
      </h1>
      <table style="width:100%; border-collapse:collapse; font-family:Inter, sans-serif; font-size:14px; margin-bottom:24px;">
        <tr><td style="padding:8px 0; color:#555; width:140px;">Name</td><td style="padding:8px 0;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px 0; color:#555;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#171717;">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:8px 0; color:#555;">Organisation</td><td style="padding:8px 0;">${escapeHtml(company || 'Not specified')}</td></tr>
        <tr><td style="padding:8px 0; color:#555;">Budget</td><td style="padding:8px 0;">${escapeHtml(budget || 'Not specified')}</td></tr>
      </table>
      <p style="font-family:Inter, sans-serif; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#555; margin:0 0 8px;">Message</p>
      <p style="font-family:Inter, sans-serif; font-size:15px; line-height:1.65; white-space:pre-wrap; margin:0;">${escapeHtml(message)}</p>
    </div>
  `.trim();

  try {
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      replyTo: email,
      subject: `New Inquiry: ${projectType} — ${name}`,
      text,
      html,
    });

    if (error) {
      return res.status(502).json({ error: error.message || 'Failed to forward inquiry via Resend.' });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch {
    return res.status(502).json({ error: 'Unable to reach Resend API right now.' });
  }
}
