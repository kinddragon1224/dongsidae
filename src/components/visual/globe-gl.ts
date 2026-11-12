import * as THREE from "three";

/**
 * 해안선만 그린 지구본. 사진 질감 없이 선과 점으로 — 고문서 톤.
 * 계속 돌리지 않는다: 바뀔 때만 그리고(invalidate), 시점 이동 중에만 루프가 돈다.
 */

export type GlobePin = { id: string; lat: number; lng: number; color: string };

export type GlobeScreenPoint = { id: string; x: number; y: number; visible: boolean };

export type GlobeHandle = {
  setPins: (pins: GlobePin[]) => void;
  rotateBy: (dLng: number, dLat: number) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

const DEG = Math.PI / 180;
const CAMERA_DISTANCE = 3.9;
/** 유럽과 동아시아가 함께 들어오는 기본 시점 */
const HOME_VIEW = { lng: 72, lat: 30 };
const MAX_LAT = 60;

export function latLngToVector(lat: number, lng: number, radius = 1): THREE.Vector3 {
  const phi = lat * DEG;
  const lambda = lng * DEG;
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lambda),
  );
}

/**
 * 핀들이 모두 보이는 시점: 가장 멀리 떨어진 두 핀의 한가운데를 정면에 둔다.
 * (무게중심을 쓰면 한쪽에 몰린 핀들 때문에 반대편 핀이 화면 밖으로 밀린다.)
 * 보이는 범위는 정면에서 약 75° — 두 핀이 150° 넘게 떨어지면 다 담을 수 없다.
 */
export function viewForPins(pins: { lat: number; lng: number }[]): { lng: number; lat: number } {
  if (pins.length === 0) return HOME_VIEW;
  const vectors = pins.map((pin) => latLngToVector(pin.lat, pin.lng));
  let a = vectors[0];
  let b = vectors[0];
  let widest = 0;
  for (const p of vectors) {
    for (const q of vectors) {
      const angle = p.angleTo(q);
      if (angle > widest) [widest, a, b] = [angle, p, q];
    }
  }
  const mid = a.clone().add(b);
  if (mid.length() < 0.2) return HOME_VIEW; // 정반대편이면 가운데가 없다
  mid.normalize();
  return {
    lng: Math.atan2(mid.x, mid.z) / DEG,
    lat: Math.max(-MAX_LAT, Math.min(MAX_LAT, Math.asin(mid.y) / DEG)),
  };
}

