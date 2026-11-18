import React, { useCallback, useEffect, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  ColorScheme,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { STUDIO_CONFIG } from '../data/studioData';
import { useTheme } from '../lib/theme';

interface LatLngPoint {
  lat: number;
  lng: number;
}

interface PlaceLocationLike {
  lat: () => number;
  lng: () => number;
}

interface PlaceResultLike {
  id?: string;
  displayName?: string | null;
  formattedAddress?: string | null;
  location?: PlaceLocationLike | null;
  googleMapsURI?: string | null;
}

interface PolylineLike {
  setMap: (map: unknown) => void;
}

interface BoundsLike {
  extend: (point: LatLngPoint) => void;
}

interface ResolvedPlaceInfo {
  id: string;
  name: string;
  address: string;
  location: LatLngPoint;
  googleMapsURI?: string;
}

type DiscoveryCategoryId = 'studio' | 'coffee' | 'culture' | 'transit';

interface DiscoveryCategory {
  id: DiscoveryCategoryId;
  label: string;
  query: string;
}

const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  { id: 'studio', label: 'Studio Seat', query: '' },
  {
    id: 'coffee',
    label: 'Coffee & Meetings',
    query: 'specialty coffee cafe near NSTP NUST H-12 Islamabad',
  },
  {
    id: 'culture',
    label: 'Museums & Architecture',
    query: 'Lok Virsa Museum Pakistan Monument Faisal Mosque Islamabad',
  },
  {
    id: 'transit',
    label: 'Airport & Transit',
    query: 'Islamabad International Airport or Kashmir Highway Metro Station',
  },
];

// Broad initial regional viewport center only; exact studio marker coordinates are resolved live via Places API (New).
const REGIONAL_INITIAL_CENTER: LatLngPoint = { lat: 30.3753, lng: 69.3451 };

function checkQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  const upper = msg.toUpperCase();
  return (
    upper.includes('RESOURCE_EXHAUSTED') ||
    upper.includes('OVER_QUERY_LIMIT') ||
    upper.includes('OVERQUOTA') ||
    upper.includes('429')
  );
}

