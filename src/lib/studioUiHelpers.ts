export interface DockPoint {
  x: number;
  y: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ElementBox {
  width: number;
  height: number;
}

/**
 * Determines whether the Back-to-Top trigger should appear based on the first
 * hero section's viewport bottom edge and current vertical scroll offset.
 */
export function shouldShowBackToTop(
  heroBottomPx: number | null,
  scrollY: number,
  headerClearancePx = 80
): boolean {
  if (heroBottomPx !== null) {
    return heroBottomPx <= headerClearancePx && scrollY > 120;
  }
  return scrollY > 480;
}

/**
 * Clamps a draggable floating panel coordinate inside safe viewport boundaries
 * beneath the sticky top header bar.
 */
export function clampDockPosition(
  point: DockPoint,
  dockSize: ElementBox,
  viewport: ViewportSize,
  headerHeight = 76,
  margin = 8
): DockPoint {
  const minX = margin;
  const maxX = Math.max(minX, viewport.width - dockSize.width - margin);
  const minY = headerHeight + margin;
  const maxY = Math.max(minY, viewport.height - dockSize.height - margin);

  return {
    x: Math.round(Math.min(Math.max(point.x, minX), maxX)),
    y: Math.round(Math.min(Math.max(point.y, minY), maxY)),
  };
}

/**
 * Computes the centered bottom default dock coordinate within viewport bounds.
 */
export function getDefaultDockPosition(
  dockSize: ElementBox,
  viewport: ViewportSize,
  headerHeight = 76,
  bottomOffset = 16
): DockPoint {
  return clampDockPosition(
    {
      x: (viewport.width - dockSize.width) / 2,
      y: viewport.height - dockSize.height - bottomOffset,
    },
    dockSize,
    viewport,
    headerHeight,
    8
  );
}
