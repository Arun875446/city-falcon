import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";

// Debug
const gui = new GUI();
gui.hide();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({
    color: "pink",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("white", 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(0, 5, 3);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const resizeHandler = () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener("resize", resizeHandler);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(20, 7.4, 11.8);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * GLTF Loader
 */
const gltfLoader = new GLTFLoader();
let city = null;

gltfLoader.load("/models/VirtualCity/VirtualCity.gltf", (gltf) => {
  city = gltf.scene;
  city.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(city);
});

let mixer = null;
let action1 = null;
gltfLoader.load("/models/Man/CesiumMan.gltf", (gltf) => {
  mixer = new THREE.AnimationMixer(gltf.scene);

  action1 = mixer.clipAction(gltf.animations[0]);

  action1.play();
  scene.add(gltf.scene);
});

/**
 * Particles
 */
const particleCount = 1000;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 30; // x
  particlePositions[i * 3 + 1] = Math.random() * 10; // y
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  color: "white",
  transparent: true,
  opacity: 0.8,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

/**
 * Animation
 */
const clock = new THREE.Clock();
const particleSpeed = 0.02;

/**
 * GUI for Camera Controls
 */
const cameraFolder = gui.addFolder("Camera Controls");

const swiper = cameraFolder.addFolder("Swiper");
swiper.add(camera.position, "x").min(-10).max(20).step(0.1).name("X Axis");

const elevate = cameraFolder.addFolder("Elevate");
elevate.add(camera.position, "y").min(-10).max(20).step(0.1).name("Y Axis");

const zoomer = cameraFolder.addFolder("Zoomer");
zoomer.add(camera.position, "z").min(-10).max(20).step(0.1).name("Z Axis");

// Close folders by default
swiper.close();
elevate.close();
zoomer.close();

cameraFolder.open();

let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (mixer !== null) {
    mixer.update(deltaTime);
  }

  // camera.position.z = Math.cos(elapsedTime * 0.1) * 21;
  // camera.position.x = Math.sin(elapsedTime * 0.1) * 20;

  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= particleSpeed;
    if (positions[i * 3 + 1] < -0.5) {
      positions[i * 3 + 1] = Math.random() * 10;
    }
  }
  particleGeometry.attributes.position.needsUpdate = true;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
