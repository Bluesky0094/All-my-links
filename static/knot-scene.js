import {
  Box3, BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, OrthographicCamera,
  Scene, Vector3, WebGLRenderer
} from './vendor/three-0.180.0.js';

const tau = 2 * Math.PI;

// Use the same trefoil, tube radius and opening pose as intreccio.webp.
function spine(t) {
  const bend = 3 * t;
  const radius = 1.62 + .64 * Math.cos(bend);
  return new Vector3(radius * Math.cos(2 * t), radius * Math.sin(2 * t), .85 * Math.sin(bend));
}

function knotGeometry() {
  const rings = 840;
  const sides = 54;
  const positions = [], sections = [], phases = [], indices = [];
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
      sections.push(Math.cos(s), Math.sin(s));
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
  geometry.setAttribute('tubeSection', new Float32BufferAttribute(sections, 2));
  geometry.setAttribute('phase', new Float32BufferAttribute(phases, 1));
  geometry.setIndex(indices);
  return geometry;
}

function stripedMaterial(cycle) {
  const material = new MeshBasicMaterial();
  material.onBeforeCompile = shader => {
    shader.uniforms.pullCycle = cycle;
    const varyings = 'uniform float pullCycle; varying float bandPosition; varying vec3 surfaceNormal;';
    shader.vertexShader = 'attribute float phase; attribute vec2 tubeSection;\n' + varyings + '\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      const float tau = 6.28318530718;
      float t = phase * tau;
      float travel = pullCycle * tau;
      // Shift each bend in sequence. Subtract its initial offset to match the poster at rest.
      float bend = 3.0 * t + 0.34 * (sin(t - travel) - sin(t));
      float bendSlope = 3.0 + 0.34 * (cos(t - travel) - cos(t));
      vec2 radial = vec2(cos(2.0 * t), sin(2.0 * t));
      vec2 around = vec2(-radial.y, radial.x);
      float radius = 1.62 + 0.64 * cos(bend);
      float radiusSlope = -0.64 * sin(bend) * bendSlope;
      vec3 center = vec3(radius * radial, 0.85 * sin(bend));

      // Sweep a round tube perpendicular to the current centerline, including at the crossing.
      vec3 velocity = vec3(radiusSlope * radial + 2.0 * radius * around, 0.85 * cos(bend) * bendSlope);
      vec3 tangent = normalize(velocity);
      vec3 across = normalize(cross(tangent, vec3(0.0, 0.0, 1.0)));
      vec3 outward = tubeSection.x * across + tubeSection.y * cross(tangent, across);
      vec3 transformed = center + 0.41 * outward;
      surfaceNormal = normalMatrix * outward;
      bandPosition = phase;
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
      // Twelve band pitches per cycle: one stripe per second at the automatic speed.
      float phase = (bandPosition * 105.0 - pullCycle * 12.0) * 6.28318530718 - 0.392699;
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
  const renderer = new WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'low-power'});
  const scene = new Scene();
  const geometry = knotGeometry();
  const cycle = {value: 0};
  const knot = new Mesh(geometry, stripedMaterial(cycle));
  knot.rotation.set(Math.atan2(.51, .86), 0, .31, "YXZ");
  scene.add(knot);
  const bounds = new Box3().setFromObject(knot, true);
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
    render(phase, spinPhase) {
      cycle.value = phase;
      knot.rotation.y = spinPhase * tau;
      renderer.render(scene, camera);
    }
  };
}
