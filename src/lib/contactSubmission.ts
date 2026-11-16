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
 * Submits a validated contact inquiry only when a real backend endpoint is configured.
 * Refuses to simulate success when no email transport or Resend endpoint exists.
 */
export async function submitContactInquiry(
  values: ContactFormValues,
  options: SubmitContactOptions = {}
): Promise<ContactSubmissionResult> {
  const endpoint = options.endpoint?.trim() ?? '';

  if (!endpoint) {
    return {
      status: 'unconfigured',
      message:
        'No email delivery service (such as Resend) is connected to this environment yet. Your inquiry has been validated and prepared below so you can copy it directly.',
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
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload?.error) detail = payload.error;
      } catch {
        // Ignore JSON parse failures on non-JSON error responses.
      }
      return {
        status: 'error',
        message: detail,
      };
    }

    return {
      status: 'sent',
      message:
        'Thank you. Your note has been delivered to Orpheus Studios. We respond to thoughtful inquiries within two business days.',
    };
  } catch {
    return {
      status: 'error',
      message:
        'A network error prevented delivery. Please check your connection or copy your inquiry summary below.',
    };
  }
}
