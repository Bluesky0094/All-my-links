import {
  Box3, BufferGeometry, CanvasTexture, CubicBezierCurve, DirectionalLight, Float32BufferAttribute,
  Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera,
  PlaneGeometry, RepeatWrapping, Scene, SRGBColorSpace, Vector2,
  VSMShadowMap, WebGLRenderer, DoubleSide
} from './vendor/three-paper-0.180.0.js';

// The side profile of one strip. The first two changes of tangent are creases;
// the middle stroke flows into a broad, rounded lower turn.
const profile = [
  [[1.03, 1.05], [.86, 1.19], [.61, 1.43], [.47, 1.55]],
  [[.47, 1.55], [.05, 1.48], [-.69, 1.33], [-1.02, 1.27]],
  [[-1.02, 1.27], [-1.07, .62], [-.90, .43], [-.13, .15]],
  [[-.13, .15], [.60, -.12], [1.19, -.29], [1.10, -.91]],
  [[1.10, -.91], [1.01, -1.53], [.13, -1.65], [-.98, -1.25]]
];

function paperGeometry() {
  const curves = profile.map(points => new CubicBezierCurve(...points.map(p => new Vector2(...p))));
  const geometry = new BufferGeometry();
  const positions = [], uvs = [], indices = [];
  const thickness = .022;
  let length = 0;
  function normal(curve, t) {
    const tangent = curve.getTangent(t);
    return new Vector2(-tangent.y, tangent.x);
  }
  function section(curve, i, t) {
    const center = curve.getPoint(t);
    const offset = normal(curve, t);
    const neighbor = t === 0 ? curves[i - 1] : t === 1 ? curves[i + 1] : null;
    if (neighbor) {
      const other = normal(neighbor, 1 - t);
      const miter = 1 + offset.dot(other);
      offset.add(other).divideScalar(miter);
    }
    const point = (side, depth) => [
      center.x + .23 * depth + side * offset.x * thickness / 2,
      center.y - .09 * depth + side * offset.y * thickness / 2,
      depth
    ];
    return [point(1, -.66), point(1, .66), point(-1, .66), point(-1, -.66)];
  }
  function cap(points) {
    const base = positions.length / 3;
    points.forEach((p, i) => { positions.push(...p); uvs.push(i % 2, Math.floor(i / 2)); });
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  curves.forEach((curve, i) => {
    const steps = i < 2 ? 1 : 36;
    const sections = Array.from({length: steps + 1}, (_, step) => section(curve, i, step / steps));
    // Separate the face and edge vertices to keep the cut edges sharp.
    for (let face = 0; face < 4; face++) {
      const base = positions.length / 3;
      for (let j = 0; j <= steps; j++) {
        const other = (face + 1) % 4;
        positions.push(...sections[j][face], ...sections[j][other]);
        const distance = length + j / steps * curve.getLength();
        uvs.push(distance, 0, distance, face % 2 ? thickness : 1.32);
        if (j < steps) {
          const a = base + 2 * j;
          indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
    }
    if (!i) cap(sections[0]);
    if (i === curves.length - 1) cap([...sections[steps]].reverse());
    length += curve.getLength();
  });
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function paperGrain() {
  const tile = document.createElement('canvas');
  tile.width = tile.height = 256;
  const ctx = tile.getContext('2d');
  let seed = 15;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const pixels = ctx.createImageData(256, 256);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const grey = 238 + Math.floor(random() * 18);
    pixels.data.set([grey, grey, grey, 255], i);
  }
  ctx.putImageData(pixels, 0, 0);
  ctx.strokeStyle = 'rgba(87,77,64,.12)';
  ctx.lineWidth = .55;
  for (let i = 0; i < 850; i++) {
    const x = random() * 256, y = random() * 256;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + random() * 5 - 2, y + random() * 3 - 1);
    ctx.stroke();
  }
  const texture = new CanvasTexture(tile);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function contactShadow() {
  const tile = document.createElement('canvas');
  tile.width = tile.height = 128;
  const ctx = tile.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(34,30,26,.28)');
  gradient.addColorStop(.4, 'rgba(34,30,26,.14)');
  gradient.addColorStop(1, 'rgba(34,30,26,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const mesh = new Mesh(new PlaneGeometry(2.5, 1.8), new MeshBasicMaterial({
    map: new CanvasTexture(tile), transparent: true, depthWrite: false
  }));
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function createPaperScene(canvas) {
  const renderer = new WebGLRenderer({canvas, antialias: true, alpha: false, powerPreference: 'low-power'});
  renderer.setClearColor(0xf8f8f6);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap;
  const scene = new Scene();
  const camera = new OrthographicCamera(-2.27, 2.27, 2.27, -2.27, .1, 28);
  camera.position.set(3.65, 2.9, 8);
  camera.lookAt(0, -.02, 0);
  scene.add(new HemisphereLight(0xfafaff, 0xa8a7a4, 1.55));
  const key = new DirectionalLight(0xfffdf8, 2.5);
  key.position.set(-3.7, 6, 4.2);
  key.castShadow = true;
  Object.assign(key.shadow.camera, {left: -3, right: 3, top: 3, bottom: -3, near: .5, far: 15});
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 7;
  key.shadow.blurSamples = 6;
  key.shadow.bias = -.00015;
  key.shadow.normalBias = .012;
  scene.add(key);
  const material = new MeshStandardMaterial({
    color: 0xe9e7e2, map: paperGrain(), roughness: .96, metalness: 0, side: DoubleSide
  });
  const sheet = new Mesh(paperGeometry(), material);
  sheet.castShadow = sheet.receiveShadow = true;
  const turntable = new Group();
  turntable.add(sheet);
  scene.add(turntable);
  const baseY = new Box3().setFromObject(sheet).min.y;
  const contact = contactShadow();
  contact.position.set(.16, baseY - .004, 0);
  turntable.add(contact);

  return {
    resize(size, pixelRatio) {
      renderer.setPixelRatio(Math.min(pixelRatio, 2));
      renderer.setSize(size, size, false);
    },
    render(angle) {
      turntable.rotation.y = angle;
      renderer.render(scene, camera);
    }
  };
}
