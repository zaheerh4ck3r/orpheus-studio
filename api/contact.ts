/**
 * Vercel Serverless Function template for Resend contact delivery.
 * Activate by setting RESEND_API_KEY, CONTACT_RECIPIENT_EMAIL,
 * and VITE_CONTACT_ENDPOINT="/api/contact" in Vercel Environment Variables.
 */

interface RequestLike {
  method?: string;
  body?: unknown;
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (data: unknown) => void;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL;

  if (!resendApiKey || !recipientEmail) {
    return res.status(503).json({
      error:
        'Email delivery is not yet configured on the server. Set RESEND_API_KEY and CONTACT_RECIPIENT_EMAIL.',
    });
  }

  const body = (req.body ?? {}) as Record<string, string>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const projectType = typeof body.projectType === 'string' ? body.projectType.trim() : '';
  const budget = typeof body.budget === 'string' ? body.budget.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !projectType || message.length < 20) {
    return res.status(400).json({ error: 'Missing or invalid required inquiry fields.' });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Orpheus Studios Website <onboarding@resend.dev>',
      to: [recipientEmail],
      reply_to: email,
      subject: `New Inquiry: ${projectType} — ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || 'Not specified'}`,
        `Project Type: ${projectType}`,
        `Estimated Budget: ${budget || 'Not specified'}`,
        '',
        message,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    return res.status(502).json({ error: 'Failed to forward inquiry via Resend.' });
  }

  return res.status(200).json({ ok: true });
}
