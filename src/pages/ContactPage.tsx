import React, { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { STUDIO_CONFIG } from '../data/studioData';
import {
  BUDGET_RANGES,
  ContactFormErrors,
  ContactFormValues,
  INITIAL_CONTACT_VALUES,
  PROJECT_TYPES,
  formatInquiryText,
  validateContactForm,
} from '../lib/contactValidation';
import { ContactSubmissionResult, submitContactInquiry } from '../lib/contactSubmission';
import { Reveal } from '../components/Reveal';

interface ContactPageProps {
  initialService?: string;
}

export function ContactPage({ initialService = '' }: ContactPageProps) {
  const matchedService = PROJECT_TYPES.includes(
    initialService as (typeof PROJECT_TYPES)[number]
  )
    ? initialService
    : '';

  const [values, setValues] = useState<ContactFormValues>({
    ...INITIAL_CONTACT_VALUES,
    projectType: matchedService,
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ContactSubmissionResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (matchedService) {
      setValues((prev) => ({ ...prev, projectType: matchedService }));
    }
  }, [matchedService]);

  const handleFieldChange = (field: keyof ContactFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submissionResult) {
      setSubmissionResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateContactForm(values);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmissionResult(null);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const result = await submitContactInquiry(values, {
      endpoint: STUDIO_CONFIG.contactEndpoint,
    });

    setIsSubmitting(false);
    setSubmissionResult(result);

    if (result.status === 'sent') {
      setValues(INITIAL_CONTACT_VALUES);
    }
  };

  const handleCopySummary = async () => {
    const summary = formatInquiryText(values);
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="bg-parchment text-obsidian">
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20 pb-20 sm:pb-28">
        <Reveal>
          <div className="pb-12 border-b border-obsidian/15">
            <p className="font-sans text-xs uppercase tracking-[0.24em] text-obsidian/70 mb-5">
              Contact &amp; Commissions
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4.25rem] leading-[1.02] tracking-[-0.015em] uppercase text-obsidian max-w-4xl">
              Some Things{' '}
              <br />
              Begin With A Conversation.
            </h1>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16">
          {/* Left Column — Direct Studio Channels */}
          <Reveal className="lg:col-span-5 space-y-10">
            <p className="font-sans text-base sm:text-lg leading-relaxed text-obsidian/80 max-w-md">
              Share what you are building, questioning or hoping to film. Write directly or send a
              brief here—we reply personally within two business days.
            </p>

            <dl className="divide-y divide-obsidian/15 border-t border-b border-obsidian/15">
              <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="font-sans text-[11px] uppercase tracking-[0.2em] text-obsidian/55">
                  Location
                </dt>
                <dd className="sm:col-span-2 font-sans text-sm text-obsidian">
                  {STUDIO_CONFIG.location}
                  <span className="block text-obsidian/65 mt-0.5">
                    {STUDIO_CONFIG.availability}
                  </span>
                </dd>
              </div>

              <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="font-sans text-[11px] uppercase tracking-[0.2em] text-obsidian/55">
                  Email
                </dt>
                <dd className="sm:col-span-2 font-sans text-sm text-obsidian">
                  <a
                    href={`mailto:${STUDIO_CONFIG.email}`}
                    className="editorial-link text-obsidian hover:text-vermilion transition-colors"
                  >
                    {STUDIO_CONFIG.email}
                  </a>
                </dd>
              </div>

              <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="font-sans text-[11px] uppercase tracking-[0.2em] text-obsidian/55">
                  Instagram
                </dt>
                <dd className="sm:col-span-2 font-sans text-sm text-obsidian">
                  <a
                    href={STUDIO_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editorial-link text-obsidian hover:text-vermilion transition-colors"
                  >
                    <span>{STUDIO_CONFIG.instagram}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>

          {/* Right Column — Project Brief Form */}
          <Reveal delay={0.08} className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              aria-label="Project inquiry form"
              className="space-y-7 bg-parchment border border-obsidian/15 p-6 sm:p-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block font-sans text-xs uppercase tracking-[0.18em] text-obsidian/80 mb-2"
                  >
                    Name <span className="text-vermilion">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={values.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    placeholder="Your full name"
                    className="w-full bg-transparent border-b border-obsidian/30 focus:border-obsidian py-2.5 text-sm font-sans text-obsidian placeholder:text-obsidian/35 focus:outline-none transition-colors"
                  />
                  {errors.name ? (
                    <p
                      id="contact-name-error"
                      role="alert"
                      className="mt-2 text-xs font-sans text-vermilion"
                    >
                      Error: {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block font-sans text-xs uppercase tracking-[0.18em] text-obsidian/80 mb-2"
                  >
                    Email <span className="text-vermilion">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={values.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    placeholder="you@organisation.com"
                    className="w-full bg-transparent border-b border-obsidian/30 focus:border-obsidian py-2.5 text-sm font-sans text-obsidian placeholder:text-obsidian/35 focus:outline-none transition-colors"
                  />
                  {errors.email ? (
                    <p
                      id="contact-email-error"
                      role="alert"
                      className="mt-2 text-xs font-sans text-vermilion"
                    >
                      Error: {errors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-company"
                  className="block font-sans text-xs uppercase tracking-[0.18em] text-obsidian/80 mb-2"
                >
                  Company / Organisation
                </label>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={values.company}
                  onChange={(e) => handleFieldChange('company', e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-transparent border-b border-obsidian/30 focus:border-obsidian py-2.5 text-sm font-sans text-obsidian placeholder:text-obsidian/35 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contact-project-type"
                    className="block font-sans text-xs uppercase tracking-[0.18em] text-obsidian/80 mb-2"
                  >
                    Project Type <span className="text-vermilion">*</span>
                  </label>
                  <select
                    id="contact-project-type"
                    name="projectType"
                    required
                    value={values.projectType}
                    onChange={(e) => handleFieldChange('projectType', e.target.value)}
                    aria-invalid={Boolean(errors.projectType)}
                    aria-describedby={errors.projectType ? 'contact-project-type-error' : undefined}
                    className="w-full bg-parchment border-b border-obsidian/30 focus:border-obsidian py-2.5 text-sm font-sans text-obsidian focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Select a discipline...</option>
                    {PROJECT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.projectType ? (
                    <p
                      id="contact-project-type-error"
                      role="alert"
                      className="mt-2 text-xs font-sans text-vermilion"
                    >
                      Error: {errors.projectType}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="contact-budget"
                    className="block font-sans text-xs uppercase tracking-[0.18em] text-obsidian/80 mb-2"
                  >
                    Estimated Budget (Optional)
                  </label>
                  <select
                    id="contact-budget"
                    name="budget"
                    value={values.budget}
                    onChange={(e) => handleFieldChange('budget', e.target.value)}
                    className="w-full bg-parchment border-b border-obsidian/30 focus:border-obsidian py-2.5 text-sm font-sans text-obsidian focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Select a range (optional)...</option>
                    {BUDGET_RANGES.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-sans text-xs uppercase tracking-[0.18em] text-obsidian/80 mb-2"
                >
                  Message <span className="text-vermilion">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  value={values.message}
                  onChange={(e) => handleFieldChange('message', e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  placeholder="Share your context, goals, timeline or the idea you would like to explore..."
                  className="w-full bg-transparent border border-obsidian/25 focus:border-obsidian p-3.5 text-sm font-sans text-obsidian placeholder:text-obsidian/35 focus:outline-none transition-colors resize-y"
                />
                {errors.message ? (
                  <p
                    id="contact-message-error"
                    role="alert"
                    className="mt-2 text-xs font-sans text-vermilion"
                  >
                    Error: {errors.message}
                  </p>
                ) : null}
              </div>

              {submissionResult ? (
                <div
                  role="status"
                  aria-live="polite"
                  className={`p-5 border text-sm font-sans space-y-4 ${
                    submissionResult.status === 'sent'
                      ? 'border-cobalt/40 bg-cobalt/[0.06] text-obsidian'
                      : 'border-vermilion/40 bg-vermilion/[0.06] text-obsidian'
                  }`}
                >
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-[0.18em] font-medium text-vermilion">
                      {submissionResult.status === 'sent'
                        ? 'Confirmed — Inquiry Sent'
                        : submissionResult.status === 'unconfigured'
                          ? 'Ready to Send — Copy Brief or Email Directly'
                          : 'Error — Submission Failed'}
                    </p>
                    <p className="leading-relaxed text-obsidian/85">{submissionResult.message}</p>
                  </div>

                  {submissionResult.status !== 'sent' ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.16em] font-medium border border-obsidian text-obsidian hover:bg-obsidian hover:text-parchment transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Brief Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Copy Brief</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`mailto:${STUDIO_CONFIG.email}?subject=${encodeURIComponent(
                          `Project Inquiry — ${values.projectType || 'Orpheus Studios'}`
                        )}&body=${encodeURIComponent(formatInquiryText(values))}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.16em] font-medium bg-obsidian text-parchment hover:bg-vermilion transition-colors"
                      >
                        <span>Open in Email App</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="font-sans text-xs text-obsidian/55">
                  Personal reply within two business days.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2.5 bg-obsidian text-parchment px-7 py-3.5 text-xs font-sans font-medium uppercase tracking-[0.18em] whitespace-nowrap shrink-0 hover:bg-vermilion transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
