export interface ContactFormValues {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  message: string;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

export const PROJECT_TYPES = [
  'Brand Strategy',
  'Creative Direction',
  'Film & Production',
  'Brand Identity & Design',
  'Digital Experiences',
  'Multi-Disciplinary Partnership',
  'General Inquiry',
] as const;

export const BUDGET_RANGES = [
  'Prefer to discuss later',
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $35,000',
  '$35,000+',
] as const;

export const INITIAL_CONTACT_VALUES: ContactFormValues = {
  name: '',
  email: '',
  company: '',
  projectType: '',
  budget: '',
  message: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContactForm(values: ContactFormValues): {
  isValid: boolean;
  errors: ContactFormErrors;
} {
  const errors: ContactFormErrors = {};

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.projectType.trim()) {
    errors.projectType = 'Please select a project type or area of interest.';
  }

  if (!values.message.trim() || values.message.trim().length < 20) {
    errors.message =
      'Please share a brief overview of your project or idea (at least 20 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatInquiryText(values: ContactFormValues): string {
  const lines = [
    'ORPHEUS STUDIOS — PROJECT INQUIRY',
    `Name: ${values.name.trim()}`,
    `Email: ${values.email.trim()}`,
    `Company / Organisation: ${values.company.trim() || 'Not specified'}`,
    `Project Type: ${values.projectType.trim()}`,
    `Estimated Budget: ${values.budget.trim() || 'Not specified'}`,
    '',
    'Message:',
    values.message.trim(),
  ];
  return lines.join('\n');
}
