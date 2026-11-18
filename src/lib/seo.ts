import { STUDIO_CONFIG, STUDIO_IMAGES, STUDIO_SERVICES } from '../data/studioData';
import type { RouteId } from './router';

export type SchemaPageType =
  | 'CreativeWork'
  | 'CollectionPage'
  | 'AboutPage'
  | 'WebApplication'
  | 'ContactPage';

export interface RouteSeoPreset {
  id: RouteId;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogType: 'website';
  schemaType: SchemaPageType;
}

export interface PageSeoInput {
  routeId: RouteId;
  path?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  imagePath?: string;
  schemaType?: SchemaPageType;
  activeDiscipline?: string;
}

export interface ResolvedSeoPayload {
  routeId: RouteId;
  path: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogType: 'website';
  siteName: string;
  imageUrl: string;
  twitterCard: 'summary_large_image';
  jsonLd: Record<string, unknown>;
}

export const ROUTE_SEO: Record<RouteId, RouteSeoPreset> = {
  home: {
    id: 'home',
    path: '/',
    title: 'Orpheus Studios — Make Things That Move People',
    description:
      'Shape stories, brand identities, and films with Orpheus Studios—an independent creative studio at NSTP, Islamabad working globally.',
    keywords: [
      'Orpheus Studios',
      'creative studio Islamabad',
      'brand strategy',
      'creative direction',
      'film production Pakistan',
      'brand identity design',
    ],
    ogType: 'website',
    schemaType: 'CreativeWork',
  },
  services: {
    id: 'services',
    path: '/services',
    title: 'Services & Practice — Orpheus Studios',
    description:
      'Explore brand strategy, creative direction, filmmaking, visual identity, and digital experiences under one roof with Orpheus Studios.',
    keywords: [
      'brand strategy services',
      'creative direction studio',
      'brand film production',
      'visual identity system',
      'digital flagship design',
      'Orpheus Studios services',
    ],
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  about: {
    id: 'about',
    path: '/about',
    title: 'About the Studio — Orpheus Studios',
    description:
      'Discover the philosophy behind Orpheus Studios in Islamabad—uniting South Asian heritage, global cinema craft, and strategic restraint.',
    keywords: [
      'about Orpheus Studios',
      'NSTP NUST creative studio',
      'Islamabad film and design studio',
      'Orpheus mythology',
      'independent creative direction',
    ],
    ogType: 'website',
    schemaType: 'AboutPage',
  },
  studio: {
    id: 'studio',
    path: '/studio',
    title: 'Studio 3D Atelier — Orpheus Studios',
    description:
      'Inspect The Lyre & Aperture—an interactive 3D spatial study with real-time lighting and materials crafted by Orpheus Studios.',
    keywords: [
      'Orpheus 3D atelier',
      'The Lyre and Aperture',
      'interactive WebGL sculpture',
      'Three.js brand study',
      'digital experiences studio',
    ],
    ogType: 'website',
    schemaType: 'WebApplication',
  },
  contact: {
    id: 'contact',
    path: '/contact',
    title: 'Contact & Project Briefs — Orpheus Studios',
    description:
      'Share your film, identity, or strategy project brief with Orpheus Studios in Islamabad. Direct studio reply within two business days.',
    keywords: [
      'contact Orpheus Studios',
      'commission creative direction',
      'hire film production Islamabad',
      'brand identity inquiry',
      'Orpheus Studios NSTP NUST',
    ],
    ogType: 'website',
    schemaType: 'ContactPage',
  },
};

function resolveAbsoluteUrl(origin: string, assetOrPath: string): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const normalized = assetOrPath.startsWith('/') ? assetOrPath : `/${assetOrPath}`;
  return cleanOrigin ? `${cleanOrigin}${normalized}` : normalized;
}

export function buildRouteSeoPayload(
  input: PageSeoInput,
  origin = ''
): ResolvedSeoPayload {
  const preset = ROUTE_SEO[input.routeId] ?? ROUTE_SEO.home;
  const cleanDiscipline = input.activeDiscipline?.trim() || '';

  let title = input.title?.trim() || preset.title;
  let description = input.description?.trim() || preset.description;

  if (input.routeId === 'contact' && cleanDiscipline && !input.title && !input.description) {
    title = `Inquiry: ${cleanDiscipline} — Orpheus Studios`;
    description = `Start a ${cleanDiscipline} brief with Orpheus Studios at NSTP, Islamabad. Share your goals for a personal reply within two business days.`;
  }

  const keywordsList =
    input.keywords && input.keywords.length > 0
      ? input.keywords
      : cleanDiscipline
        ? [cleanDiscipline, ...preset.keywords]
        : preset.keywords;

  const routePath = input.path || preset.path;
  const canonicalUrl = resolveAbsoluteUrl(origin, routePath);
  const imageUrl = resolveAbsoluteUrl(origin, input.imagePath || STUDIO_IMAGES.brandCrestImage);
  const schemaType = input.schemaType ?? preset.schemaType;

  const organizationNode = {
    '@type': 'Organization',
    name: STUDIO_CONFIG.name,
    email: STUDIO_CONFIG.email,
    sameAs: [STUDIO_CONFIG.instagramUrl],
    location: {
      '@type': 'Place',
      name: STUDIO_CONFIG.location,
    },
  };

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: title,
    description,
    url: canonicalUrl,
    image: imageUrl,
    creator: organizationNode,
    publisher: organizationNode,
  };

  if (input.routeId === 'services') {
    jsonLd.hasPart = STUDIO_SERVICES.map((service) => ({
      '@type': 'Service',
      name: service.inquiryLabel,
      description: service.shortDescription,
      url: resolveAbsoluteUrl(origin, `/services#${service.slug}`),
      provider: organizationNode,
    }));
  } else if (input.routeId === 'studio') {
    jsonLd.applicationCategory = 'MultimediaApplication';
    jsonLd.operatingSystem = 'All';
    jsonLd.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    };
  }

  return {
    routeId: preset.id,
    path: routePath,
    title,
    description,
    keywords: keywordsList.join(', '),
    canonicalUrl,
    ogType: preset.ogType,
    siteName: STUDIO_CONFIG.name,
    imageUrl,
    twitterCard: 'summary_large_image',
    jsonLd,
  };
}
