import { useCallback, useEffect, useState } from 'react';

export type RouteId = 'home' | 'services' | 'about' | 'studio' | 'contact';

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
    description:
      'Shape stories, brand identities, and films with Orpheus Studios—an independent creative studio at NSTP, Islamabad working globally.',
  },
  services: {
    id: 'services',
    path: '/services',
    title: 'Services & Practice — Orpheus Studios',
    description:
      'Explore brand strategy, creative direction, filmmaking, visual identity, and digital experiences under one roof with Orpheus Studios.',
  },
  about: {
    id: 'about',
    path: '/about',
    title: 'About the Studio — Orpheus Studios',
    description:
      'Discover the philosophy behind Orpheus Studios in Islamabad—uniting South Asian heritage, global cinema craft, and strategic restraint.',
  },
  studio: {
    id: 'studio',
    path: '/studio',
    title: 'Studio 3D Atelier — Orpheus Studios',
    description:
      'Inspect The Lyre & Aperture—an interactive 3D spatial study with real-time lighting and materials crafted by Orpheus Studios.',
  },
  contact: {
    id: 'contact',
    path: '/contact',
    title: 'Contact & Project Briefs — Orpheus Studios',
    description:
      'Share your film, identity, or strategy project brief with Orpheus Studios in Islamabad. Direct studio reply within two business days.',
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
    case '/studio':
      return ROUTES.studio;
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

  return { route, pathname, search, navigate };
}
