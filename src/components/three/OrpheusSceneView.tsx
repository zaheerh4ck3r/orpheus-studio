import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ThemeMode } from '../../lib/theme';
import { buildOrpheusSculpture, OrpheusSculptureRig, SculptureFinish } from './orpheusSculpture';

export type CameraPresetId = 'hero' | 'profile' | 'aperture' | 'crown';

export const CAMERA_PRESETS: Record<
  CameraPresetId,
  { label: string; position: [number, number, number]; target: [number, number, number] }
> = {
  hero: {
    label: 'Hero',
    position: [3.2, 2.45, 4.35],
    target: [0, 1.68, 0],
  },
  profile: {
    label: 'Profile',
    position: [4.8, 1.85, 0.35],
    target: [0, 1.65, 0],
  },
  aperture: {
    label: 'Aperture',
    position: [0.15, 2.15, 2.75],
    target: [0, 2.05, 0],
  },
  crown: {
    label: 'Crown',
    position: [1.65, 3.85, 2.35],
    target: [0, 2.55, 0],
  },
};

export interface OrpheusSceneViewProps {
  theme: ThemeMode;
  finish: SculptureFinish;
  explodeAmount: number;
  motionSpeed: number;
  cameraPreset: CameraPresetId;
  cameraTrigger: number;
}

// Pre-allocated scratch math helpers (zero per-frame GC allocations)
const _camGoalPos = new THREE.Vector3();
const _camGoalTarget = new THREE.Vector3();
const _stageColorTarget = new THREE.Color();

function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  const probeCanvas = document.createElement('canvas');
  const gl = probeCanvas.getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param) ?? '');
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
}

