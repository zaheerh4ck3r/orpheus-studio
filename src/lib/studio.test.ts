import test from 'node:test';
import assert from 'node:assert/strict';
import { extractQueryParam, matchRoute, normalizePath } from './router';
import {
  formatInquiryText,
  INITIAL_CONTACT_VALUES,
  validateContactForm,
} from './contactValidation';
import { submitContactInquiry } from './contactSubmission';
import { sendInquiryViaResend } from './resendMailer';
import { STUDIO_CONFIG, STUDIO_IMAGES, STUDIO_SERVICES } from '../data/studioData';

test('normalizePath strips trailing slashes, queries, and hashes', () => {
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath('/about/'), '/about');
  assert.equal(normalizePath('/services?ref=hero#film'), '/services');
  assert.equal(normalizePath(''), '/');
});

test('extractQueryParam retrieves preselected service cleanly', () => {
  assert.equal(extractQueryParam('/contact?service=Film+%26+Production', 'service'), 'Film & Production');
  assert.equal(extractQueryParam('?service=Brand+Strategy', 'service'), 'Brand Strategy');
  assert.equal(extractQueryParam('/contact', 'service'), '');
});

test('matchRoute resolves Home, Services, About, Studio 3D, and Contact and defaults unknown paths to home', () => {
  assert.equal(matchRoute('/').id, 'home');
  assert.equal(matchRoute('/services/').id, 'services');
  assert.equal(matchRoute('/about').id, 'about');
  assert.equal(matchRoute('/studio').id, 'studio');
  assert.equal(matchRoute('/contact').id, 'contact');
  assert.equal(matchRoute('/journal').id, 'home');
  assert.equal(matchRoute('/non-existent').id, 'home');
});

test('validateContactForm rejects empty or invalid submissions', () => {
  const emptyResult = validateContactForm(INITIAL_CONTACT_VALUES);
  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.name);
  assert.ok(emptyResult.errors.email);
  assert.ok(emptyResult.errors.projectType);
  assert.ok(emptyResult.errors.message);

  const badEmailResult = validateContactForm({
    name: 'Amina Tariq',
    email: 'not-an-email',
    company: '',
    projectType: 'Film & Production',
    budget: '',
    message: 'We are preparing a short documentary on architectural heritage.',
  });
  assert.equal(badEmailResult.isValid, false);
  assert.ok(badEmailResult.errors.email);
  assert.equal(badEmailResult.errors.name, undefined);
});

test('validateContactForm accepts complete inquiries and formats summary cleanly', () => {
  const validValues = {
    name: 'Amina Tariq',
    email: 'amina@example.org',
    company: 'Lahore Monograph Press',
    projectType: 'Brand Identity & Design',
    budget: '$5,000 – $15,000',
    message:
      'We are commissioning a visual identity and editorial publication for an autumn exhibition.',
  };

  const result = validateContactForm(validValues);
  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});

  const summary = formatInquiryText(validValues);
  assert.match(summary, /Amina Tariq/);
  assert.match(summary, /Brand Identity & Design/);
  assert.match(summary, /Lahore Monograph Press/);
});

test('submitContactInquiry refuses to fake success when endpoint is unconfigured or server returns 503', async () => {
  const emptyResult = await submitContactInquiry(
    {
      name: 'Zayd Khan',
      email: 'zayd@example.org',
      company: '',
      projectType: 'Creative Direction',
      budget: '',
      message: 'Looking to collaborate on a brand film later this quarter.',
    },
    { endpoint: '' }
  );
  assert.equal(emptyResult.status, 'unconfigured');

  const unconfiguredFetch = (async () =>
    new Response(
      JSON.stringify({ code: 'RESEND_UNCONFIGURED', error: 'RESEND_API_KEY missing.' }),
      { status: 503 }
    )) as unknown as typeof fetch;

  const server503Result = await submitContactInquiry(
    {
      name: 'Zayd Khan',
      email: 'zayd@example.org',
      company: '',
      projectType: 'Creative Direction',
      budget: '',
      message: 'Looking to collaborate on a brand film later this quarter.',
    },
    { endpoint: '/api/contact', fetchImpl: unconfiguredFetch }
  );
  assert.equal(server503Result.status, 'unconfigured');
});

