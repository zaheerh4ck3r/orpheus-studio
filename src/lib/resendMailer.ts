import { Resend } from 'resend';

export interface ResendInquiryPayload {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget?: string;
  message: string;
}

export interface ResendEmailParams {
  from: string;
  to: string | string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}

export type ResendSendEmailFn = (
  params: ResendEmailParams
) => Promise<{ data: { id: string } | null; error: { message?: string } | null }>;

export interface ResendSendConfig {
  apiKey?: string;
  recipientEmail?: string;
  fromEmail?: string;
  sendEmailImpl?: ResendSendEmailFn;
}

export type ResendSendResult =
  | { ok: true; status: 200; id?: string }
  | { ok: false; status: 400 | 502 | 503; code: string; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendInquiryViaResend(
  rawBody: unknown,
  config: ResendSendConfig
): Promise<ResendSendResult> {
  const apiKey = config.apiKey?.trim() ?? '';
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      code: 'RESEND_UNCONFIGURED',
      error:
        'Resend is not connected yet because RESEND_API_KEY is missing on the server. Add RESEND_API_KEY in your environment variables, or copy/email your brief below.',
    };
  }

  let parsedBody: Record<string, unknown> = {};
  if (typeof rawBody === 'string') {
    try {
      parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return {
        ok: false,
        status: 400,
        code: 'INVALID_JSON',
        error: 'Invalid JSON request payload.',
      };
    }
  } else if (rawBody && typeof rawBody === 'object') {
    parsedBody = rawBody as Record<string, unknown>;
  }

  const name = typeof parsedBody.name === 'string' ? parsedBody.name.trim() : '';
  const email = typeof parsedBody.email === 'string' ? parsedBody.email.trim() : '';
  const company = typeof parsedBody.company === 'string' ? parsedBody.company.trim() : '';
  const projectType =
    typeof parsedBody.projectType === 'string' ? parsedBody.projectType.trim() : '';
  const budget = typeof parsedBody.budget === 'string' ? parsedBody.budget.trim() : '';
  const message = typeof parsedBody.message === 'string' ? parsedBody.message.trim() : '';

  if (name.length < 2 || !EMAIL_PATTERN.test(email) || !projectType || message.length < 20) {
    return {
      ok: false,
      status: 400,
      code: 'VALIDATION_ERROR',
      error:
        'Please provide your name, a valid email, a project type, and a brief message (min 20 characters).',
    };
  }

  const recipientEmail = config.recipientEmail?.trim() || 'zaheerhasiphone@gmail.com';
  const fromEmail = config.fromEmail?.trim() || 'Orpheus Studios <onboarding@resend.dev>';

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

  const sendFn: ResendSendEmailFn =
    config.sendEmailImpl ??
    ((params) => {
      const resend = new Resend(apiKey);
      return resend.emails.send(params);
    });

  try {
    const { data, error } = await sendFn({
      from: fromEmail,
      to: recipientEmail,
      replyTo: email,
      subject: `New Inquiry: ${projectType} — ${name}`,
      text,
      html,
    });

    if (error) {
      return {
        ok: false,
        status: 502,
        code: 'RESEND_UPSTREAM_ERROR',
        error: error.message || 'Resend rejected the email request.',
      };
    }

    return { ok: true, status: 200, id: data?.id };
  } catch {
    return {
      ok: false,
      status: 502,
      code: 'RESEND_NETWORK_ERROR',
      error: 'Unable to reach Resend API right now. Please try again or copy your brief.',
    };
  }
}
