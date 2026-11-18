import { useEffect } from 'react';
import { buildRouteSeoPayload, type PageSeoInput } from '../lib/seo';

function upsertMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string
): void {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonicalLink(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLdScript(data: Record<string, unknown>): void {
  const scriptId = 'orpheus-structured-data';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script =
      document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]') ??
      document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    if (!script.parentNode) {
      document.head.appendChild(script);
    }
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Updates document title, standard meta tags, OpenGraph/Twitter social cards,
 * canonical URL, and Schema.org JSON-LD dynamically per active page/route.
 */
export function useDocumentMeta(input: PageSeoInput): void {
  const keywordsKey = input.keywords?.join('|') ?? '';

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const origin = window.location.origin;
    const payload = buildRouteSeoPayload(input, origin);

    document.title = payload.title;

    upsertMetaTag('name', 'description', payload.description);
    upsertMetaTag('name', 'keywords', payload.keywords);

    upsertMetaTag('property', 'og:type', payload.ogType);
    upsertMetaTag('property', 'og:site_name', payload.siteName);
    upsertMetaTag('property', 'og:title', payload.title);
    upsertMetaTag('property', 'og:description', payload.description);
    upsertMetaTag('property', 'og:url', payload.canonicalUrl);
    upsertMetaTag('property', 'og:image', payload.imageUrl);

    upsertMetaTag('name', 'twitter:card', payload.twitterCard);
    upsertMetaTag('name', 'twitter:title', payload.title);
    upsertMetaTag('name', 'twitter:description', payload.description);
    upsertMetaTag('name', 'twitter:image', payload.imageUrl);

    upsertCanonicalLink(payload.canonicalUrl);
    upsertJsonLdScript(payload.jsonLd);
  }, [
    input.routeId,
    input.path,
    input.title,
    input.description,
    keywordsKey,
    input.imagePath,
    input.schemaType,
    input.activeDiscipline,
  ]);
}