test('submitContactInquiry sends POST request when endpoint is configured', async () => {
  let calledUrl = '';
  const fakeFetch = (async (url: string) => {
    calledUrl = url;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as unknown as typeof fetch;

  const result = await submitContactInquiry(
    {
      name: 'Zayd Khan',
      email: 'zayd@example.org',
      company: 'Studio North',
      projectType: 'Creative Direction',
      budget: '',
      message: 'Looking to collaborate on a brand film later this quarter.',
    },
    { endpoint: '/api/contact', fetchImpl: fakeFetch }
  );

  assert.equal(calledUrl, '/api/contact');
  assert.equal(result.status, 'sent');
});

test('sendInquiryViaResend validates key and sends email via Resend SDK to zaheerhasiphone@gmail.com', async () => {
  const missingKeyResult = await sendInquiryViaResend(
    {
      name: 'Zayd Khan',
      email: 'zayd@example.org',
      projectType: 'Film & Production',
      message: 'We are looking to produce a short documentary this winter.',
    },
    { apiKey: '' }
  );
  assert.equal(missingKeyResult.ok, false);
  assert.equal(missingKeyResult.status, 503);

  let sentParams: Record<string, unknown> = {};
  const okResult = await sendInquiryViaResend(
    {
      name: 'Zayd Khan',
      email: 'zayd@example.org',
      company: 'Studio North',
      projectType: 'Film & Production',
      budget: '$5,000 – $15,000',
      message: 'We are looking to produce a short documentary this winter.',
    },
    {
      apiKey: 're_test_key',
      sendEmailImpl: async (params) => {
        sentParams = params as unknown as Record<string, unknown>;
        return { data: { id: 're_test_123' }, error: null };
      },
    }
  );

  assert.equal(okResult.ok, true);
  assert.equal(sentParams.from, 'Orpheus Studios <onboarding@resend.dev>');
  assert.equal(sentParams.to, 'zaheerhasiphone@gmail.com');
  assert.equal(sentParams.replyTo, 'zayd@example.org');
});

test('studio catalog enforces real details, 5 services, and user logo assets with zero placeholder images', () => {
  assert.equal(STUDIO_SERVICES.length, 5);
  assert.equal(STUDIO_CONFIG.email, 'orpheusstidos@gmail.com');
  assert.equal(STUDIO_CONFIG.instagram, '@orpheusstudioss');
  assert.equal(STUDIO_CONFIG.instagramUrl, 'https://www.instagram.com/orpheusstudioss');
  assert.equal(STUDIO_CONFIG.location, 'NSTP, NUST, Islamabad, Pakistan');
  assert.equal(STUDIO_CONFIG.contactEndpoint, '/api/contact');
  assert.deepEqual(Object.keys(STUDIO_IMAGES), ['brandCrestImage', 'brandCrestSvg']);
  assert.equal(
    STUDIO_IMAGES.brandCrestImage,
    '/assets/aistudio/Gemini_Generated_Image_mbt0ngmbt0ngmbt0_c96ad1d9.jpeg'
  );
  assert.equal(STUDIO_IMAGES.brandCrestSvg, '/assets/aistudio/file_5d76b934.svg');
});

test('computeStaggerDelay produces monotonic editorial stagger cadence', async () => {
  const { computeStaggerDelay } = await import('../hooks/useStaggeredEntrance');
  assert.equal(computeStaggerDelay(0, 0.04, 0.085), 0.04);
  assert.equal(computeStaggerDelay(1, 0.04, 0.085), 0.125);
  assert.equal(computeStaggerDelay(2, 0.04, 0.085), 0.21);
  assert.equal(computeStaggerDelay(-3, 0.04, 0.085), 0.04);
});

test('theme helpers default to parchment and toggle cleanly between parchment and obsidian', async () => {
  const { parseStoredTheme, getNextTheme } = await import('./theme');
  assert.equal(parseStoredTheme(null), 'parchment');
  assert.equal(parseStoredTheme('unknown'), 'parchment');
  assert.equal(parseStoredTheme('obsidian'), 'obsidian');
  assert.equal(getNextTheme('parchment'), 'obsidian');
  assert.equal(getNextTheme('obsidian'), 'parchment');
});

test('sendConciergeMessage validates inputs, whitelists models, and preserves multi-turn history', async () => {
  const { resolveChatModel, sanitizeChatHistory, sendConciergeMessage } = await import(
    './studioChatService'
  );

  assert.equal(resolveChatModel('gemini-1.5-flash'), 'gemini-4-hydrogen');
  assert.equal(resolveChatModel('gemini-3.1-flash-lite'), 'gemini-3.1-flash-lite');

  const sanitized = sanitizeChatHistory([
    { role: 'user', text: 'Hello' },
    { role: 'system', text: 'Ignored' },
    { role: 'model', text: 'Welcome to Orpheus Studios.' },
  ]);
  assert.equal(sanitized.length, 2);

  const missingKey = await sendConciergeMessage({ message: 'Hi' }, { apiKey: '' });
  assert.equal(missingKey.ok, false);
  if (!missingKey.ok) assert.equal(missingKey.status, 503);

  const emptyMsg = await sendConciergeMessage({ message: '   ' }, { apiKey: 'fake' });
  assert.equal(emptyMsg.ok, false);
  if (!emptyMsg.ok) assert.equal(emptyMsg.status, 400);

  let capturedHistoryCount = 0;
  let capturedModel = '';
  const okChat = await sendConciergeMessage(
    {
      message: 'Tell me about Film & Production.',
      history: [{ role: 'user', text: 'Hello' }],
      model: 'gemini-3.1-flash-lite',
    },
    {
      apiKey: 'fake_test_key',
      sendChatMessageImpl: async ({ model, history, message }) => {
        capturedModel = model;
        capturedHistoryCount = history.length;
        return `Received (${message})`;
      },
    }
  );

  assert.equal(okChat.ok, true);
  assert.equal(capturedModel, 'gemini-3.1-flash-lite');
  assert.equal(capturedHistoryCount, 1);
  if (okChat.ok) {
    assert.match(okChat.reply, /Film & Production/);
  }
});

test('shouldShowBackToTop and clampDockPosition enforce hero threshold and viewport bounds', async () => {
  const { shouldShowBackToTop, clampDockPosition, getDefaultDockPosition } = await import(
    './studioUiHelpers'
  );

  // Hidden while hero section is still above clearance or near top of page
  assert.equal(shouldShowBackToTop(420, 0), false);
  assert.equal(shouldShowBackToTop(140, 260), false);
  assert.equal(shouldShowBackToTop(40, 90), false);

  // Visible once user has scrolled past the hero section
  assert.equal(shouldShowBackToTop(60, 480), true);
  assert.equal(shouldShowBackToTop(-120, 720), true);

  // Clamps draggable dock inside safe viewport beneath top header bar
  const clampedTopLeft = clampDockPosition(
    { x: -120, y: 10 },
    { width: 600, height: 96 },
    { width: 1440, height: 900 }
  );
  assert.deepEqual(clampedTopLeft, { x: 8, y: 84 });

  const clampedBottomRight = clampDockPosition(
    { x: 1400, y: 950 },
    { width: 600, height: 96 },
    { width: 1440, height: 900 }
  );
  assert.deepEqual(clampedBottomRight, { x: 832, y: 796 });

  const centered = getDefaultDockPosition(
    { width: 800, height: 90 },
    { width: 1440, height: 900 }
  );
  assert.deepEqual(centered, { x: 320, y: 794 });
});

test('buildRouteSeoPayload generates compliant SEO titles, descriptions, canonical URLs, social cards, and JSON-LD across all routes', async () => {
  const { buildRouteSeoPayload, ROUTE_SEO } = await import('./seo');
  const origin = 'https://orpheusstudios.example';

  const routeIds = ['home', 'services', 'about', 'studio', 'contact'] as const;
  for (const routeId of routeIds) {
    const payload = buildRouteSeoPayload({ routeId }, origin);
    assert.ok(
      payload.title.length >= 30 && payload.title.length <= 60,
      `Expected ${routeId} title length (30-60), got ${payload.title.length}: "${payload.title}"`
    );
    assert.ok(
      payload.description.length >= 120 && payload.description.length <= 160,
      `Expected ${routeId} description length (120-160), got ${payload.description.length}: "${payload.description}"`
    );
    assert.equal(payload.canonicalUrl, `${origin}${ROUTE_SEO[routeId].path}`);
    assert.equal(payload.imageUrl, `${origin}${STUDIO_IMAGES.brandCrestImage}`);
    assert.equal(payload.siteName, 'Orpheus Studios');
    assert.equal(payload.twitterCard, 'summary_large_image');
    const creator = payload.jsonLd.creator as { sameAs?: string[]; email?: string };
    assert.equal(creator.email, 'orpheusstidos@gmail.com');
    assert.deepEqual(creator.sameAs, ['https://www.instagram.com/orpheusstudioss']);
  }

  const servicesPayload = buildRouteSeoPayload({ routeId: 'services' }, origin);
  assert.equal(servicesPayload.jsonLd['@type'], 'CollectionPage');
  assert.equal((servicesPayload.jsonLd.hasPart as unknown[]).length, 5);

  const filmContactPayload = buildRouteSeoPayload(
    { routeId: 'contact', activeDiscipline: 'Film & Production' },
    origin
  );
  assert.match(filmContactPayload.title, /Film & Production/);
  assert.ok(filmContactPayload.title.length >= 30 && filmContactPayload.title.length <= 60);
  assert.ok(
    filmContactPayload.description.length >= 120 &&
      filmContactPayload.description.length <= 160
  );
  assert.match(filmContactPayload.keywords, /Film & Production/);
});

