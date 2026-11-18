import { ContactFormValues } from './contactValidation';

export type ContactSubmissionResult =
  | {
      status: 'sent';
      message: string;
    }
  | {
      status: 'unconfigured';
      message: string;
    }
  | {
      status: 'error';
      message: string;
    };

export interface SubmitContactOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Submits a validated contact inquiry to the server /api/contact Resend proxy.
 * Refuses to simulate success when RESEND_API_KEY is not configured on the server.
 */
export async function submitContactInquiry(
  values: ContactFormValues,
  options: SubmitContactOptions = {}
): Promise<ContactSubmissionResult> {
  const endpoint = options.endpoint !== undefined ? options.endpoint.trim() : '/api/contact';

  if (!endpoint) {
    return {
      status: 'unconfigured',
      message:
        'Resend is not connected yet because RESEND_API_KEY is missing on the server. Copy your brief below or open it directly in your email app.',
    };
  }

  const fetchFn = options.fetchImpl ?? fetch;

  try {
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        projectType: values.projectType.trim(),
        budget: values.budget.trim(),
        message: values.message.trim(),
      }),
    });

    if (!response.ok) {
      let detail = 'Unable to send your message right now.';
      let code = '';
      try {
        const payload = (await response.json()) as { error?: string; code?: string };
        if (payload?.error) detail = payload.error;
        if (payload?.code) code = payload.code;
      } catch {
        // Ignore JSON parse failures on non-JSON error responses.
      }

      if (response.status === 503 || code === 'RESEND_UNCONFIGURED') {
        return {
          status: 'unconfigured',
          message: detail,
        };
      }

      return {
        status: 'error',
        message: detail,
      };
    }

    return {
      status: 'sent',
      message:
        'Thank you. Your brief has been sent directly to Orpheus Studios (orpheusstidos@gmail.com). We respond personally within two business days.',
    };
  } catch {
    return {
      status: 'error',
      message:
        'A network error prevented delivery. Please check your connection or copy your brief below.',
    };
  }
}