function StudioMarkerPin({
  place,
  isStudio,
  isSelected,
  onSelect,
}: {
  place: ResolvedPlaceInfo;
  isStudio?: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={place.location}
        title={place.name}
        onClick={onSelect}
        zIndex={isStudio ? 20 : isSelected ? 15 : 5}
      >
        <Pin
          background={isStudio ? '#C23A32' : isSelected ? '#244B9B' : '#171717'}
          borderColor={isStudio ? '#8A231D' : '#F3EFE6'}
          glyphColor="#F3EFE6"
          scale={isStudio ? 1.18 : 0.96}
        />
      </AdvancedMarker>

      {isSelected && marker ? (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={onSelect}>
          <div className="text-[#171717] p-1 space-y-1.5 font-sans">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#C23A32] font-semibold">
              {isStudio ? 'Orpheus Studios · Seat' : 'Islamabad Context'}
            </p>
            <p className="font-serif text-base font-medium leading-snug">{place.name}</p>
            {place.address ? (
              <p className="text-xs text-[#171717]/75 leading-relaxed">{place.address}</p>
            ) : null}
            {place.googleMapsURI ? (
              <a
                href={place.googleMapsURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[11px] uppercase tracking-[0.14em] font-medium text-[#244B9B] underline pt-1"
              >
                Open in Google Maps ↗
              </a>
            ) : null}
          </div>
        </InfoWindow>
      ) : null}
    </>
  );
}

function StudioMapScene({
  category,
  onStudioResolved,
  onNearbyResolved,
  selectedPlaceId,
  onSelectPlace,
  routeDestination,
  onRouteSummary,
  onServiceError,
}: {
  category: DiscoveryCategoryId;
  onStudioResolved: (studio: ResolvedPlaceInfo) => void;
  onNearbyResolved: (places: ResolvedPlaceInfo[]) => void;
  selectedPlaceId: string | null;
  onSelectPlace: (id: string | null) => void;
  routeDestination: ResolvedPlaceInfo | null;
  onRouteSummary: (summary: { distanceKm: string; durationMin: string } | null) => void;
  onServiceError: (msg: string | null) => void;
}) {
  const map = useMap();
  const coreLib = useMapsLibrary('core') as unknown as {
    LatLngBounds: new () => BoundsLike;
  } | null;
  const mapsLib = useMapsLibrary('maps') as unknown as {
    Polyline: new (opts: Record<string, unknown>) => PolylineLike;
  } | null;
  const placesLib = useMapsLibrary('places') as unknown as {
    Place: {
      searchByText: (req: Record<string, unknown>) => Promise<{ places?: PlaceResultLike[] }>;
    };
  } | null;
  const routesLib = useMapsLibrary('routes') as unknown as {
    TravelMode: { DRIVING: unknown };
    Route: {
      computeRoutes: (req: Record<string, unknown>) => Promise<{
        routes?: Array<{
          path?: unknown[];
          distanceMeters?: number;
          durationMillis?: number;
          viewport?: unknown;
        }>;
      }>;
    };
  } | null;
  const status = useApiLoadingStatus();

  const [studioPlace, setStudioPlace] = useState<ResolvedPlaceInfo | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<ResolvedPlaceInfo[]>([]);
  const [activePolyline, setActivePolyline] = useState<PolylineLike | null>(null);

  useEffect(() => {
    if (status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED) {
      onServiceError('Unable to authorize Google Maps Platform tiles in this environment.');
    }
  }, [status, onServiceError]);

  // 1. Resolve Orpheus Studios exact campus coordinates dynamically via Places API (New)
  useEffect(() => {
    if (!placesLib || !map || studioPlace) return;

    let cancelled = false;
    (async () => {
      try {
        const { places } = await placesLib.Place.searchByText({
          textQuery: 'National Science and Technology Park NSTP NUST H-12 Islamabad Pakistan',
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          maxResultCount: 1,
          language: 'en',
          region: 'pk',
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
        });
        if (cancelled) return;

        const match = places?.[0];
        if (match?.location) {
          const coords = {
            lat: match.location.lat(),
            lng: match.location.lng(),
          };
          const resolved: ResolvedPlaceInfo = {
            id: match.id || 'orpheus-nstp',
            name: match.displayName || 'Orpheus Studios · NSTP, NUST',
            address: match.formattedAddress || STUDIO_CONFIG.location,
            location: coords,
            googleMapsURI: match.googleMapsURI ?? undefined,
          };
          setStudioPlace(resolved);
          onStudioResolved(resolved);
          onSelectPlace(resolved.id);
          map.panTo(coords);
          map.setZoom(15);
          onServiceError(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (checkQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onServiceError('Unable to resolve studio location via Places API right now.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placesLib, map, studioPlace, onStudioResolved, onSelectPlace, onServiceError]);

  // 2. Discover surrounding Islamabad landmarks for the selected category
  useEffect(() => {
    if (!placesLib || !coreLib || !map || !studioPlace) return;

    if (category === 'studio') {
      setNearbyPlaces([]);
      onNearbyResolved([]);
      map.panTo(studioPlace.location);
      map.setZoom(15);
      onServiceError(null);
      return;
    }

    const catObj = DISCOVERY_CATEGORIES.find((c) => c.id === category);
    if (!catObj?.query) return;

    let cancelled = false;
    (async () => {
      try {
        const { places } = await placesLib.Place.searchByText({
          textQuery: catObj.query,
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          locationBias: studioPlace.location,
          maxResultCount: 4,
          language: 'en',
          region: 'pk',
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
        });
        if (cancelled) return;

        const mapped: ResolvedPlaceInfo[] = [];
        const bounds = new coreLib.LatLngBounds();
        bounds.extend(studioPlace.location);

        for (const p of places ?? []) {
          if (!p.location) continue;
          const pos = { lat: p.location.lat(), lng: p.location.lng() };
          bounds.extend(pos);
          mapped.push({
            id: p.id || `${pos.lat}-${pos.lng}`,
            name: p.displayName || 'Islamabad Landmark',
            address: p.formattedAddress || '',
            location: pos,
            googleMapsURI: p.googleMapsURI ?? undefined,
          });
        }

        setNearbyPlaces(mapped);
        onNearbyResolved(mapped);
        if (mapped.length > 0) {
          map.fitBounds(bounds as unknown as never, 56);
        }
        onServiceError(null);
      } catch (err) {
        if (cancelled) return;
        if (checkQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onServiceError('Unable to load surrounding places right now.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, placesLib, coreLib, map, studioPlace, onNearbyResolved, onServiceError]);

  // 3. Compute driving route polyline between a selected landmark and the Studio Seat
  useEffect(() => {
    if (activePolyline) {
      activePolyline.setMap(null);
      setActivePolyline(null);
    }
    onRouteSummary(null);

    if (!routesLib || !mapsLib || !map || !studioPlace || !routeDestination) return;
    if (routeDestination.id === studioPlace.id) return;

    let cancelled = false;
    (async () => {
      try {
        const { routes } = await routesLib.Route.computeRoutes({
          origin: studioPlace.location,
          destination: routeDestination.location,
          travelMode: routesLib.TravelMode.DRIVING,
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
        });
        if (cancelled) return;

        const primary = routes?.[0];
        if (!primary) return;

        if (primary.path && primary.path.length > 0) {
          const line = new mapsLib.Polyline({
            path: primary.path,
            geodesic: true,
            strokeColor: '#C23A32',
            strokeOpacity: 0.9,
            strokeWeight: 4,
            map,
          });
          setActivePolyline(line);
        }

        if (primary.viewport) {
          map.fitBounds(primary.viewport as never, 60);
        }

        const meters = primary.distanceMeters ?? 0;
        const millis = primary.durationMillis ?? 0;
        const km = meters > 0 ? `${(meters / 1000).toFixed(1)} km` : 'Route ready';
        const mins = millis > 0 ? `${Math.max(1, Math.round(millis / 60000))} min drive` : '';
        onRouteSummary({ distanceKm: km, durationMin: mins });
      } catch (err) {
        if (cancelled) return;
        if (checkQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routesLib, mapsLib, map, studioPlace, routeDestination]);

  return (
    <>
      {studioPlace ? (
        <StudioMarkerPin
          place={studioPlace}
          isStudio
          isSelected={selectedPlaceId === studioPlace.id}
          onSelect={() => onSelectPlace(selectedPlaceId === studioPlace.id ? null : studioPlace.id)}
        />
      ) : null}

      {nearbyPlaces.map((place) => (
        <StudioMarkerPin
          key={place.id}
          place={place}
          isSelected={selectedPlaceId === place.id}
          onSelect={() => onSelectPlace(selectedPlaceId === place.id ? null : place.id)}
        />
      ))}
    </>
  );
}

export function StudioLocationMap() {
  const { theme } = useTheme();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';

  const [category, setCategory] = useState<DiscoveryCategoryId>('studio');
  const [studioPlace, setStudioPlace] = useState<ResolvedPlaceInfo | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<ResolvedPlaceInfo[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<{
    distanceKm: string;
    durationMin: string;
  } | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const selectedNearby =
    nearbyPlaces.find((p) => p.id === selectedPlaceId) ?? null;

  const handleStudioResolved = useCallback((place: ResolvedPlaceInfo) => {
    setStudioPlace(place);
  }, []);

  const handleNearbyResolved = useCallback((places: ResolvedPlaceInfo[]) => {
    setNearbyPlaces(places);
  }, []);

  return (
    <div className="mt-20 pt-14 border-t border-ink/15" data-testid="studio-location-map-section">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-accent mb-3">
            Studio Coordinates &amp; Directions
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl leading-[1.08] tracking-[-0.015em] text-ink">
            Visit Us in Islamabad
          </h2>
          <p className="font-sans text-sm text-ink/75 mt-2 max-w-xl">
            {studioPlace?.address || STUDIO_CONFIG.location} — explore nearby coffee spots,
            cultural landmarks, or calculate travel distance from transit hubs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Islamabad map filters">
          {DISCOVERY_CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  if (cat.id === 'studio' && studioPlace) {
                    setSelectedPlaceId(studioPlace.id);
                  }
                }}
                className={`editorial-btn-hover px-3.5 py-2 text-[11px] font-sans font-medium uppercase tracking-[0.14em] border cursor-pointer ${
                  active
                    ? 'bg-btn text-btn-ink border-btn'
                    : 'border-ink/20 text-ink/75 hover:border-ink hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {!apiKey ? (
        <div className="border border-ink/20 bg-canvas-elevated p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent">
              Studio Location
            </p>
            <p className="font-serif text-xl text-ink">{STUDIO_CONFIG.location}</p>
            <p className="font-sans text-sm text-ink/70 max-w-lg">
              Interactive Google Maps exploration activates when VITE_GOOGLE_MAPS_API_KEY is
              provided in the deployment environment.
            </p>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=NSTP+NUST+Islamabad+Pakistan"
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-btn-hover inline-flex items-center gap-2 bg-btn text-btn-ink px-5 py-3 text-xs font-sans font-medium uppercase tracking-[0.16em] whitespace-nowrap hover:bg-accent hover:text-parchment shrink-0"
          >
            <span>Open Google Maps</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 border border-ink/20 overflow-hidden bg-canvas-elevated">
            <div className="w-full h-[380px] sm:h-[440px]">
              <APIProvider apiKey={apiKey} language="en" region="PK">
                <GoogleMap
                  defaultCenter={REGIONAL_INITIAL_CENTER}
                  defaultZoom={5}
                  mapId="DEMO_MAP_ID"
                  colorScheme={theme === 'obsidian' ? ColorScheme.DARK : ColorScheme.LIGHT}
                  gestureHandling="greedy"
                  mapTypeControl={false}
                  streetViewControl={false}
                  fullscreenControl
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  <StudioMapScene
                    category={category}
                    onStudioResolved={handleStudioResolved}
                    onNearbyResolved={handleNearbyResolved}
                    selectedPlaceId={selectedPlaceId}
                    onSelectPlace={setSelectedPlaceId}
                    routeDestination={selectedNearby}
                    onRouteSummary={setRouteSummary}
                    onServiceError={setServiceError}
                  />
                </GoogleMap>
              </APIProvider>
            </div>
          </div>

          <div className="lg:col-span-4 border border-ink/20 bg-canvas-elevated p-6 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="border-b border-ink/15 pb-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-accent">
                  Studio Base
                </p>
                <p className="font-serif text-xl text-ink mt-1">
                  {studioPlace?.name || 'NSTP, NUST Campus'}
                </p>
                <p className="font-sans text-xs text-ink/70 mt-1.5 leading-relaxed">
                  {studioPlace?.address || STUDIO_CONFIG.location}
                </p>
              </div>

              {serviceError ? (
                <p className="font-sans text-xs text-accent border border-accent/30 bg-accent/[0.06] p-3">
                  {serviceError}
                </p>
              ) : null}

              {nearbyPlaces.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/55">
                    Select to Compute Route
                  </p>
                  <ul className="divide-y divide-ink/12 border-t border-b border-ink/12">
                    {nearbyPlaces.map((p) => {
                      const active = selectedPlaceId === p.id;
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedPlaceId(p.id)}
                            className={`w-full text-left py-2.5 px-2 transition-colors cursor-pointer ${
                              active ? 'bg-accent/10 text-ink' : 'text-ink/80 hover:text-ink'
                            }`}
                          >
                            <span className="block font-sans text-xs font-medium">{p.name}</span>
                            {p.address ? (
                              <span className="block font-sans text-[11px] text-ink/55 truncate mt-0.5">
                                {p.address}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="font-sans text-xs text-ink/70 leading-relaxed">
                  Use the filters above to discover meeting cafés, Islamabad cultural landmarks,
                  and airport transit links with live travel time estimates.
                </p>
              )}

              {routeSummary ? (
                <div className="border border-ink/20 bg-canvas p-3.5 flex items-center justify-between text-xs font-sans">
                  <span className="uppercase tracking-[0.16em] text-ink/60">Estimated Drive</span>
                  <span className="font-medium text-ink tabular-nums">
                    {routeSummary.distanceKm}
                    {routeSummary.durationMin ? ` · ${routeSummary.durationMin}` : ''}
                  </span>
                </div>
              ) : null}
            </div>

            {studioPlace?.googleMapsURI ? (
              <a
                href={studioPlace.googleMapsURI}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-btn-hover inline-flex items-center justify-center gap-2 bg-btn text-btn-ink px-4 py-3 text-xs font-sans font-medium uppercase tracking-[0.16em] hover:bg-accent hover:text-parchment"
              >
                <span>Open Directions in Maps</span>
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
