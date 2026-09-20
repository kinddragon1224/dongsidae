import * as THREE from "three";

const REGION = [0xcbb89a, 0x93a897, 0xc49282, 0x8b9aab];

export type ChronosphereHandle = {
  setPointer: (x: number, y: number) => void;
  setYear: (year: number) => void;
  resize: (width: number, height: number) => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

export function mountChronosphere(canvas: HTMLCanvasElement): ChronosphereHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 0.12, 6.4);

  scene.add(new THREE.AmbientLight(0xd4c4a8, 0.28));
  const key = new THREE.DirectionalLight(0xe8e2d6, 1.05);
  key.position.set(2.4, 3.2, 4.2);
  scene.add(key);
  const fill = new THREE.PointLight(0x8a7358, 0.45);
  fill.position.set(-2.6, -0.4, 2.2);
  scene.add(fill);

  const group = new THREE.Group();
  group.rotation.x = 0.72;
  scene.add(group);

  const brass = new THREE.MeshStandardMaterial({
    color: 0x6f624c,
    metalness: 0.72,
    roughness: 0.38,
    emissive: 0x1a1610,
    emissiveIntensity: 0.2,
  });

  function ring(radius: number, tube: number, color: number, tilt: number) {
    const geo = new THREE.TorusGeometry(radius, tube, 12, 160);
    const mat = brass.clone();
    mat.color = new THREE.Color(color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = tilt;
    group.add(mesh);
    return mesh;
  }

  const rings = [
    ring(2.35, 0.018, 0x8a7d66, 0.04),
    ring(1.95, 0.014, REGION[0]!, 0.18),
    ring(1.58, 0.013, REGION[1]!, -0.12),
    ring(1.22, 0.012, REGION[2]!, 0.22),
    ring(0.9, 0.011, REGION[3]!, -0.08),
  ];

  const meridian = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.01, 8, 80, Math.PI),
    brass,
  );
  meridian.rotation.y = Math.PI / 2;
  group.add(meridian);

  const hub = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xd4c4a8,
      metalness: 0.5,
      roughness: 0.35,
    }),
  );
  scene.add(hub);

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let year = 1517;
  let raf = 0;
  let running = false;

  function tick() {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    pointer.x += (target.x - pointer.x) * 0.06;
    pointer.y += (target.y - pointer.y) * 0.06;
    group.rotation.z += 0.0018 + year * 0.00000015;
    group.rotation.y = pointer.x * 0.22;
    group.rotation.x = 0.72 + pointer.y * 0.12;
    key.position.x = 2.4 + pointer.x * 0.6;
    key.position.y = 3.2 + pointer.y * 0.4;
    rings[1]!.rotation.z -= 0.0011;
    rings[2]!.rotation.z += 0.0016;
    rings[3]!.rotation.z -= 0.002;
    renderer.render(scene, camera);
  }

  return {
    setPointer(x, y) {
      target.x = x;
      target.y = y;
    },
    setYear(next) {
      year = next;
    },
    resize(width, height) {
      const w = Math.max(1, width);
      const h = Math.max(1, height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    start() {
      if (running) return;
      running = true;
      tick();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      rings.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      meridian.geometry.dispose();
      hub.geometry.dispose();
      (hub.material as THREE.Material).dispose();
      brass.dispose();
      renderer.dispose();
    },
  };
}
