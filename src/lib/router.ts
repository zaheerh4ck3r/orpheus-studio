import { useCallback, useEffect, useState } from 'react';
import { STUDIO_CONFIG } from '../data/studioData';

export type RouteId = 'home' | 'services' | 'about' | 'contact';

export interface RouteMeta {
  id: RouteId;
  path: string;
  title: string;
  description: string;
}

export const ROUTES: Record<RouteId, RouteMeta> = {
  home: {
    id: 'home',
    path: '/',
    title: 'Orpheus Studios — Make Things That Move People',
    description: `Orpheus Studios is an independent creative studio based at ${STUDIO_CONFIG.location}, working internationally across film, brand strategy, creative direction and design.`,
  },
  services: {
    id: 'services',
    path: '/services',
    title: 'Services — Orpheus Studios',
    description:
      'Brand Strategy, Creative Direction, Film & Production, Brand Identity & Design, and Digital Experiences at Orpheus Studios.',
  },
  about: {
    id: 'about',
    path: '/about',
    title: 'About — Orpheus Studios',
    description: `Independent creative studio based at ${STUDIO_CONFIG.location}. Named for a storyteller, built for the stories ahead.`,
  },
  contact: {
    id: 'contact',
    path: '/contact',
    title: 'Contact — Orpheus Studios',
    description: `Start a conversation with Orpheus Studios (${STUDIO_CONFIG.email}) — based at ${STUDIO_CONFIG.location}, working internationally.`,
  },
};

export function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutHash = pathname.split('#')[0] ?? '/';
  const withoutQuery = withoutHash.split('?')[0] ?? '/';
  if (withoutQuery === '/') return '/';
  return withoutQuery.replace(/\/+$/, '') || '/';
}

export function extractQueryParam(targetPath: string, key: string): string {
  const withoutHash = targetPath.split('#')[0] ?? '';
  const queryIndex = withoutHash.indexOf('?');
  if (queryIndex === -1) return '';
  const search = withoutHash.slice(queryIndex + 1);
  return new URLSearchParams(search).get(key) ?? '';
}

export function matchRoute(pathname: string): RouteMeta {
  const clean = normalizePath(pathname);
  switch (clean) {
    case '/services':
      return ROUTES.services;
    case '/about':
      return ROUTES.about;
    case '/contact':
      return ROUTES.contact;
    case '/':
    default:
      return ROUTES.home;
  }
}

export function useRouter() {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/'
  );
  const [search, setSearch] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.search : ''
  );

  const route = matchRoute(pathname);

  const navigate = useCallback((targetPath: string) => {
    if (typeof window === 'undefined') return;
    const [pathAndQuery, hashPart] = targetPath.split('#');
    const queryIdx = (pathAndQuery ?? '').indexOf('?');
    const rawPath = queryIdx >= 0 ? (pathAndQuery ?? '').slice(0, queryIdx) : (pathAndQuery ?? '/');
    const nextSearch = queryIdx >= 0 ? (pathAndQuery ?? '').slice(queryIdx) : '';
    const cleanTarget = normalizePath(rawPath || '/');
    const fullUrl = `${cleanTarget}${nextSearch}${hashPart ? `#${hashPart}` : ''}`;

    if (
      normalizePath(window.location.pathname) !== cleanTarget ||
      window.location.search !== nextSearch ||
      hashPart
    ) {
      window.history.pushState({}, '', fullUrl);
      setPathname(cleanTarget);
      setSearch(nextSearch);
    }

    if (hashPart) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hashPart);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePath(window.location.pathname));
      setSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.title = route.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', route.description);
    }
  }, [route.description, route.title]);

  return { route, pathname, search, navigate };
}
