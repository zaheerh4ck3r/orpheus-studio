import * as THREE from 'three';

export type SculptureFinish = 'bronze' | 'obsidian-steel' | 'travertine';

export interface ExplodablePart {
  mesh: THREE.Object3D;
  basePos: THREE.Vector3;
  explodeDelta: THREE.Vector3;
}

export interface OrpheusSculptureRig {
  root: THREE.Group;
  starMesh: THREE.Mesh;
  gimbalMesh: THREE.Mesh;
  crystalMesh: THREE.Mesh;
  stringsGroup: THREE.Group;
  stringMeshes: THREE.Mesh[];
  explodables: ExplodablePart[];
  applyFinish: (finish: SculptureFinish) => void;
  applyExplode: (amount: number) => void;
  updateHarmonics: (elapsed: number) => void;
  dispose: () => void;
}

const FINISH_PALETTES: Record<
  SculptureFinish,
  {
    metalColor: number;
    metalRoughness: number;
    metalness: number;
    plinthColor: number;
    plinthRoughness: number;
    fluteColor: number;
    accentColor: number;
  }
> = {
  bronze: {
    metalColor: 0xc29558,
    metalRoughness: 0.22,
    metalness: 0.92,
    plinthColor: 0x22211f,
    plinthRoughness: 0.78,
    fluteColor: 0xd8cfc0,
    accentColor: 0xc23a32,
  },
  'obsidian-steel': {
    metalColor: 0x8f98a8,
    metalRoughness: 0.16,
    metalness: 0.96,
    plinthColor: 0x171717,
    plinthRoughness: 0.72,
    fluteColor: 0x3b3d42,
    accentColor: 0xc23a32,
  },
  travertine: {
    metalColor: 0xd9c7a3,
    metalRoughness: 0.28,
    metalness: 0.85,
    plinthColor: 0xe6dfd0,
    plinthRoughness: 0.82,
    fluteColor: 0x262522,
    accentColor: 0x244b9b,
  },
};

function createTravertineAlbedoTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ddd6c7';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 3) {
    const shade = 205 + Math.round(Math.sin(y * 0.08) * 14 + Math.cos(y * 0.23) * 8);
    ctx.fillStyle = `rgba(${shade}, ${shade - 6}, ${shade - 18}, 0.35)`;
    ctx.fillRect(0, y, size, 2);
  }

  for (let i = 0; i < 650; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const px = Math.abs(x) * size;
    const py = Math.abs(y) * size;
    const w = 4 + (i % 14);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(40,35,30,0.08)' : 'rgba(255,250,240,0.16)';
    ctx.fillRect(px, py, w, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createAzimuthRingTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const width = 1024;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1b1a18';
  ctx.fillRect(0, 0, width, height);

  // Subtle horizontal brushed lines
  for (let y = 0; y < height; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? 'rgba(255,245,220,0.05)' : 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, y, width, 1);
  }

  // Calibration ticks around circumference
  const tickCount = 72;
  for (let i = 0; i < tickCount; i++) {
    const x = (i / tickCount) * width;
    const isMajor = i % 6 === 0;
    ctx.fillStyle = isMajor ? '#e8c486' : 'rgba(232,196,134,0.45)';
    const h = isMajor ? 46 : 22;
    ctx.fillRect(x, height / 2 - h / 2, isMajor ? 3 : 1.5, h);

    if (isMajor) {
      const deg = String(i * 5).padStart(3, '0');
      ctx.font = '600 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${deg}°`, x, 46);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, 'rgba(10, 10, 10, 0.72)');
  grad.addColorStop(0.5, 'rgba(15, 14, 12, 0.34)');
  grad.addColorStop(1, 'rgba(15, 14, 12, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStarCrestGeometry(): THREE.ExtrudeGeometry {
  const points = 8;
  const outer = 0.24;
  const inner = 0.055;
  const shape = new THREE.Shape();

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

function createLyreHornGeometry(mirrorSign: 1 | -1): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  // Classical swept horn arm silhouette
  s.moveTo(mirrorSign * 0.34, 0.0);
  s.bezierCurveTo(
    mirrorSign * 0.62,
    0.16,
    mirrorSign * 0.78,
    0.58,
    mirrorSign * 0.66,
    1.04
  );
  s.bezierCurveTo(
    mirrorSign * 0.56,
    1.34,
    mirrorSign * 0.42,
    1.56,
    mirrorSign * 0.58,
    1.76
  );
  // Inner curve return
  s.lineTo(mirrorSign * 0.43, 1.79);
  s.bezierCurveTo(
    mirrorSign * 0.28,
    1.52,
    mirrorSign * 0.41,
    1.28,
    mirrorSign * 0.49,
    0.98
  );
  s.bezierCurveTo(
    mirrorSign * 0.59,
    0.58,
    mirrorSign * 0.44,
    0.26,
    mirrorSign * 0.21,
    0.12
  );
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 3,
    curveSegments: 28,
  });
  // Center Z depth cleanly
  geo.translate(0, 0, -0.045);
  return geo;
}

export function buildOrpheusSculpture(
  maxAnisotropy: number,
  isSoftwareGl: boolean
): OrpheusSculptureRig {
  const root = new THREE.Group();
  root.name = 'OrpheusResonanceMonument';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const explodables: ExplodablePart[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  const travertineMap = trackTex(createTravertineAlbedoTexture(maxAnisotropy));
  const dialMap = trackTex(createAzimuthRingTexture(maxAnisotropy));
  const shadowTex = trackTex(createContactShadowTexture());

  const initialPalette = FINISH_PALETTES.bronze;

  // Shared PBR Materials with deliberate roughness / metalness contrast (>= 0.25 delta)
  const plinthMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: initialPalette.plinthColor,
      map: travertineMap,
      roughness: initialPalette.plinthRoughness,
      metalness: 0.06,
    })
  );

  const fluteMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: initialPalette.fluteColor,
      roughness: 0.52,
      metalness: 0.14,
    })
  );

  const primaryMetalMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: initialPalette.metalColor,
      roughness: initialPalette.metalRoughness,
      metalness: initialPalette.metalness,
      anisotropy: 0.78,
      anisotropyRotation: Math.PI / 6,
      clearcoat: 0.22,
      clearcoatRoughness: 0.25,
    })
  );

  const dialBandMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: dialMap,
      roughness: 0.4,
      metalness: 0.72,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );

  const accentLacquerMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: initialPalette.accentColor,
      roughness: 0.28,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
    })
  );

  const stringMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf0dbb5,
      roughness: 0.2,
      metalness: 0.95,
    })
  );

  const crystalMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xf7f5ef,
      roughness: 0.06,
      metalness: 0.0,
      transmission: isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: isSoftwareGl ? 0.38 : 1,
      ior: 1.62,
      thickness: 1.4,
      attenuationColor: new THREE.Color(0xd8c39b),
      attenuationDistance: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      depthWrite: false,
    })
  );

  const shadowPlaneMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.45,
    })
  );

  const registerExplode = (mesh: THREE.Object3D, delta: THREE.Vector3) => {
    explodables.push({
      mesh,
      basePos: mesh.position.clone(),
      explodeDelta: delta,
    });
  };

  // 1. Contact Shadow Plane (y = 0.008 above floor to prevent Z-fighting)
  const contactShadowGeo = trackGeo(new THREE.PlaneGeometry(4.4, 4.4));
  contactShadowGeo.rotateX(-Math.PI / 2);
  const contactShadow = new THREE.Mesh(contactShadowGeo, shadowPlaneMat);
  contactShadow.position.set(0, 0.008, 0);
  contactShadow.name = 'ContactShadow';
  root.add(contactShadow);

  // 2. Stepped Classical Plinth Base (LatheGeometry grounded flush at y = 0)
  const plinthPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.42, 0.0),
    new THREE.Vector2(1.42, 0.12),
    new THREE.Vector2(1.32, 0.16),
    new THREE.Vector2(1.22, 0.16),
    new THREE.Vector2(1.22, 0.30),
    new THREE.Vector2(1.12, 0.35),
    new THREE.Vector2(0.0, 0.35),
  ];
  const plinthGeo = trackGeo(new THREE.LatheGeometry(plinthPoints, 64));
  plinthGeo.computeTangents();
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.castShadow = true;
  plinthMesh.receiveShadow = true;
  plinthMesh.name = 'ClassicalPlinth';
  root.add(plinthMesh);
  registerExplode(plinthMesh, new THREE.Vector3(0, -0.22, 0));

  // 3. Engraved Azimuth Calibration Collar
  const dialGeo = trackGeo(new THREE.CylinderGeometry(1.15, 1.15, 0.11, 64, 1, true));
  const dialMesh = new THREE.Mesh(dialGeo, dialBandMat);
  dialMesh.position.set(0, 0.41, 0);
  dialMesh.castShadow = true;
  dialMesh.name = 'AzimuthCollar';
  root.add(dialMesh);
  registerExplode(dialMesh, new THREE.Vector3(0, -0.08, 0));

  // 4. Instanced Radial Fluted Drum (18 acoustic ribs around pedestal core)
  const ribCount = 18;
  const ribGeo = trackGeo(new THREE.CylinderGeometry(0.048, 0.056, 0.46, 12));
  const flutesInstanced = new THREE.InstancedMesh(ribGeo, fluteMat, ribCount);
  flutesInstanced.castShadow = true;
  flutesInstanced.receiveShadow = true;
  flutesInstanced.name = 'FlutedAcousticDrum';
  const dummy = new THREE.Object3D();
  for (let i = 0; i < ribCount; i++) {
    const theta = (i / ribCount) * Math.PI * 2;
    const radius = 0.88;
    dummy.position.set(Math.cos(theta) * radius, 0.65, Math.sin(theta) * radius);
    dummy.rotation.set(0, -theta, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    flutesInstanced.setMatrixAt(i, dummy.matrix);
  }
  flutesInstanced.instanceMatrix.needsUpdate = true;
  flutesInstanced.computeBoundingSphere();
  root.add(flutesInstanced);
  registerExplode(flutesInstanced, new THREE.Vector3(0, -0.04, 0));

  // 5. Lathed Bronze Resonance Soundbox Bowl
  const bowlPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.76, 0.0),
    new THREE.Vector2(0.84, 0.09),
    new THREE.Vector2(0.78, 0.25),
    new THREE.Vector2(0.56, 0.36),
    new THREE.Vector2(0.42, 0.42),
    new THREE.Vector2(0.0, 0.42),
  ];
  const bowlGeo = trackGeo(new THREE.LatheGeometry(bowlPoints, 48));
  bowlGeo.computeTangents();
  const bowlMesh = new THREE.Mesh(bowlGeo, primaryMetalMat);
  bowlMesh.position.set(0, 0.90, 0);
  bowlMesh.castShadow = true;
  bowlMesh.receiveShadow = true;
  bowlMesh.name = 'ResonanceBowl';
  root.add(bowlMesh);
  registerExplode(bowlMesh, new THREE.Vector3(0, 0.14, 0));

  // 6 & 7. Left and Right Sculpted Lyre Horns (Bevelled ExtrudeGeometry)
  const hornY = 1.24;
  const leftHornGeo = trackGeo(createLyreHornGeometry(-1));
  const leftHorn = new THREE.Mesh(leftHornGeo, primaryMetalMat);
  leftHorn.position.set(0, hornY, 0);
  leftHorn.castShadow = true;
  leftHorn.name = 'LeftLyreHorn';
  root.add(leftHorn);
  registerExplode(leftHorn, new THREE.Vector3(-0.38, 0.35, 0));

  const rightHornGeo = trackGeo(createLyreHornGeometry(1));
  const rightHorn = new THREE.Mesh(rightHornGeo, primaryMetalMat);
  rightHorn.position.set(0, hornY, 0);
  rightHorn.castShadow = true;
  rightHorn.name = 'RightLyreHorn';
  root.add(rightHorn);
  registerExplode(rightHorn, new THREE.Vector3(0.38, 0.35, 0));

  // 8. Transverse Yoke Crossbar & Turned Brass Tuning Finials
  const yokeGroup = new THREE.Group();
  yokeGroup.position.set(0, 2.86, 0);
  yokeGroup.name = 'YokeAssembly';

  const barGeo = trackGeo(new THREE.CylinderGeometry(0.042, 0.042, 1.28, 24));
  barGeo.rotateZ(Math.PI / 2);
  const barMesh = new THREE.Mesh(barGeo, primaryMetalMat);
  barMesh.castShadow = true;
  yokeGroup.add(barMesh);

  const finialGeo = trackGeo(new THREE.SphereGeometry(0.072, 20, 16));
  const leftFinial = new THREE.Mesh(finialGeo, primaryMetalMat);
  leftFinial.position.set(-0.66, 0, 0);
  const rightFinial = new THREE.Mesh(finialGeo, primaryMetalMat);
  rightFinial.position.set(0.66, 0, 0);
  yokeGroup.add(leftFinial, rightFinial);

  const pegGeo = trackGeo(new THREE.CylinderGeometry(0.018, 0.012, 0.14, 12));
  const stringCount = 7;
  for (let i = 0; i < stringCount; i++) {
    const x = THREE.MathUtils.lerp(-0.33, 0.33, i / (stringCount - 1));
    const peg = new THREE.Mesh(pegGeo, fluteMat);
    peg.position.set(x, 0.08, 0);
    yokeGroup.add(peg);
  }
  root.add(yokeGroup);
  registerExplode(yokeGroup, new THREE.Vector3(0, 0.65, 0));

  // 9. Seven Tuned Harmonic Strings
  const stringsGroup = new THREE.Group();
  stringsGroup.position.set(0, 2.08, 0);
  stringsGroup.name = 'HarmonicStrings';
  const stringGeo = trackGeo(new THREE.CylinderGeometry(0.0085, 0.0085, 1.54, 10));
  const stringMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < stringCount; i++) {
    const x = THREE.MathUtils.lerp(-0.33, 0.33, i / (stringCount - 1));
    const sMesh = new THREE.Mesh(stringGeo, stringMat);
    sMesh.position.set(x, 0, 0);
    sMesh.userData.baseX = x;
    sMesh.userData.phase = i * 0.7;
    stringsGroup.add(sMesh);
    stringMeshes.push(sMesh);
  }
  root.add(stringsGroup);
  registerExplode(stringsGroup, new THREE.Vector3(0, 0.38, 0.32));

  // 10. Optical Cinema Aperture Gimbal & Crystal Lens
  const gimbalGeo = trackGeo(new THREE.TorusGeometry(0.98, 0.036, 20, 84));
  const gimbalMesh = new THREE.Mesh(gimbalGeo, primaryMetalMat);
  gimbalMesh.position.set(0, 2.08, 0);
  gimbalMesh.rotation.set(0.28, 0.22, 0);
  gimbalMesh.castShadow = true;
  gimbalMesh.name = 'CinemaApertureGimbal';
  root.add(gimbalMesh);
  registerExplode(gimbalMesh, new THREE.Vector3(0, 0.35, -0.35));

  const crystalGeo = trackGeo(new THREE.OctahedronGeometry(0.29, 0));
  crystalGeo.scale(1.0, 1.25, 0.45);
  const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
  crystalMesh.position.set(0, 2.08, 0.14);
  crystalMesh.renderOrder = 2;
  crystalMesh.name = 'OpticalCrystalPrism';
  root.add(crystalMesh);
  registerExplode(crystalMesh, new THREE.Vector3(0, 0.4, 0.55));

  // 11. Lacquered Vermilion Acoustic Star Emblem
  const starGeo = trackGeo(createStarCrestGeometry());
  const starMesh = new THREE.Mesh(starGeo, accentLacquerMat);
  starMesh.position.set(0, 3.24, 0);
  starMesh.castShadow = true;
  starMesh.name = 'VermilionStarCrest';
  root.add(starMesh);
  registerExplode(starMesh, new THREE.Vector3(0, 0.92, 0));

  const applyFinish = (finish: SculptureFinish) => {
    const p = FINISH_PALETTES[finish];
    primaryMetalMat.color.setHex(p.metalColor);
    primaryMetalMat.roughness = p.metalRoughness;
    primaryMetalMat.metalness = p.metalness;
    plinthMat.color.setHex(p.plinthColor);
    plinthMat.roughness = p.plinthRoughness;
    fluteMat.color.setHex(p.fluteColor);
    accentLacquerMat.color.setHex(p.accentColor);
  };

  const applyExplode = (amount: number) => {
    const clamped = THREE.MathUtils.clamp(amount, 0, 1);
    for (let i = 0; i < explodables.length; i++) {
      const part = explodables[i];
      part.mesh.position.set(
        part.basePos.x + part.explodeDelta.x * clamped,
        part.basePos.y + part.explodeDelta.y * clamped,
        part.basePos.z + part.explodeDelta.z * clamped
      );
    }
  };

  const updateHarmonics = (elapsed: number) => {
    starMesh.rotation.y = elapsed * 0.45;
    crystalMesh.rotation.y = -elapsed * 0.3;
    gimbalMesh.rotation.z = elapsed * 0.14;
    for (let i = 0; i < stringMeshes.length; i++) {
      const s = stringMeshes[i];
      const baseX = s.userData.baseX as number;
      const phase = s.userData.phase as number;
      s.position.z = Math.sin(elapsed * 5.2 + phase) * 0.008;
      s.position.x = baseX + Math.cos(elapsed * 3.8 + phase) * 0.003;
    }
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  };

  return {
    root,
    starMesh,
    gimbalMesh,
    crystalMesh,
    stringsGroup,
    stringMeshes,
    explodables,
    applyFinish,
    applyExplode,
    updateHarmonics,
    dispose,
  };
}
