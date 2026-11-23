import {
  BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, OrthographicCamera,
  Scene, Vector3, WebGLRenderer
} from './vendor/three-0.180.0.js';

const tau = 2 * Math.PI;

// Use the same trefoil, tube radius and opening pose as intreccio.webp.
function spine(t) {
  const radius = 1.62 + .64 * Math.cos(3 * t);
  return new Vector3(radius * Math.cos(2 * t), radius * Math.sin(2 * t), .85 * Math.sin(3 * t));
}

function knotGeometry() {
  const rings = 840;
  const sides = 54;
  const positions = [], normals = [], phases = [], indices = [];
  const up = new Vector3(0, 0, 1);
  const normal = new Vector3();
  for (let ring = 0; ring <= rings; ring++) {
    const t = tau * ring / rings;
    const center = spine(t);
    const tangent = spine(t + .0001).sub(spine(t - .0001)).normalize();
    const across = tangent.clone().cross(up).normalize();
    const binormal = tangent.cross(across);
    for (let side = 0; side < sides; side++) {
      const s = tau * side / sides;
      normal.copy(across).multiplyScalar(Math.cos(s)).addScaledVector(binormal, Math.sin(s));
      positions.push(center.x + .41 * normal.x, center.y + .41 * normal.y, center.z + .41 * normal.z);
      normals.push(normal.x, normal.y, normal.z);
      phases.push(ring / rings);
      if (ring < rings) {
        const a = ring * sides + side;
        const b = ring * sides + (side + 1) % sides;
        indices.push(a, b, a + sides, b, b + sides, a + sides);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('phase', new Float32BufferAttribute(phases, 1));
  geometry.setIndex(indices);
  geometry.rotateZ(.31);
  geometry.rotateX(Math.atan2(.51, .86));
  geometry.computeBoundingBox();
  return geometry;
}

function stripedMaterial() {
  const material = new MeshBasicMaterial();
  material.onBeforeCompile = shader => {
    const varyings = 'varying float bandPosition; varying vec3 surfaceNormal;';
    shader.vertexShader = 'attribute float phase;\n' + varyings + '\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      bandPosition = phase;
      surfaceNormal = normalMatrix * normal;
    `);
    shader.fragmentShader = varyings + '\n' + shader.fragmentShader;
    // Filter the original grayscale bands across a pixel to reduce shimmer on touch screens.
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', `
      float stripe(float phase) {
        return pow(0.5 + 0.5 * cos(phase), 2.6);
      }
      void main() {
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <colorspace_fragment>', `
      float phase = bandPosition * 659.734457 - 0.392699;
      float footprint = fwidth(phase);
      float groove = 0.25 * (stripe(phase - footprint * 0.375) + stripe(phase - footprint * 0.125)
        + stripe(phase + footprint * 0.125) + stripe(phase + footprint * 0.375));
      groove = mix(groove, 0.334, smoothstep(3.14, 6.28, footprint));
      float light = clamp(0.52 + 0.49 * dot(normalize(surfaceNormal), vec3(-0.43,-0.56,0.58)), 0.0, 1.0);
      gl_FragColor.rgb = vec3((12.0 + light * (57.0 + 177.0 * groove)) / 255.0);
    `);
  };
  return material;
}

export function createKnotScene(canvas) {
  const renderer = new WebGLRenderer({canvas, antialias: true, powerPreference: 'low-power'});
  renderer.setClearColor(0xf8f8f6);
  const scene = new Scene();
  const geometry = knotGeometry();
  const knot = new Mesh(geometry, stripedMaterial());
  scene.add(knot);
  const bounds = geometry.boundingBox;
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  // Match the poster’s transparent margin and the 4% inset on each side.
  const half = Math.max(size.x, size.y) * .5 * (1566 / 1550) / .92;
  const camera = new OrthographicCamera(-half, half, half, -half, .1, 20);
  camera.position.set(center.x, center.y, 8);
  return {
    resize(size, pixelRatio) {
      renderer.setPixelRatio(Math.min(pixelRatio, 2));
      renderer.setSize(size, size, false);
    },
    render(angle) {
      knot.rotation.y = angle;
      renderer.render(scene, camera);
    }
  };
}