export function OrpheusSceneView({
  theme,
  finish,
  explodeAmount,
  motionSpeed,
  cameraPreset,
  cameraTrigger,
}: OrpheusSceneViewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    theme,
    finish,
    explodeTarget: explodeAmount,
    explodeCurrent: explodeAmount,
    motionSpeed,
    presetTransitionActive: false,
    presetId: cameraPreset,
    elapsed: 0,
  });

  const rigRef = useRef<OrpheusSculptureRig | null>(null);
  const sceneObjectsRef = useRef<{
    scene: THREE.Scene;
    floorMat: THREE.MeshStandardMaterial;
  } | null>(null);

  // Sync incoming React props into mutable ref without tearing down WebGL
  useEffect(() => {
    stateRef.current.theme = theme;
  }, [theme]);

  useEffect(() => {
    stateRef.current.finish = finish;
    rigRef.current?.applyFinish(finish);
  }, [finish]);

  useEffect(() => {
    stateRef.current.explodeTarget = explodeAmount;
  }, [explodeAmount]);

  useEffect(() => {
    stateRef.current.motionSpeed = motionSpeed;
  }, [motionSpeed]);

  useEffect(() => {
    stateRef.current.presetId = cameraPreset;
    if (cameraTrigger > 0) {
      const preset = CAMERA_PRESETS[cameraPreset];
      _camGoalPos.set(...preset.position);
      _camGoalTarget.set(...preset.target);
      stateRef.current.presetTransitionActive = true;
    }
  }, [cameraPreset, cameraTrigger]);

  // Mount WebGLRenderer & scene cleanly once inside stable ref container
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Orpheus Resonance Monument');

    container.appendChild(renderer.domElement);

    const initialBgHex = stateRef.current.theme === 'obsidian' ? 0x151514 : 0xeae4d6;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(initialBgHex);
    scene.fog = new THREE.FogExp2(initialBgHex, 0.048);

    // Mandatory studio IBL environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    const initialPreset = CAMERA_PRESETS[stateRef.current.presetId];
    camera.position.set(...initialPreset.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialPreset.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.0;
    controls.maxDistance = 9.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minPolarAngle = 0.25;
    controls.update();

    const onControlsStart = () => {
      // Never fight manual user dragging
      stateRef.current.presetTransitionActive = false;
    };
    controls.addEventListener('start', onControlsStart);

    // Three-point warm/cool studio lighting rig (<= 3 shadow casters)
    const hemiLight = new THREE.HemisphereLight(0xdce6f5, 0x3b352c, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
    keyLight.position.set(4.5, 6.5, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    const shadowBound = 4.2;
    keyLight.shadow.camera.left = -shadowBound;
    keyLight.shadow.camera.right = shadowBound;
    keyLight.shadow.camera.top = shadowBound;
    keyLight.shadow.camera.bottom = -shadowBound;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9fb8eb, 1.15);
    rimLight.position.set(-4.5, 4.0, -4.0);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxA = new THREE.RectAreaLight(0xfff4e0, 2.8, 3.2, 4.2);
      softboxA.position.set(3.8, 3.0, 2.2);
      softboxA.lookAt(0, 1.8, 0);
      scene.add(softboxA);

      const softboxB = new THREE.RectAreaLight(0xd2e0ff, 1.8, 3.0, 3.8);
      softboxB.position.set(-3.6, 2.6, -2.5);
      softboxB.lookAt(0, 1.8, 0);
      scene.add(softboxB);
    }

    // Grounded architectural stage floor (offset below contact shadow plane)
    const floorGeo = new THREE.CircleGeometry(14, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: stateRef.current.theme === 'obsidian' ? 0x1c1b1a : 0xe4decf,
      roughness: 0.88,
      metalness: 0.04,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.02, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle concentric studio floor calibration rings
    const ringGeo = new THREE.RingGeometry(1.75, 1.775, 96);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc23a32,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    const studioRing = new THREE.Mesh(ringGeo, ringMat);
    studioRing.position.set(0, -0.005, 0);
    scene.add(studioRing);

    // Build modular 11-part hero procedural sculpture
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const rig = buildOrpheusSculpture(maxAnisotropy, isSoftwareGl);
    rig.applyFinish(stateRef.current.finish);
    rig.applyExplode(stateRef.current.explodeTarget);
    scene.add(rig.root);

    rigRef.current = rig;
    sceneObjectsRef.current = { scene, floorMat };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    let lastTimeMs = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.ALREADY_SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;

      const nowMs = performance.now();
      const delta = Math.min(Math.max((nowMs - lastTimeMs) / 1000, 0), 0.08);
      lastTimeMs = nowMs;
      const st = stateRef.current;

      // Advance harmonic & orbital rotation proportional to elapsed time
      if (st.motionSpeed > 0) {
        st.elapsed += delta * st.motionSpeed;
        rig.root.rotation.y += delta * 0.24 * st.motionSpeed;
      }
      rig.updateHarmonics(st.elapsed);

      // Exponential damping for exploded view separation
      if (Math.abs(st.explodeCurrent - st.explodeTarget) > 0.0008) {
        st.explodeCurrent = THREE.MathUtils.damp(
          st.explodeCurrent,
          st.explodeTarget,
          7.5,
          delta
        );
        rig.applyExplode(st.explodeCurrent);
      }

      // Smooth damped camera preset transitions
      if (st.presetTransitionActive) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoalPos.x, 6.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoalPos.y, 6.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoalPos.z, 6.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _camGoalTarget.x, 6.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _camGoalTarget.y, 6.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _camGoalTarget.z, 6.5, delta);

        if (
          camera.position.distanceToSquared(_camGoalPos) < 0.0004 &&
          controls.target.distanceToSquared(_camGoalTarget) < 0.0004
        ) {
          camera.position.copy(_camGoalPos);
          controls.target.copy(_camGoalTarget);
          st.presetTransitionActive = false;
        }
      }

      // Smooth theme transition for studio cyclorama + horizon fog
      const targetBgHex = st.theme === 'obsidian' ? 0x151514 : 0xeae4d6;
      const targetFloorHex = st.theme === 'obsidian' ? 0x1c1b1a : 0xe4decf;
      _stageColorTarget.setHex(targetBgHex);
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(_stageColorTarget, 1 - Math.exp(-8 * delta));
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(_stageColorTarget, 1 - Math.exp(-8 * delta));
      }
      _stageColorTarget.setHex(targetFloorHex);
      floorMat.color.lerp(_stageColorTarget, 1 - Math.exp(-8 * delta));

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    tick();

    const handleResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 280);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', onControlsStart);
      controls.dispose();
      rig.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      rigRef.current = null;
      sceneObjectsRef.current = null;
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full select-none touch-none" />;
}