export function createGlobe(
  canvas: HTMLCanvasElement,
  coast: number[][],
  opts: { animate: boolean; onFrame: (points: GlobeScreenPoint[]) => void },
): GlobeHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(0, 0, CAMERA_DISTANCE);

  const globe = new THREE.Group();
  globe.rotation.order = "XYZ";
  scene.add(globe);

  // 테두리 — 뒤집힌 큰 구가 가장자리에만 얇게 비친다
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(1.018, 64, 48),
      new THREE.MeshBasicMaterial({ color: 0x4a4032, side: THREE.BackSide }),
    ),
  );
  globe.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 48),
      new THREE.MeshBasicMaterial({ color: 0x13110e }),
    ),
  );

  // 경위선 30°
  const grid: number[] = [];
  const pushArc = (from: THREE.Vector3, to: THREE.Vector3) =>
    grid.push(from.x, from.y, from.z, to.x, to.y, to.z);
  for (let lng = -180; lng < 180; lng += 30) {
    for (let lat = -80; lat < 80; lat += 4) {
      pushArc(latLngToVector(lat, lng, 1.001), latLngToVector(lat + 4, lng, 1.001));
    }
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lng = -180; lng < 180; lng += 4) {
      pushArc(latLngToVector(lat, lng, 1.001), latLngToVector(lat, lng + 4, 1.001));
    }
  }
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(grid, 3));
  globe.add(
    new THREE.LineSegments(
      gridGeometry,
      new THREE.LineBasicMaterial({ color: 0xcbb89a, transparent: true, opacity: 0.09 }),
    ),
  );

  // 해안선
  const coastPositions: number[] = [];
  for (const line of coast) {
    for (let i = 0; i + 3 < line.length; i += 2) {
      const a = latLngToVector(line[i + 1], line[i], 1.002);
      const b = latLngToVector(line[i + 3], line[i + 2], 1.002);
      coastPositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const coastGeometry = new THREE.BufferGeometry();
  coastGeometry.setAttribute("position", new THREE.Float32BufferAttribute(coastPositions, 3));
  globe.add(
    new THREE.LineSegments(
      coastGeometry,
      new THREE.LineBasicMaterial({ color: 0xd8c8a8, transparent: true, opacity: 0.62 }),
    ),
  );

  const pinGroup = new THREE.Group();
  globe.add(pinGroup);
  const dotGeometry = new THREE.SphereGeometry(0.02, 16, 12);
  const ringGeometry = new THREE.RingGeometry(0.036, 0.043, 40);
  let pins: GlobePin[] = [];

  function clearPins() {
    for (const child of [...pinGroup.children]) {
      pinGroup.remove(child);
      const mesh = child as THREE.Mesh | THREE.Line;
      if (mesh.geometry !== dotGeometry && mesh.geometry !== ringGeometry) mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  }

  const view = { ...HOME_VIEW };
  const target = { ...HOME_VIEW };
  let raf = 0;
  let disposed = false;

  function applyView() {
    globe.rotation.set(view.lat * DEG, -view.lng * DEG, 0);
  }

  function render() {
    raf = 0;
    if (disposed) return;
    // 가까운 쪽으로 돈다 (경도는 원형)
    const dLng = ((target.lng - view.lng + 540) % 360) - 180;
    const dLat = target.lat - view.lat;
    const moving = Math.abs(dLng) > 0.05 || Math.abs(dLat) > 0.05;
    if (moving && opts.animate) {
      view.lng += dLng * 0.12;
      view.lat += dLat * 0.12;
    } else {
      view.lng = target.lng;
      view.lat = target.lat;
    }
    applyView();
    renderer.render(scene, camera);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    globe.updateMatrixWorld();
    opts.onFrame(
      pins.map((pin) => {
        const world = latLngToVector(pin.lat, pin.lng, 1.01).applyMatrix4(globe.matrixWorld);
        // 구의 지평선: 카메라 거리 d일 때 z > 1/d 인 점만 앞면
        const visible = world.z > 1 / CAMERA_DISTANCE + 0.04;
        const ndc = world.project(camera);
        return {
          id: pin.id,
          x: ((ndc.x + 1) / 2) * width,
          y: ((1 - ndc.y) / 2) * height,
          visible,
        };
      }),
    );
    if (moving && opts.animate) invalidate();
  }

  function invalidate() {
    if (!raf && !disposed) raf = requestAnimationFrame(render);
  }

  applyView();

  return {
    setPins(next) {
      pins = next;
      clearPins();
      const now = new THREE.Color(0xd9c7a3);
      for (const pin of pins) {
        const color = new THREE.Color(pin.color);
        const dot = new THREE.Mesh(dotGeometry, new THREE.MeshBasicMaterial({ color }));
        dot.position.copy(latLngToVector(pin.lat, pin.lng, 1.012));
        pinGroup.add(dot);
        const ring = new THREE.Mesh(
          ringGeometry,
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
          }),
        );
        ring.position.copy(latLngToVector(pin.lat, pin.lng, 1.006));
        ring.lookAt(ring.position.clone().multiplyScalar(2));
        pinGroup.add(ring);
      }
      // 같은 시간을 잇는 호 — 경도 순으로 이웃끼리
      const ordered = [...pins].sort((a, b) => a.lng - b.lng);
      for (let i = 0; i + 1 < ordered.length; i += 1) {
        const a = latLngToVector(ordered[i].lat, ordered[i].lng);
        const b = latLngToVector(ordered[i + 1].lat, ordered[i + 1].lng);
        const angle = a.angleTo(b);
        if (angle < 0.02) continue;
        const points: THREE.Vector3[] = [];
        for (let step = 0; step <= 48; step += 1) {
          const t = step / 48;
          // 구면 선형 보간 + 가운데를 살짝 띄운다
          const p = a
            .clone()
            .multiplyScalar(Math.sin((1 - t) * angle))
            .add(b.clone().multiplyScalar(Math.sin(t * angle)))
            .divideScalar(Math.sin(angle));
          points.push(p.multiplyScalar(1.01 + 0.5 * angle * 0.22 * Math.sin(Math.PI * t)));
        }
        pinGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: now, transparent: true, opacity: 0.5 }),
          ),
        );
      }
      Object.assign(target, viewForPins(pins));
      invalidate();
    },
    rotateBy(dLng, dLat) {
      target.lng = view.lng = view.lng + dLng;
      target.lat = view.lat = Math.max(-MAX_LAT, Math.min(MAX_LAT, view.lat + dLat));
      invalidate();
    },
    resize(width, height) {
      if (width < 1 || height < 1) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      invalidate();
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      clearPins();
      dotGeometry.dispose();
      ringGeometry.dispose();
      gridGeometry.dispose();
      coastGeometry.dispose();
      renderer.dispose();
    },
  };
}
