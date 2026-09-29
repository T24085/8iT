import { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  OrthographicCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const logoUrl = `${import.meta.env.BASE_URL}assets/3d/8it-logo-hero.glb`;

function disposeModel(model) {
  model.traverse((object) => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!material) return;
      ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'alphaMap'].forEach((key) => material[key]?.dispose());
      material.dispose();
    });
  });
}

export function HeroLogo3D() {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    scene.add(new AmbientLight(0xffffff, 2.1));
    const key = new DirectionalLight(0xffffff, 2.4);
    key.position.set(-3, 5, 8);
    scene.add(key);
    const rim = new DirectionalLight(0xef1531, 2);
    rim.position.set(4, -1, -5);
    scene.add(rim);

    const camera = new OrthographicCamera(-5, 5, 3.5, -3.5, 0.1, 100);
    camera.position.set(0, 0, 16);
    camera.lookAt(0, 0, 0);
    const pivot = new Group();
    scene.add(pivot);

    let disposed = false;
    let model;
    let frame;
    let visible = true;
    let activePointer = null;
    let pointerMoved = false;
    let lastX = 0;
    let lastY = 0;
    let yaw = -0.13;
    let pitch = 0;
    let userControlled = false;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const takeControl = () => {
      if (userControlled) return;
      userControlled = true;
      yaw = pivot.rotation.y;
      pitch = pivot.rotation.x;
      setInteracted(true);
    };

    const onPointerDown = (event) => {
      if (!model || activePointer !== null || (event.pointerType === 'mouse' && (event.button !== 0 || !(event.buttons & 1)))) return;
      activePointer = event.pointerId;
      pointerMoved = false;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event) => {
      if (event.pointerId !== activePointer) return;
      if (event.pointerType === 'mouse' && !(event.buttons & 1)) {
        onPointerEnd(event);
        return;
      }
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      if (!pointerMoved && Math.hypot(deltaX, deltaY) < 8) return;
      if (!pointerMoved) {
        pointerMoved = true;
        takeControl();
        mount.classList.add('is-dragging');
      }
      yaw += deltaX * 0.012;
      pitch = Math.max(-0.55, Math.min(0.55, pitch - deltaY * 0.007));
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onPointerEnd = (event) => {
      if (event.pointerId !== activePointer) return;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      activePointer = null;
      mount.classList.remove('is-dragging');
    };

    const onKeyDown = (event) => {
      if (!model || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      takeControl();
      if (event.key === 'ArrowLeft') yaw -= Math.PI / 12;
      if (event.key === 'ArrowRight') yaw += Math.PI / 12;
      if (event.key === 'ArrowUp') pitch = Math.min(0.55, pitch + Math.PI / 24);
      if (event.key === 'ArrowDown') pitch = Math.max(-0.55, pitch - Math.PI / 24);
      event.preventDefault();
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerEnd);
    renderer.domElement.addEventListener('pointercancel', onPointerEnd);
    mount.addEventListener('keydown', onKeyDown);

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      const aspect = width / height;
      const viewHeight = Math.max(5.3, 8.7 / aspect);
      camera.left = -viewHeight * aspect / 2;
      camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
    observer.observe(mount);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    new GLTFLoader().load(logoUrl, ({ scene: loaded }) => {
      if (disposed) {
        disposeModel(loaded);
        return;
      }
      model = loaded;
      // Blender's XY front face imports into glTF's XZ plane. Face it toward the camera.
      model.rotation.x = Math.PI / 2;
      model.updateMatrixWorld(true);
      const center = new Box3().setFromObject(model).getCenter(new Vector3());
      model.position.sub(center);
      pivot.add(model);
      pivot.rotation.y = -0.13;
      resize();
      setReady(true);
    }, undefined, () => {
      // The official flat mark remains visible if the model cannot load.
    });

    const start = performance.now();
    const animate = (now) => {
      frame = requestAnimationFrame(animate);
      if (!model || !visible || document.hidden) return;
      pivot.rotation.y = userControlled ? yaw : motion.matches ? -0.13 : -0.13 + Math.sin((now - start) / 2800) * 0.24;
      pivot.rotation.x = userControlled ? pitch : 0;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerEnd);
      renderer.domElement.removeEventListener('pointercancel', onPointerEnd);
      mount.removeEventListener('keydown', onKeyDown);
      if (model) disposeModel(model);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className={`hero__logo-3d${ready ? ' is-ready' : ''}${interacted ? ' is-interacted' : ''}`} role="group" aria-label="Interactive 3D 8iT logo. Drag to rotate, or use the arrow keys." tabIndex={ready ? 0 : -1} ref={mountRef}><img className="hero__logo-fallback" src={`${import.meta.env.BASE_URL}assets/players-hq/8it-logo.png`} alt="" aria-hidden="true" /><span className="hero__logo-hint" aria-hidden="true">DRAG TO ROTATE</span></div>;
}
