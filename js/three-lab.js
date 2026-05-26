/* Three.js cyber lab scene (classic build, resilient) */
(() => {
  const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
  const ORBIT_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js";
  let started = false;

  const container = document.getElementById("three-container");
  if (!container) {
    console.error("CyberShield 3D: container not found.");
    return;
  }

  const showFallback = (message) => {
    container.innerHTML = `
      <div class="d-flex h-100 align-items-center justify-content-center text-center" style="min-height: 320px;">
        <div>
          <div class="badge-soft mb-3"><i class="fa-solid fa-triangle-exclamation"></i> 3D Lab</div>
          <p class="text-muted mb-0">${message}</p>
        </div>
      </div>`;
  };

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing && src === THREE_URL && window.THREE) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  const ensureThree = async () => {
    if (!window.THREE) {
      await loadScript(THREE_URL);
    }
    if (!window.THREE) {
      throw new Error("Three.js failed to load");
    }
    if (!THREE.OrbitControls) {
      try {
        await loadScript(ORBIT_URL);
      } catch (error) {
        console.warn("CyberShield 3D: OrbitControls failed to load.");
      }
    }
  };

  const isWebGLAvailable = () => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (error) {
      return false;
    }
  };

  if (!isWebGLAvailable()) {
    showFallback("WebGL is not supported in this browser.");
    return;
  }

  const getCanvasSize = () => {
    const width = Math.max(1, container.clientWidth || window.innerWidth);
    const height = Math.max(320, container.clientHeight || 420);
    return { width, height };
  };

  const initCyberLab = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);
    scene.fog = new THREE.Fog(0x0b1020, 6, 20);

    const { width, height } = getCanvasSize();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-label", "3D Cyber Lab Scene");

    const existingCanvas = container.querySelector("canvas");
    if (existingCanvas) existingCanvas.remove();
    container.appendChild(renderer.domElement);

    const controlsAvailable = !!THREE.OrbitControls;
    const controls = controlsAvailable ? new THREE.OrbitControls(camera, renderer.domElement) : null;
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 4;
      controls.maxDistance = 10;
      controls.enablePan = false;
      controls.target.set(0, 0.2, 0);
      controls.update();
    }

    // Lighting tuned to keep the model visible on dark backgrounds.
    const ambient = new THREE.AmbientLight(0x66ccff, 0.65);
    const key = new THREE.DirectionalLight(0x27e0ff, 1.1);
    key.position.set(4, 6, 3);
    const fill = new THREE.PointLight(0x8b5cff, 0.7);
    fill.position.set(-3, -1.5, -2);
    const rim = new THREE.PointLight(0x4cff8a, 0.35);
    rim.position.set(0, 4, -5);
    scene.add(ambient, key, fill, rim);

    const core = new THREE.Group();
    scene.add(core);

    const buildShield = () => {
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
      return shield;
    };

    const buildFallbackCore = () => {
      const geometry = new THREE.IcosahedronGeometry(1.7, 1);
      const material = new THREE.MeshStandardMaterial({
        color: 0x27e0ff,
        metalness: 0.5,
        roughness: 0.2,
        emissive: 0x0b2e3f,
        emissiveIntensity: 0.6,
      });
      return new THREE.Mesh(geometry, material);
    };

    let shield;
    try {
      shield = buildShield();
    } catch (error) {
      console.error("CyberShield 3D: primary shield failed, using fallback.", error);
      shield = buildFallbackCore();
    }
    core.add(shield);

    const ringGeometry = new THREE.TorusGeometry(2.8, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cff,
      emissive: 0x281a6d,
      emissiveIntensity: 0.9,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    core.add(ring);

    const grid = new THREE.GridHelper(12, 24, 0x1e3355, 0x0b162d);
    grid.position.y = -3;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((material) => {
      material.opacity = 0.45;
      material.transparent = true;
    });
    scene.add(grid);

    // Simple drag controls if OrbitControls is unavailable.
    if (!controls) {
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;
      renderer.domElement.addEventListener("pointerdown", (event) => {
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
      });
      window.addEventListener("pointerup", () => {
        isDragging = false;
      });
      window.addEventListener("pointermove", (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        core.rotation.y += deltaX * 0.005;
        core.rotation.x = Math.max(-0.6, Math.min(0.6, core.rotation.x + deltaY * 0.004));
      });
      renderer.domElement.addEventListener("wheel", (event) => {
        const nextZ = camera.position.z + Math.sign(event.deltaY) * 0.4;
        camera.position.z = Math.max(4, Math.min(10, nextZ));
      });
    }

    let rafId;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      shield.rotation.y += 0.003;
      shield.position.y = Math.sin(elapsed) * 0.08;
      ring.rotation.z -= 0.002;
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const size = getCanvasSize();
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height, false);
    };

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", handleResize);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden && !rafId) {
        clock.getDelta();
        animate();
      }
    });
  };

  const start = async () => {
    if (started) return;
    started = true;
    try {
      // Load missing Three.js scripts if the CDN is blocked or slow.
      await ensureThree();
      initCyberLab();
    } catch (error) {
      console.error("3D Engine Error:", error);
      showFallback("3D engine failed to load. Please refresh the page.");
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
