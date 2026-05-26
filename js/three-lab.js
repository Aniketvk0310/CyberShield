/* Three.js cyber lab scene */
(() => {
  const container = document.getElementById("three-container");
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1020);
  scene.fog = new THREE.Fog(0x0b1020, 6, 20);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.6, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 4;
  controls.maxDistance = 10;

  const ambient = new THREE.AmbientLight(0x66ccff, 0.6);
  const key = new THREE.PointLight(0x27e0ff, 1.2);
  key.position.set(3, 5, 4);
  const rim = new THREE.PointLight(0x8b5cff, 0.8);
  rim.position.set(-4, -2, -3);
  scene.add(ambient, key, rim);

  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 2.5);
  shieldShape.bezierCurveTo(1.6, 2.6, 2.4, 1.4, 2.1, 0.2);
  shieldShape.bezierCurveTo(1.8, -1.6, 0.9, -2.6, 0, -3.1);
  shieldShape.bezierCurveTo(-0.9, -2.6, -1.8, -1.6, -2.1, 0.2);
  shieldShape.bezierCurveTo(-2.4, 1.4, -1.6, 2.6, 0, 2.5);

  const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, {
    depth: 0.6,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.15,
    bevelSegments: 2,
  });

  const shieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x27e0ff,
    metalness: 0.6,
    roughness: 0.25,
    emissive: 0x0b2e3f,
    emissiveIntensity: 0.7,
  });

  const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
  shield.rotation.x = -0.15;
  scene.add(shield);

  const ringGeometry = new THREE.TorusGeometry(2.8, 0.05, 16, 100);
  const ringMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5cff, emissive: 0x281a6d });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  const grid = new THREE.GridHelper(12, 24, 0x1e3355, 0x0b162d);
  grid.position.y = -3;
  scene.add(grid);

  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();
    shield.rotation.y += 0.003;
    shield.position.y = Math.sin(elapsed) * 0.08;
    ring.rotation.z -= 0.002;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
})();
