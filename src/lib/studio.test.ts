import test from 'node:test';
import assert from 'node:assert/strict';
import { extractQueryParam, matchRoute, normalizePath } from './router';
import {
  formatInquiryText,
  INITIAL_CONTACT_VALUES,
  validateContactForm,
} from './contactValidation';
import { submitContactInquiry } from './contactSubmission';
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

test('matchRoute resolves Home, Services, About, and Contact and defaults unknown paths to home', () => {
  assert.equal(matchRoute('/').id, 'home');
  assert.equal(matchRoute('/services/').id, 'services');
  assert.equal(matchRoute('/about').id, 'about');
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

test('submitContactInquiry refuses to fake success when endpoint is unconfigured', async () => {
  const result = await submitContactInquiry(
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

  assert.equal(result.status, 'unconfigured');
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

test('studio catalog enforces real details, 5 services, and user logo assets with zero placeholder images', () => {
  assert.equal(STUDIO_SERVICES.length, 5);
  assert.equal(STUDIO_CONFIG.email, 'orpheusstidos@gmail.com');
  assert.equal(STUDIO_CONFIG.instagram, '@orpheusstudios');
  assert.equal(STUDIO_CONFIG.location, 'NSTP, NUST, Islamabad, Pakistan');
  assert.deepEqual(Object.keys(STUDIO_IMAGES), ['brandCrestImage', 'brandCrestSvg']);
  assert.equal(
    STUDIO_IMAGES.brandCrestImage,
    '/assets/aistudio/Gemini_Generated_Image_mbt0ngmbt0ngmbt0_c96ad1d9.jpeg'
  );
  assert.equal(STUDIO_IMAGES.brandCrestSvg, '/assets/aistudio/file_5d76b934.svg');
});
