import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripHorizontal, RotateCcw } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import {
  clampDockPosition,
  DockPoint,
  getDefaultDockPosition,
} from '../lib/studioUiHelpers';
import {
  CAMERA_PRESETS,
  CameraPresetId,
  OrpheusSceneView,
} from '../components/three/OrpheusSceneView';
import { SculptureFinish } from '../components/three/orpheusSculpture';
import { StarMark } from '../components/LyreLogo';

interface Studio3DPageProps {
  onNavigate: (path: string) => void;
}

const FINISH_OPTIONS: { id: SculptureFinish; label: string; swatch: string }[] = [
  { id: 'bronze', label: 'Antique Bronze', swatch: '#C29558' },
  { id: 'obsidian-steel', label: 'Obsidian Steel', swatch: '#6F7785' },
  { id: 'travertine', label: 'Travertine', swatch: '#DCD4C2' },
];

export function Studio3DPage({ onNavigate }: Studio3DPageProps) {
  useDocumentMeta({ routeId: 'studio' });
  const { theme } = useTheme();
  const [finish, setFinish] = useState<SculptureFinish>('bronze');
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [motionSpeed, setMotionSpeed] = useState(1);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('hero');
  const [cameraTrigger, setCameraTrigger] = useState(0);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const dockRef = useRef<HTMLDivElement | null>(null);
  const dragSessionRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startDockPos: DockPoint;
    dockWidth: number;
    dockHeight: number;
  } | null>(null);

  const [dockPos, setDockPos] = useState<DockPoint | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const recenterDock = useCallback(() => {
    const el = dockRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centered = getDefaultDockPosition(
      { width: rect.width, height: rect.height },
      { width: window.innerWidth, height: window.innerHeight }
    );
    setDockPos(centered);
    setHasDragged(false);
  }, []);

  // Measure and position the dock synchronously before first paint + clamp on collapse/resize
  useLayoutEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };

    setDockPos((prev) => {
      if (!prev || !hasDragged) {
        return getDefaultDockPosition({ width: rect.width, height: rect.height }, viewport);
      }
      return clampDockPosition(prev, { width: rect.width, height: rect.height }, viewport);
    });
  }, [dockCollapsed, hasDragged]);

  useEffect(() => {
    const handleResize = () => {
      const el = dockRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      setDockPos((prev) => {
        if (!prev || !hasDragged) {
          return getDefaultDockPosition({ width: rect.width, height: rect.height }, viewport);
        }
        return clampDockPosition(prev, { width: rect.width, height: rect.height }, viewport);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasDragged]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const targetEl = e.target as HTMLElement | null;
    if (targetEl?.closest('button, input, a, label')) return;

    const el = dockRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const startDockPos = dockPos ?? { x: rect.left, y: rect.top };

    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    dragSessionRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startDockPos,
      dockWidth: rect.width,
      dockHeight: rect.height,
    };
    setIsDragging(true);
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;

    const dx = e.clientX - session.startClientX;
    const dy = e.clientY - session.startClientY;

    const next = clampDockPosition(
      {
        x: session.startDockPos.x + dx,
        y: session.startDockPos.y + dy,
      },
      { width: session.dockWidth, height: session.dockHeight },
      { width: window.innerWidth, height: window.innerHeight }
    );

    setDockPos(next);
    if (!hasDragged && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      setHasDragged(true);
    }
  };

  const handleDragPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    dragSessionRef.current = null;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleSelectPreset = (id: CameraPresetId) => {
    setCameraPreset(id);
    setCameraTrigger((prev) => prev + 1);
  };

  const handleReset = () => {
    setFinish('bronze');
    setExplodeAmount(0);
    setMotionSpeed(1);
    handleSelectPreset('hero');
  };

  const surfaceBg =
    theme === 'obsidian' ? 'rgba(23, 23, 23, 0.94)' : 'rgba(243, 239, 230, 0.95)';

  return (
    <section
      aria-label="Orpheus Studios 3D Sculpture Atelier"
      className="relative w-full h-[calc(100vh-72px)] min-h-[540px] bg-canvas text-ink overflow-hidden"
    >
      {/* Isolated WebGL canvas viewport — zero UI clutter across center stage */}
      <div className="absolute inset-0">
        <OrpheusSceneView
          theme={theme}
          finish={finish}
          explodeAmount={explodeAmount}
          motionSpeed={motionSpeed}
          cameraPreset={cameraPreset}
          cameraTrigger={cameraTrigger}
        />
      </div>

      {/* Minimal Top-Left Editorial Plate Caption */}
      <div className="pointer-events-none absolute top-4 left-4 sm:top-6 sm:left-8 z-10 max-w-xs">
        <div
          className="pointer-events-auto border border-ink/20 px-4 py-3"
          style={{
            backgroundColor:
              theme === 'obsidian' ? 'rgba(23, 23, 23, 0.90)' : 'rgba(243, 239, 230, 0.92)',
          }}
        >
          <div className="flex items-center gap-2">
            <StarMark className="w-3 h-3 text-accent shrink-0" />
            <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/70">
              Object 01 · Real-Time Study
            </p>
          </div>
          <h1 className="font-serif text-lg sm:text-xl leading-tight text-ink mt-1">
            The Lyre &amp; Aperture
          </h1>
          <p className="font-sans text-[11px] text-ink/65 mt-1 hidden sm:block">
            Drag stage to orbit · Drag dock bar to reposition · H for cinema mode
          </p>
        </div>
      </div>

      {/* Minimal Top-Right Commission Entry without covering central stage */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10 hidden sm:block">
        <a
          href="/contact?service=Digital+Experiences"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/contact?service=Digital+Experiences');
          }}
          className="editorial-btn-hover inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-sans font-medium uppercase tracking-[0.16em] bg-btn text-btn-ink hover:bg-accent hover:text-parchment border border-ink/15"
        >
          <span>Commission 3D Work</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* Freely Draggable Unified 3D Control Dock (Zero backdrop-filter over WebGL) */}
      <div
        ref={dockRef}
        data-testid="studio-3d-controls-dock"
        className={`fixed z-20 ${dockCollapsed ? 'w-auto min-w-[260px]' : 'w-[min(860px,94vw)]'} ${
          dockPos ? 'top-0 left-0' : 'bottom-4 left-1/2 -translate-x-1/2'
        }`}
        style={
          dockPos
            ? {
                transform: `translate3d(${dockPos.x}px, ${dockPos.y}px, 0)`,
                willChange: isDragging ? 'transform' : 'auto',
              }
            : undefined
        }
      >
        {/* Drag Handle Header Bar */}
        <div
          data-testid="studio-3d-drag-handle"
          onPointerDown={handleDragPointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handleDragPointerEnd}
          onPointerCancel={handleDragPointerEnd}
          onDoubleClick={recenterDock}
          title="Drag controls anywhere on screen (double-click to re-center)"
          className={`flex items-center justify-between gap-4 px-3.5 py-2 border border-ink/20 ${
            dockCollapsed ? '' : 'border-b-0'
          } select-none touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ backgroundColor: surfaceBg }}
        >
          <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-ink/70 whitespace-nowrap">
            <GripHorizontal className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Controls · Drag</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasDragged ? (
              <button
                type="button"
                onClick={recenterDock}
                data-testid="studio-3d-dock-recenter"
                className="editorial-btn-hover px-2 py-1 text-[10px] font-sans uppercase tracking-[0.16em] border border-ink/20 text-ink/75 hover:border-ink hover:text-ink cursor-pointer"
              >
                Center
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setDockCollapsed((prev) => !prev)}
              data-testid="studio-3d-dock-toggle"
              className="editorial-btn-hover inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-sans font-medium uppercase tracking-[0.18em] border border-ink/20 text-ink hover:border-ink cursor-pointer"
            >
              {dockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Show Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Hide Controls</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!dockCollapsed ? (
          <div
            className="border border-ink/20 px-4 py-3 sm:px-5 sm:py-3.5 shadow-lg"
            style={{ backgroundColor: surfaceBg }}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
              {/* Explode Assembly Slider */}
              <div className="flex items-center gap-3 min-w-[170px] flex-1">
                <label
                  htmlFor="sculpture-explode"
                  className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink/70 shrink-0"
                >
                  Assembly
                </label>
                <input
                  id="sculpture-explode"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(explodeAmount * 100)}
                  onChange={(e) => setExplodeAmount(Number(e.target.value) / 100)}
                  className="w-full accent-[var(--theme-vermilion)] cursor-pointer h-1.5"
                />
                <span className="font-sans text-[11px] tabular-nums text-ink/75 w-9 text-right">
                  {Math.round(explodeAmount * 100)}%
                </span>
              </div>

              {/* Finish Swatches */}
              <div className="flex items-center gap-2" role="group" aria-label="Material finish">
                <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink/60 hidden md:inline">
                  Material
                </span>
                {FINISH_OPTIONS.map((opt) => {
                  const selected = finish === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFinish(opt.id)}
                      aria-pressed={selected}
                      title={opt.label}
                      className={`editorial-btn-hover inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.14em] border cursor-pointer ${
                        selected
                          ? 'border-ink bg-btn text-btn-ink'
                          : 'border-ink/20 text-ink/80 hover:border-ink/50'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="w-2.5 h-2.5 border border-ink/30 shrink-0"
                        style={{ backgroundColor: opt.swatch }}
                      />
                      <span className="hidden sm:inline">{opt.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Camera Angles */}
              <div className="flex items-center gap-1.5" role="group" aria-label="Camera views">
                {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((presetKey) => {
                  const active = cameraPreset === presetKey;
                  return (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => handleSelectPreset(presetKey)}
                      className={`editorial-btn-hover px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.14em] border cursor-pointer ${
                        active
                          ? 'border-accent bg-accent text-parchment'
                          : 'border-ink/20 text-ink/75 hover:border-ink/50'
                      }`}
                    >
                      {CAMERA_PRESETS[presetKey].label}
                    </button>
                  );
                })}
              </div>

              {/* Motion & Reset */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMotionSpeed((s) => (s > 0 ? 0 : 1))}
                  className="editorial-btn-hover px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.14em] border border-ink/20 text-ink/80 hover:border-ink cursor-pointer"
                >
                  {motionSpeed > 0 ? 'Pause' : 'Drift'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset 3D view"
                  title="Reset view"
                  className="editorial-btn-hover inline-flex items-center justify-center w-7 h-7 border border-ink/20 text-ink/75 hover:border-ink hover:text-ink cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
